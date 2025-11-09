const User = require('../models/User');
const BalanceLog = require('../models/BalanceLog');
const SystemConfig = require('../models/SystemConfig');

class CommissionService {
  /**
   * 计算并发放推荐佣金
   * @param {Object} user - 消费用户
   * @param {Object} order - 订单信息
   * @param {String} type - 订单类型：points/vip
   */
  async calculateCommission(user, order, type = 'points') {
    try {
      // 获取系统配置
      const config = await SystemConfig.findOne();
      if (!config || !config.points.enableCommission) {
        console.log('佣金功能未启用');
        return;
      }

      // 检查是否有推荐人
      if (!user.referredBy) {
        console.log(`用户 ${user.username} 没有推荐人`);
        return;
      }

      const commissionLevels = config.points.commissionLevels || 1;
      const orderAmount = order.amount;

      // 一级推荐人
      await this.processLevelCommission(
        user.referredBy,
        user._id,
        orderAmount,
        config.points.commissionRate,
        1,
        type
      );

      // 二级推荐人
      if (commissionLevels >= 2) {
        const firstLevelReferrer = await User.findById(user.referredBy);
        if (firstLevelReferrer && firstLevelReferrer.referredBy) {
          await this.processLevelCommission(
            firstLevelReferrer.referredBy,
            user._id,
            orderAmount,
            config.points.secondLevelCommissionRate,
            2,
            type
          );
        }
      }

      // 三级推荐人
      if (commissionLevels >= 3) {
        const firstLevelReferrer = await User.findById(user.referredBy);
        if (firstLevelReferrer && firstLevelReferrer.referredBy) {
          const secondLevelReferrer = await User.findById(firstLevelReferrer.referredBy);
          if (secondLevelReferrer && secondLevelReferrer.referredBy) {
            await this.processLevelCommission(
              secondLevelReferrer.referredBy,
              user._id,
              orderAmount,
              config.points.thirdLevelCommissionRate,
              3,
              type
            );
          }
        }
      }

      console.log(`✅ 佣金计算完成 - 用户: ${user.username}, 订单金额: $${orderAmount.toFixed(2)}`);
    } catch (error) {
      console.error('计算佣金失败:', error);
      throw error;
    }
  }

  /**
   * 处理单级佣金
   * @param {ObjectId} referrerId - 推荐人ID
   * @param {ObjectId} consumerId - 消费者ID
   * @param {Number} orderAmount - 订单金额
   * @param {Number} rate - 佣金比例
   * @param {Number} level - 推荐级别
   * @param {String} type - 订单类型
   */
  async processLevelCommission(referrerId, consumerId, orderAmount, rate, level, type) {
    try {
      const referrer = await User.findById(referrerId);
      if (!referrer) {
        console.log(`推荐人不存在: ${referrerId}`);
        return;
      }

      // 计算佣金金额
      const commissionAmount = orderAmount * (rate / 100);
      if (commissionAmount <= 0) {
        return;
      }

      // 增加推荐人的佣金
      const commissionBefore = referrer.commission;
      referrer.commission += commissionAmount;
      await referrer.save();

      // 记录佣金日志
      await BalanceLog.create({
        userId: referrer._id,
        type: 'commission',
        currency: 'commission',
        amount: commissionAmount,
        balanceBefore: commissionBefore,
        balanceAfter: referrer.commission,
        relatedUserId: consumerId,
        description: `${level}级推荐佣金 - ${type === 'points' ? '积分充值' : 'VIP充值'} ¥${orderAmount.toFixed(2)}`
      });

      console.log(`✅ ${level}级佣金发放成功 - 推荐人: ${referrer.username}, 金额: $${commissionAmount.toFixed(2)}`);
    } catch (error) {
      console.error(`处理${level}级佣金失败:`, error);
      throw error;
    }
  }

  /**
   * 获取用户的佣金统计
   * @param {ObjectId} userId - 用户ID
   */
  async getCommissionStats(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      // 获取佣金记录
      const commissionLogs = await BalanceLog.find({
        userId: userId,
        type: 'commission',
        currency: 'commission'
      }).sort({ createdAt: -1 });

      // 计算总佣金
      const totalCommission = commissionLogs.reduce((sum, log) => sum + log.amount, 0);

      // 获取被推荐用户数量
      const referredUsers = await User.countDocuments({ referredBy: userId });

      return {
        currentCommission: user.commission,
        totalEarned: totalCommission,
        totalWithdrawn: totalCommission - user.commission,
        referredUsers: referredUsers,
        recentLogs: commissionLogs.slice(0, 10)
      };
    } catch (error) {
      console.error('获取佣金统计失败:', error);
      throw error;
    }
  }
}

module.exports = new CommissionService();
