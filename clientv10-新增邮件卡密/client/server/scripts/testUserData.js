const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { userConnection } = require('../config/database');
const User = require('../models/User');

async function testUserData() {
  try {
    console.log('✅ 测试用户数据结构\n');

    const email = 'kail.say.one@gmail.com';
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ 未找到用户: ${email}`);
      return;
    }

    console.log('用户完整数据:');
    console.log('==================');
    console.log(JSON.stringify({
      id: user._id,
      username: user.username,
      email: user.email,
      points: user.points,
      balance: user.balance,
      commission: user.commission,
      isVip: user.isVip,
      vipExpireAt: user.vipExpireAt,
      referralCode: user.referralCode,
      role: user.role,
      lastDailyClaimAt: user.lastDailyClaimAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }, null, 2));

    console.log('\n前端应该接收到的数据格式:');
    console.log('==================');
    console.log(JSON.stringify({
      id: user._id,
      username: user.username,
      email: user.email,
      points: user.points,
      balance: user.balance,
      isVip: user.isVip,
      vipExpireAt: user.vipExpireAt,
      referralCode: user.referralCode,
      role: user.role,
      lastDailyClaimAt: user.lastDailyClaimAt,
      createdAt: user.createdAt
    }, null, 2));

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await userConnection.close();
    console.log('\n数据库连接已关闭');
  }
}

testUserData();
