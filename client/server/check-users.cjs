/**
 * 检查数据库中的用户注册情况
 */

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI_USER);
    console.log('✅ 数据库连接成功\n');

    // 查询 aabb 系列邮箱
    const users = await User.find({
      email: /^aabb\d+@gmail\.com$/i
    }).sort({ createdAt: 1 });

    console.log('📊 找到的用户:');
    console.log('='.repeat(80));

    if (users.length === 0) {
      console.log('❌ 没有找到 aabb*@gmail.com 的用户');
    } else {
      users.forEach((user, index) => {
        console.log(`\n[${index + 1}] ${user.email}`);
        console.log(`    用户名: ${user.username}`);
        console.log(`    注册IP: ${user.registrationIp || '未记录'}`);
        console.log(`    推荐人: ${user.referredBy ? user.referredBy : '无'}`);
        console.log(`    邀请码: ${user.referralCode}`);
        console.log(`    积分: ${user.points}`);
        console.log(`    注册时间: ${user.createdAt}`);
      });

      console.log('\n' + '='.repeat(80));
      console.log(`总计: ${users.length} 个用户\n`);

      // 分析
      const withReferral = users.filter(u => u.referredBy).length;
      const sameIp = users.filter(u => u.registrationIp === users[0].registrationIp).length;

      console.log('📈 分析:');
      console.log(`   - 使用邀请码注册: ${withReferral}/${users.length}`);
      console.log(`   - 相同IP注册: ${sameIp}/${users.length}`);

      if (withReferral === 0) {
        console.log('\n⚠️  这些用户都没有使用邀请码注册！');
        console.log('   反作弊检测只在使用邀请码时才会触发。');
      }

      if (sameIp === users.length && users.length > 1) {
        console.log(`\n⚠️  所有用户都使用相同IP (${users[0].registrationIp}) 注册！`);
        console.log('   如果使用了邀请码，应该会被反作弊拦截。');
      }
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

checkUsers();
