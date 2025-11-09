const mongoose = require('mongoose');
const User = require('../models/User');

// 直接连接MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/knowbase';

async function checkReferralData() {
  try {
    console.log('🔍 检查推荐数据...\n');

    // 连接数据库
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    // 查找测试用户
    const user = await User.findOne({ email: 'kailsay@gmail.com' });
    if (!user) {
      console.log('❌ 未找到用户');
      return;
    }

    console.log('👤 用户信息:');
    console.log('   用户名:', user.username);
    console.log('   邮箱:', user.email);
    console.log('   推荐码:', user.referralCode);
    console.log('   佣金:', user.commission);
    console.log('   推荐人ID:', user.referredBy || '无');
    console.log('');

    // 查找该用户推荐的所有用户
    const referredUsers = await User.find({ referredBy: user._id })
      .select('username email createdAt commission')
      .lean();

    console.log('📊 推荐用户统计:');
    console.log('   推荐用户总数:', referredUsers.length);
    console.log('');

    if (referredUsers.length > 0) {
      console.log('📋 推荐用户列表:');
      referredUsers.forEach((refUser, index) => {
        console.log(`\n用户 ${index + 1}:`);
        console.log('  用户名:', refUser.username);
        console.log('  邮箱:', refUser.email);
        console.log('  注册时间:', new Date(refUser.createdAt).toLocaleString());
        console.log('  佣金:', refUser.commission);
      });
    } else {
      console.log('⚠️  该用户还没有推荐任何用户');
    }

    // 查找所有有推荐关系的用户
    const allReferrals = await User.find({ referredBy: { $exists: true, $ne: null } })
      .select('username email referredBy createdAt')
      .populate('referredBy', 'username email')
      .lean();

    console.log('\n\n📈 系统推荐关系统计:');
    console.log('   有推荐人的用户总数:', allReferrals.length);
    
    if (allReferrals.length > 0) {
      console.log('\n所有推荐关系:');
      allReferrals.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.username} 被 ${user.referredBy?.username || '未知'} 推荐`);
        console.log('   注册时间:', new Date(user.createdAt).toLocaleString());
      });
    }

    console.log('\n✅ 检查完成');
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n⚠️  数据库连接已关闭');
  }
}

checkReferralData();
