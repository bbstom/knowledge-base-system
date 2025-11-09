const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const User = require('../models/User');
const WithdrawOrder = require('../models/WithdrawOrder');

async function testUserWithdrawHistory() {
  try {
    console.log('🔍 测试用户提现记录...\n');

    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    // 查找用户
    const user = await User.findOne({ email: 'kailsay@gmail.com' });
    if (!user) {
      console.log('❌ 未找到用户');
      return;
    }
    console.log('✅ 用户信息:');
    console.log('   用户名:', user.username);
    console.log('   邮箱:', user.email);
    console.log('   用户ID:', user._id);
    console.log('   当前佣金:', user.commission);
    console.log('');

    // 查询该用户的提现记录
    const withdrawals = await WithdrawOrder.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    console.log('📊 提现记录总数:', withdrawals.length);
    console.log('');

    if (withdrawals.length > 0) {
      console.log('📋 提现记录列表:');
      withdrawals.forEach((order, index) => {
        console.log(`\n记录 ${index + 1}:`);
        console.log('  订单号:', order.orderNo);
        console.log('  类型:', order.type);
        console.log('  金额:', order.amount);
        console.log('  手续费:', order.fee);
        console.log('  实际金额:', order.actualAmount);
        console.log('  钱包地址:', order.walletAddress);
        console.log('  状态:', order.status);
        console.log('  创建时间:', new Date(order.createdAt).toLocaleString());
        if (order.processedAt) {
          console.log('  处理时间:', new Date(order.processedAt).toLocaleString());
        }
        if (order.txHash) {
          console.log('  交易哈希:', order.txHash);
        }
        if (order.remark) {
          console.log('  备注:', order.remark);
        }
      });
    } else {
      console.log('⚠️  该用户没有提现记录');
    }

    // 按状态统计
    const statusCounts = {
      pending: 0,
      completed: 0,
      rejected: 0
    };
    
    withdrawals.forEach(order => {
      if (statusCounts.hasOwnProperty(order.status)) {
        statusCounts[order.status]++;
      }
    });

    console.log('\n📈 按状态统计:');
    console.log('  pending:', statusCounts.pending);
    console.log('  completed:', statusCounts.completed);
    console.log('  rejected:', statusCounts.rejected);

    console.log('\n✅ 测试完成');
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n⚠️  数据库连接已关闭');
  }
}

testUserWithdrawHistory();
