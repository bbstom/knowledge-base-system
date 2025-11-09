const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const User = require('../models/User');
const WithdrawOrder = require('../models/WithdrawOrder');

async function testAdminWithdrawAPI() {
  try {
    console.log('🔍 测试管理员提现API数据...\n');

    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    // 查找管理员用户
    const admin = await User.findOne({ email: 'kailsay@gmail.com' });
    if (!admin) {
      console.log('❌ 未找到管理员用户');
      return;
    }
    console.log('✅ 管理员用户:', admin.username);
    console.log('   角色:', admin.role);
    console.log('');

    // 获取所有提现订单
    const withdrawals = await WithdrawOrder.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .lean();

    console.log('📊 提现订单总数:', withdrawals.length);
    console.log('');

    if (withdrawals.length > 0) {
      console.log('📋 提现订单列表:');
      withdrawals.forEach((order, index) => {
        console.log(`\n订单 ${index + 1}:`);
        console.log('  订单号:', order.orderNo);
        console.log('  用户:', order.userId?.username || 'N/A');
        console.log('  邮箱:', order.userId?.email || 'N/A');
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
    }

    // 统计各状态数量
    const statusStats = await WithdrawOrder.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    console.log('\n📈 按状态统计:');
    statusStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}条, 总金额: $${stat.totalAmount}`);
    });

    console.log('\n✅ 测试完成');
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n⚠️  数据库连接已关闭');
  }
}

testAdminWithdrawAPI();
