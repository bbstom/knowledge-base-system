/**
 * 手动更新订单状态（用于测试）
 * 使用方法: node server/scripts/manualUpdateOrder.js ORDER_ID
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const RechargeOrder = require('../models/RechargeOrder');
const User = require('../models/User');
const BalanceLog = require('../models/BalanceLog');

async function updateOrderStatus(orderId) {
  try {
    // 连接数据库
    await mongoose.connect(process.env.USER_MONGO_URI);
    console.log('✅ 数据库连接成功');

    // 查找订单
    const order = await RechargeOrder.findOne({ orderId });
    if (!order) {
      console.error('❌ 订单不存在:', orderId);
      process.exit(1);
    }

    console.log('📦 找到订单:', {
      orderId: order.orderId,
      amount: order.amount,
      status: order.status,
      userId: order.userId
    });

    if (order.status === 'paid') {
      console.log('⚠️  订单已经是已支付状态');
      process.exit(0);
    }

    // 更新订单状态
    order.status = 'paid';
    order.txHash = 'MANUAL_TEST_' + Date.now();
    order.paidAt = new Date();
    await order.save();

    console.log('✅ 订单状态已更新为已支付');

    // 获取用户
    const user = await User.findById(order.userId);
    if (!user) {
      console.error('❌ 用户不存在');
      process.exit(1);
    }

    console.log('👤 用户信息:', {
      username: user.username,
      balance: user.balance,
      points: user.points
    });

    // 根据订单类型处理
    if (order.type === 'points') {
      const pointsBefore = user.points;
      user.points += order.points;
      user.totalRecharged += order.amount;
      await user.save();

      // 记录积分变动
      await new BalanceLog({
        userId: user._id,
        type: 'recharge',
        currency: 'points',
        amount: order.points,
        balanceBefore: pointsBefore,
        balanceAfter: user.points,
        orderId: order.orderId,
        description: `充值${order.points}积分`
      }).save();

      console.log('✅ 积分已到账:', {
        充值前: pointsBefore,
        充值后: user.points,
        增加: order.points
      });
    } else if (order.type === 'vip') {
      user.extendVip(order.vipDays);
      user.totalRecharged += order.amount;
      await user.save();

      console.log('✅ VIP已开通:', {
        天数: order.vipDays,
        到期时间: user.vipExpireAt
      });
    }

    console.log('\n🎉 订单处理完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

// 获取命令行参数
const orderId = process.argv[2];

if (!orderId) {
  console.error('❌ 请提供订单ID');
  console.log('使用方法: node server/scripts/manualUpdateOrder.js ORDER_ID');
  process.exit(1);
}

updateOrderStatus(orderId);
