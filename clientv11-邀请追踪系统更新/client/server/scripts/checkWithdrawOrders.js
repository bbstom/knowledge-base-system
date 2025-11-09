const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { userConnection } = require('../config/database');
const WithdrawOrder = require('../models/WithdrawOrder');
const User = require('../models/User');

async function checkWithdrawOrders() {
  try {
    console.log('🔍 检查提现订单...\n');

    // 查找所有提现订单
    const orders = await WithdrawOrder.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'username email');

    console.log('📊 提现订单总数:', await WithdrawOrder.countDocuments());
    console.log('📊 最近10条订单:\n');

    if (orders.length === 0) {
      console.log('❌ 没有找到任何提现订单');
    } else {
      orders.forEach((order, index) => {
        console.log(`订单 ${index + 1}:`);
        console.log('  订单号:', order.orderNo);
        console.log('  用户:', order.userId?.username || order.userId);
        console.log('  类型:', order.type);
        console.log('  金额:', order.amount);
        console.log('  手续费:', order.fee);
        console.log('  实际金额:', order.actualAmount);
        console.log('  钱包地址:', order.walletAddress);
        console.log('  状态:', order.status);
        console.log('  创建时间:', order.createdAt);
        console.log('');
      });
    }

    // 按状态统计
    const statusCounts = await WithdrawOrder.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('📈 按状态统计:');
    statusCounts.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });

  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await userConnection.close();
    process.exit(0);
  }
}

checkWithdrawOrders();
