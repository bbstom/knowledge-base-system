const LotteryActivity = require('../models/LotteryActivity');
const LotteryRecord = require('../models/LotteryRecord');
const User = require('../models/User');
const BalanceLog = require('../models/BalanceLog');

class LotteryService {
  /**
   * 检查用户今日抽奖次数
   */
  async checkDailyLimit(userId, activityId, dailyLimit) {
    if (dailyLimit === 0) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await LotteryRecord.countDocuments({
      userId,
      activityId,
      createdAt: { $gte: today }
    });

    return count < dailyLimit;
  }

  /**
   * 抽奖算法 - 加权随机
   */
  drawPrize(prizes) {
    // 过滤有库存的奖品
    const availablePrizes = prizes.filter(p => 
      p.quantity === -1 || p.quantity > 0
    );

    if (availablePrizes.length === 0) {
      // 没有可用奖品，返回谢谢参与
      return prizes.find(p => p.type === 'thanks') || null;
    }

    // 计算总概率
    const totalProbability = availablePrizes.reduce(
      (sum, p) => sum + p.probability, 0
    );

    // 生成随机数 0 到 totalProbability
    const random = Math.random() * totalProbability;

    // 根据概率区间确定中奖奖品
    let cumulative = 0;
    for (const prize of availablePrizes) {
      cumulative += prize.probability;
      if (random < cumulative) {
        return prize;
      }
    }

    // 理论上不应该到这里，但作为保险返回最后一个奖品
    return availablePrizes[availablePrizes.length - 1];
  }

  /**
   * 执行抽奖
   */
  async performDraw(userId, activityId) {
    // 1. 获取活动信息
    const activity = await LotteryActivity.findById(activityId);
    if (!activity) {
      throw new Error('活动不存在');
    }

    if (!activity.isActive) {
      throw new Error('活动未启用');
    }

    // 2. 检查活动时间
    const now = new Date();
    if (now < activity.startTime || now > activity.endTime) {
      throw new Error('活动未在有效期内');
    }

    // 3. 检查用户资格
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 检查是否充值过
    if (!user.totalRecharged || user.totalRecharged <= 0) {
      throw new Error('仅限充值用户参与抽奖');
    }

    // 检查积分
    if (user.points < activity.costPoints) {
      throw new Error('积分不足');
    }

    // 4. 检查每日次数限制
    const canDraw = await this.checkDailyLimit(userId, activityId, activity.dailyLimit);
    if (!canDraw) {
      throw new Error('今日抽奖次数已用完');
    }

    // 5. 执行抽奖
    const prize = this.drawPrize(activity.prizes);
    if (!prize) {
      throw new Error('抽奖失败，请稍后重试');
    }

    // 6. 扣除积分
    user.points -= activity.costPoints;
    await user.save();

    // 7. 记录积分变动
    await BalanceLog.create({
      userId: user._id,
      type: 'lottery',
      amount: -activity.costPoints,
      balance: user.points,
      description: `参与抽奖活动：${activity.name}`
    });

    // 8. 更新奖品库存
    if (prize.quantity > 0) {
      const prizeIndex = activity.prizes.findIndex(p => p._id.toString() === prize._id.toString());
      if (prizeIndex !== -1) {
        activity.prizes[prizeIndex].quantity -= 1;
      }
    }

    // 9. 更新活动统计
    activity.totalDraws += 1;
    if (prize.type !== 'thanks') {
      activity.totalWinners += 1;
    }
    await activity.save();

    // 10. 创建抽奖记录
    const record = await LotteryRecord.create({
      userId: user._id,
      activityId: activity._id,
      prizeId: prize._id.toString(),
      prizeName: prize.name,
      prizeType: prize.type,
      prizeValue: prize.value,
      costPoints: activity.costPoints,
      status: prize.type === 'thanks' ? 'claimed' : 'pending'
    });

    // 11. 自动发放奖品（积分和VIP）
    if (prize.type === 'points') {
      await this.claimPointsPrize(record._id);
    } else if (prize.type === 'vip') {
      await this.claimVIPPrize(record._id);
    }

    return { prize, record };
  }

  /**
   * 领取积分奖品
   */
  async claimPointsPrize(recordId) {
    const record = await LotteryRecord.findById(recordId);
    if (!record || record.status !== 'pending') {
      throw new Error('记录不存在或已领取');
    }

    const user = await User.findById(record.userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 发放积分
    user.points += record.prizeValue;
    await user.save();

    // 记录积分变动
    await BalanceLog.create({
      userId: user._id,
      type: 'lottery_reward',
      amount: record.prizeValue,
      balance: user.points,
      description: `抽奖奖励：${record.prizeName}`
    });

    // 更新记录状态
    record.status = 'claimed';
    record.claimedAt = new Date();
    await record.save();

    return record;
  }

  /**
   * 领取VIP奖品
   */
  async claimVIPPrize(recordId) {
    const record = await LotteryRecord.findById(recordId);
    if (!record || record.status !== 'pending') {
      throw new Error('记录不存在或已领取');
    }

    const user = await User.findById(record.userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 延长VIP
    const now = new Date();
    const vipExpiry = user.vipExpiry && user.vipExpiry > now ? new Date(user.vipExpiry) : now;
    vipExpiry.setDate(vipExpiry.getDate() + record.prizeValue);
    
    user.vipExpiry = vipExpiry;
    user.isVIP = true;
    await user.save();

    // 更新记录状态
    record.status = 'claimed';
    record.claimedAt = new Date();
    await record.save();

    return record;
  }

  /**
   * 领取实物奖品
   */
  async claimPhysicalPrize(recordId, shippingInfo) {
    const record = await LotteryRecord.findById(recordId);
    if (!record || record.status !== 'pending') {
      throw new Error('记录不存在或已领取');
    }

    if (!shippingInfo || !shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      throw new Error('请填写完整的收货信息');
    }

    // 保存收货信息
    record.shippingInfo = shippingInfo;
    record.status = 'claimed';
    record.claimedAt = new Date();
    await record.save();

    return record;
  }
}

module.exports = new LotteryService();
