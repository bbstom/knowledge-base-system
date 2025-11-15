/**
 * 简单检查用户注册情况
 */

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

async function checkUsers() {
  try {
    // 直接连接用户数据库
    const mongoUri = process.env.USER_MONGO_URI || process.env.MONGODB_URI_USER;
    if (!mongoUri) {
      console.error('❌ 未找到数据库连接配置');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ 数据库连接成功\n');

    // 定义简单的 User schema
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', userSchema);

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
        console.log(`    推荐人ID: ${user.referredBy || '无'}`);
        console.log(`    邀请码: ${user.referralCode}`);
        console.log(`    积分: ${user.points}`);
        console.log(`    注册时间: ${user.createdAt}`);
      });

      console.log('\n' + '='.repeat(80));
      console.log(`总计: ${users.length} 个用户\n`);

      // 分析
      const withReferral = users.filter(u => u.referredBy).length;
      const uniqueIps = [...new Set(users.map(u => u.registrationIp).filter(Boolean))];

      console.log('📈 分析:');
      console.log(`   - 使用邀请码注册: ${withReferral}/${users.length}`);
      console.log(`   - 不同IP数量: ${uniqueIps.length}`);
      console.log(`   - IP列表: ${uniqueIps.join(', ') || '无'}`);

      if (withReferral === 0) {
        console.log('\n⚠️  这些用户都没有使用邀请码注册！');
        console.log('   💡 反作弊检测只在使用邀请码时才会触发。');
        console.log('   💡 如果不使用邀请码，可以注册任意数量的相似邮箱。');
      } else {
        console.log(`\n✅ 有 ${withReferral} 个用户使用了邀请码`);
      }

      if (uniqueIps.length === 1 && users.length > 1) {
        console.log(`\n⚠️  所有用户都使用相同IP (${uniqueIps[0]}) 注册！`);
        if (withReferral > 0) {
          console.log('   如果使用了同一个邀请码，应该会被反作弊拦截。');
        }
      }
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

checkUsers();
