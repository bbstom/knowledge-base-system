require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const BalanceLog = require('../models/BalanceLog');

async function backfillSingleUser() {
  try {
    console.log('🔍 开始为用户补充积分记录...\n');

    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/knowbase');
    console.log('✅ 数据库连接成功\n');

    // 查找用户
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

    // 检查是否已有记录
    const hasLog = await BalanceLog.findOne({
      userId: user._id,
      currency: 'points'
    });

    if (hasLog) {
      console.log('⚠️  用户已有积分记录，无需补充');
      console.log('   记录类型:', hasLog.type);
      console.log('   记录金额:', hasLog.amount);
      console.log('   记录时间:', new Date(hasLog.createdAt).toLocaleString());
      return;
    }

    // 创建记录
    const log = await BalanceLog.create({
      userId: user._id,
      type: 'register',
      currency: 'points',
      amount: user.points,
      balanceBefore: 0,
      balanceAfter: user.points,
      description: '注册奖励（补录）',
      createdAt: user.createdAt
    });

    console.log('✅ 积分记录补充成功！');
    console.log('   记录ID:', log._id);
    console.log('   类型:', log.type);
    console.log('   金额:', log.amount);
    console.log('   描述:', log.description);
    console.log('');
    console.log('💡 现在用户登录后应该能在积分中心看到这条记录了');

  } catch (error) {
    console.error('❌ 补充失败:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n⚠️  数据库连接已关闭');
  }
}

backfillSingleUser();
