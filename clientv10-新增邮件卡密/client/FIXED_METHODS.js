// 复制以下三个方法，替换 server/services/rechargeService.js 中对应的方法

/**
 * 添加余额（卡密充值使用）
 */
async addBalance(userId, amount, options = {}) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const balanceBefore = user.balance;

    // 增加余额
    user.balance += amount;
    await user.save();

    // 记录余额日志
    const balanceLog = new BalanceLog({
      userId,
      type: options.type || 'recharge_card',
      currency: 'balance',
      amount,
      balanceBefore,
      balanceAfter: user.balance,
      description: options.description || `卡密充值 +${amount}`
    });
    await balanceLog.save();

    console.log(`✅ 用户 ${userId} 卡密充值成功: +${amount}`);

    return {
      balance: user.balance,
      amount
    };
  } catch (error) {
    console.error('添加余额失败:', error);
    throw error;
  }
}

/**
 * 添加积分（卡密充值使用）
 */
async addPoints(userId, points, options = {}) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const pointsBefore = user.points;

    // 增加积分
    user.points += points;
    await user.save();

    // 记录余额日志
    const balanceLog = new BalanceLog({
      userId,
      type: options.type || 'recharge_card',
      currency: 'points',
      amount: points,
      balanceBefore: pointsBefore,
      balanceAfter: user.points,
      description: options.description || `卡密充值 +${points}积分`
    });
    await balanceLog.save();

    console.log(`✅ 用户 ${userId} 卡密充值成功: +${points}积分`);

    return {
      points: user.points,
      addedPoints: points
    };
  } catch (error) {
    console.error('添加积分失败:', error);
    throw error;
  }
}

/**
 * 添加VIP（卡密充值使用）
 */
async addVIP(userId, days, options = {}) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const now = new Date();
    let newExpireDate;

    if (user.vipExpireDate && user.vipExpireDate > now) {
      // 如果VIP未过期，在现有基础上延长
      newExpireDate = new Date(user.vipExpireDate);
      newExpireDate.setDate(newExpireDate.getDate() + days);
    } else {
      // 如果VIP已过期或没有VIP，从现在开始计算
      newExpireDate = new Date(now);
      newExpireDate.setDate(newExpireDate.getDate() + days);
    }

    const balanceBefore = user.balance;

    user.isVIP = true;
    user.vipExpireDate = newExpireDate;
    await user.save();

    // 记录余额日志
    const balanceLog = new BalanceLog({
      userId,
      type: 'vip',
      currency: 'balance',
      amount: 0,
      balanceBefore,
      balanceAfter: user.balance,
      description: options.description || `卡密充值 +${days}天VIP`
    });
    await balanceLog.save();

    console.log(`✅ 用户 ${userId} 卡密充值成功: +${days}天VIP`);

    return {
      isVIP: user.isVIP,
      vipExpireDate: user.vipExpireDate,
      addedDays: days
    };
  } catch (error) {
    console.error('添加VIP失败:', error);
    throw error;
  }
}
