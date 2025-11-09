const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 使用数据库配置
const { userConnection } = require('../config/database');
const User = require('../models/User');

async function checkUserVIPStatus() {
  try {
    console.log('✅ 数据库连接成功');

    const email = 'kail.say.one@gmail.com';
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ 未找到用户: ${email}`);
      return;
    }

    console.log('\n用户信息:');
    console.log('==================');
    console.log('用户名:', user.username);
    console.log('邮箱:', user.email);
    console.log('VIP状态:', user.isVip ? '✅ VIP会员' : '❌ 普通用户');
    console.log('VIP到期时间:', user.vipExpireAt ? new Date(user.vipExpireAt).toLocaleString('zh-CN') : '未设置');
    console.log('积分:', user.points);
    console.log('余额:', user.balance);
    console.log('佣金:', user.commission);
    console.log('推荐码:', user.referralCode);
    console.log('注册时间:', new Date(user.createdAt).toLocaleString('zh-CN'));
    console.log('最后签到:', user.lastDailyClaimAt ? new Date(user.lastDailyClaimAt).toLocaleString('zh-CN') : '从未签到');

    // 检查VIP是否过期
    if (user.vipExpireAt) {
      const now = new Date();
      const isExpired = user.vipExpireAt < now;
      console.log('\nVIP状态检查:');
      console.log('当前时间:', now.toLocaleString('zh-CN'));
      console.log('到期时间:', new Date(user.vipExpireAt).toLocaleString('zh-CN'));
      console.log('是否过期:', isExpired ? '❌ 已过期' : '✅ 未过期');
      
      if (isExpired && user.isVip) {
        console.log('\n⚠️  警告: VIP已过期但状态仍为true，需要更新');
        user.isVip = false;
        await user.save();
        console.log('✅ 已更新VIP状态为false');
      }
    }

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await userConnection.close();
    console.log('\n数据库连接已关闭');
  }
}

checkUserVIPStatus();
