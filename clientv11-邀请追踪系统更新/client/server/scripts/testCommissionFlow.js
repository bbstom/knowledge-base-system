const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { userConnection } = require('../config/database');
const User = require('../models/User');
const BalanceLog = require('../models/BalanceLog');
const WithdrawOrder = require('../models/WithdrawOrder');

async function testCommissionFlow() {
  try {
    console.log('🔍 测试佣金完整流程...\n');

    // 查找有佣金的用户
    const user = await User.findOne({ commission: { $gt: 0 } });
    
    if (!user) {
      console.log('❌ 没有找到有佣金的用户');
      return;
    }

    console.log('✅ 找到用户:', user.username);
    console.log('   当前佣金:', user.commission);

    // 1. 查询佣金收入记录
    const commissionLogs = await BalanceLog.find({ 
      userId: user._id,
      type: 'commission',
      currency: 'commission'
    }).sort({ createdAt: -1 });

    const totalEarned = commissionLogs.reduce((sum, log) => sum + log.amount, 0);
    console.log('\n📊 佣金收入记录:');
    console.log('   记录数:', commissionLogs.length);
    console.log('   总收入:', totalEarned.toFixed(2));

    // 2. 查询提现订单
    const withdrawOrders = await WithdrawOrder.find({
      userId: user._id,
      type: 'commission'
    }).sort({ createdAt: -1 });

    console.log('\n💸 提现订单:');
    console.log('   订单数:', withdrawOrders.length);

    if (withdrawOrders.length > 0) {
      withdrawOrders.forEach((order, index) => {
        console.log(`\n   订单 ${index + 1}:`);
        console.log('     订单号:', order.orderNo);
        console.log('     金额:', order.amount);
        console.log('     状态:', order.status);
        console.log('     时间:', order.createdAt);
      });
    }

    // 3. 计算各项金额
    const pending = withdrawOrders
      .filter(order => ['pending', 'processing'].includes(order.status))
      .reduce((sum, order) => sum + order.amount, 0);

    const completed = withdrawOrders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + order.amount, 0);

    const rejected = withdrawOrders
      .filter(order => order.status === 'rejected')
      .reduce((sum, order) => sum + order.amount, 0);

    console.log('\n💰 佣金统计:');
    console.log('   当前可用:', user.commission.toFixed(2));
    console.log('   待结算:', pending.toFixed(2));
    console.log('   已提现:', completed.toFixed(2));
    console.log('   已拒绝:', rejected.toFixed(2));
    console.log('   总佣金:', (user.commission + pending + completed).toFixed(2));

    // 4. 数据一致性检查
    console.log('\n🔍 数据一致性:');
    const calculatedTotal = user.commission + pending + completed;
    console.log('   计算总额:', calculatedTotal.toFixed(2));
    console.log('   记录总额:', totalEarned.toFixed(2));
    
    if (Math.abs(calculatedTotal - totalEarned) < 0.01) {
      console.log('   ✅ 数据一致');
    } else {
      console.log('   ⚠️  数据不一致，差额:', (totalEarned - calculatedTotal).toFixed(2));
    }

    // 5. 模拟前端显示
    console.log('\n📱 前端显示:');
    console.log('   总佣金:', (user.commission + pending + completed).toFixed(2));
    console.log('   可提现:', user.commission.toFixed(2));
    console.log('   待结算:', pending.toFixed(2));
    console.log('   已提现:', completed.toFixed(2));

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await userConnection.close();
    process.exit(0);
  }
}

testCommissionFlow();
