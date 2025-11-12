require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function fixVIPStatus() {
  try {
    console.log('🔄 连接数据库...');
    await mongoose.connect(process.env.USER_MONGO_URI);
    console.log('✅ 数据库连接成功\n');

    console.log('🔧 修复现有用户的VIP状态');
    console.log('='.repeat(60));

    // 查找所有vipStatus字段不存在或为null的用户
    const usersToFix = await User.find({
      $or: [
        { vipStatus: { $exists: false } },
        { vipStatus: null }
      ]
    });

    console.log(`📊 找到 ${usersToFix.length} 个需要修复的用户\n`);

    if (usersToFix.length === 0) {
      console.log('✅ 所有用户的VIP状态都已正确设置');
      await mongoose.disconnect();
      return;
    }

    // 更新所有这些用户的vipStatus为'none'
    const result = await User.updateMany(
      {
        $or: [
          { vipStatus: { $exists: false } },
          { vipStatus: null }
        ]
      },
      {
        $set: { vipStatus: 'none' }
      }
    );

    console.log(`✅ 成功更新 ${result.modifiedCount} 个用户的VIP状态为 'none'\n`);

    // 验证修复结果
    console.log('🔍 验证修复结果');
    console.log('='.repeat(60));

    const totalUsers = await User.countDocuments();
    const vipUsers = await User.countDocuments({ 
      vipStatus: { $exists: true, $ne: 'none', $ne: null } 
    });
    const normalUsers = await User.countDocuments({ vipStatus: 'none' });
    const stillBroken = await User.countDocuments({
      $or: [
        { vipStatus: { $exists: false } },
        { vipStatus: null }
      ]
    });

    console.log(`📈 总用户数: ${totalUsers}`);
    console.log(`💎 VIP用户: ${vipUsers}`);
    console.log(`👤 普通用户: ${normalUsers}`);
    console.log(`⚠️  仍需修复: ${stillBroken}`);
    console.log(`\n验证: ${totalUsers} = ${vipUsers} + ${normalUsers} ${totalUsers === (vipUsers + normalUsers) ? '✅' : '❌'}`);

    await mongoose.disconnect();
    console.log('\n✅ 修复完成');
  } catch (error) {
    console.error('❌ 修复失败:', error);
    process.exit(1);
  }
}

fixVIPStatus();
