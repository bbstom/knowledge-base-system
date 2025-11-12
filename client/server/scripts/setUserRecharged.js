const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function setUserRecharged(username, amount = 100) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功');

    const user = await User.findOne({ username });
    if (!user) {
      console.log(`❌ 用户 ${username} 不存在`);
      process.exit(1);
    }

    console.log(`\n📊 当前用户信息:`);
    console.log(`用户名: ${user.username}`);
    console.log(`总充值: ${user.totalRecharged || 0}`);
    console.log(`积分: ${user.points}`);

    // 设置充值金额
    user.totalRecharged = (user.totalRecharged || 0) + amount;
    await user.save();

    console.log(`\n✅ 已设置充值金额: ${amount}`);
    console.log(`📊 更新后总充值: ${user.totalRecharged}`);
    console.log(`\n现在用户 ${username} 可以参与抽奖了！`);

    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

// 从命令行参数获取用户名和金额
const username = process.argv[2] || 'admin';
const amount = parseFloat(process.argv[3]) || 100;

console.log(`\n🎯 设置用户充值记录`);
console.log(`用户名: ${username}`);
console.log(`充值金额: ${amount}\n`);

setUserRecharged(username, amount);
