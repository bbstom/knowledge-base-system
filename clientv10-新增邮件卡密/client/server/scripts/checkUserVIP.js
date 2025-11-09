/**
 * 检查用户VIP状态
 * 用法: node server/scripts/checkUserVIP.js <username>
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');

async function checkVIP() {
  const username = process.argv[2];
  
  if (!username) {
    console.log('用法: node server/scripts/checkUserVIP.js <username>');
    process.exit(1);
  }
  
  try {
    const user = await User.findOne({ username });
    
    if (!user) {
      console.log(`❌ 用户 ${username} 不存在`);
      process.exit(1);
    }
    
    console.log('\n📊 用户VIP状态:');
    console.log('='.repeat(50));
    console.log(`用户名: ${user.username}`);
    console.log(`用户ID: ${user._id}`);
    console.log(`是否VIP: ${user.isVIP ? '✅ 是' : '❌ 否'}`);
    console.log(`VIP过期时间: ${user.vipExpireDate || '无'}`);
    
    if (user.vipExpireDate) {
      const now = new Date();
      const isExpired = user.vipExpireDate < now;
      console.log(`VIP状态: ${isExpired ? '❌ 已过期' : '✅ 有效'}`);
      
      if (!isExpired) {
        const daysLeft = Math.ceil((user.vipExpireDate - now) / (1000 * 60 * 60 * 24));
        console.log(`剩余天数: ${daysLeft} 天`);
      }
    }
    
    console.log('='.repeat(50));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 检查失败:', error);
    process.exit(1);
  }
}

checkVIP();
