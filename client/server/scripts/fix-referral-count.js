/**
 * 修复用户的 referralCount 字段
 * 
 * 问题：注册时没有更新推荐人的 referralCount 字段
 * 解决：统计每个用户实际推荐的用户数，更新 referralCount
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function fixReferralCount() {
  try {
    console.log('🔧 开始修复 referralCount 字段...\n');

    // 连接数据库
    const mongoUri = process.env.USER_MONGO_URI || process.env.MONGODB_URI_USER || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ 未找到数据库连接配置');
      console.error('请检查 .env 文件中的以下配置之一:');
      console.error('  - USER_MONGO_URI');
      console.error('  - MONGODB_URI_USER');
      console.error('  - MONGODB_URI');
      process.exit(1);
    }

    console.log('🔄 正在连接数据库...');
    await mongoose.connect(mongoUri);
    console.log('✅ 数据库连接成功\n');

    // 获取所有用户
    const allUsers = await User.find({});
    console.log(`📊 总用户数: ${allUsers.length}\n`);

    let fixedCount = 0;
    let unchangedCount = 0;

    // 遍历每个用户，统计其推荐的用户数
    for (const user of allUsers) {
      // 统计被该用户推荐的用户数
      const actualReferralCount = await User.countDocuments({ 
        referredBy: user._id 
      });

      const currentCount = user.referralCount || 0;

      if (actualReferralCount !== currentCount) {
        // 更新 referralCount
        user.referralCount = actualReferralCount;
        await user.save();
        
        console.log(`✅ ${user.username} (${user.email})`);
        console.log(`   旧值: ${currentCount} → 新值: ${actualReferralCount}`);
        fixedCount++;
      } else {
        unchangedCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 修复统计:');
    console.log(`   ✅ 已修复: ${fixedCount} 个用户`);
    console.log(`   ⏭️  无需修复: ${unchangedCount} 个用户`);
    console.log('='.repeat(50));

    // 显示推荐用户最多的前10名
    console.log('\n📈 推荐用户排行榜 (Top 10):');
    const topReferrers = await User.find({ referralCount: { $gt: 0 } })
      .sort({ referralCount: -1 })
      .limit(10)
      .select('username email referralCount referralCode');

    if (topReferrers.length > 0) {
      topReferrers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.username} - ${user.referralCount} 人 (推荐码: ${user.referralCode})`);
      });
    } else {
      console.log('   暂无推荐记录');
    }

    console.log('\n✅ 修复完成！');

  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 数据库连接已关闭');
  }
}

// 执行修复
fixReferralCount();
