const mongoose = require('mongoose');
const User = require('../models/User');
const BalanceLog = require('../models/BalanceLog');

// 直接连接MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/knowbase';

async function checkUserPointsLog() {
  try {
    console.log('🔍 检查用户积分记录...\n');

    // 连接数据库
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    // 查找测试用户
    const user = await User.findOne({ email: 'aabbk@gmail.com' });
    if (!user) {
      console.log('❌ 未找到用户 aabbk@gmail.com');
      return;
    }

    console.log('👤 用户信息:');
    console.log('   用户名:', user.username);
    console.log('   邮箱:', user.email);
    console.log('   用户ID:', user._id);
    console.log('   当前积分:', user.points);
    console.log('   注册时间:', new Date(user.createdAt).toLocaleString());
    console.log('');

    // 查询该用户的所有积分记录
    const pointsLogs = await BalanceLog.find({
      userId: user._id,
      currency: 'points'
    }).sort({ createdAt: -1 });

    console.log('📊 积分记录总数:', pointsLogs.length);
    console.log('');

    if (pointsLogs.length > 0) {
      console.log('📋 积分记录列表:');
      pointsLogs.forEach((log, index) => {
        console.log(`\n记录 ${index + 1}:`);
        console.log('  类型:', log.type);
        console.log('  金额:', log.amount);
        console.log('  变动前:', log.balanceBefore);
        console.log('  变动后:', log.balanceAfter);
        console.log('  描述:', log.description || '无');
        console.log('  时间:', new Date(log.createdAt).toLocaleString());
      });
    } else {
      console.log('⚠️  该用户没有积分记录');
      console.log('');
      console.log('💡 可能的原因:');
      console.log('   1. 用户在修复前注册，没有创建记录');
      console.log('   2. 服务器没有重启，代码修改未生效');
      console.log('   3. 注册过程中出现错误');
    }

    // 查询所有BalanceLog记录（检查是否有其他用户的记录）
    const allLogs = await BalanceLog.find({ currency: 'points' }).limit(5);
    console.log('\n\n📈 最近5条积分记录（所有用户）:');
    allLogs.forEach((log, index) => {
      console.log(`\n${index + 1}. 用户ID: ${log.userId}`);
      console.log('   类型:', log.type);
      console.log('   金额:', log.amount);
      console.log('   描述:', log.description || '无');
      console.log('   时间:', new Date(log.createdAt).toLocaleString());
    });

    console.log('\n✅ 检查完成');
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n⚠️  数据库连接已关闭');
  }
}

checkUserPointsLog();
