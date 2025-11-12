require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function testVIPStats() {
  try {
    console.log('🔄 连接数据库...');
    // 等待数据库初始化完成
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ 数据库连接成功\n');

    console.log('📊 VIP用户统计测试');
    console.log('='.repeat(60));

    // 总用户数
    const totalUsers = await User.countDocuments();
    console.log(`📈 总用户数: ${totalUsers}`);

    // 旧的错误统计方法
    const oldVipCount = await User.countDocuments({ 
      vipStatus: { $ne: 'none' } 
    });
    console.log(`❌ 旧方法VIP统计 (包含null): ${oldVipCount}`);

    // 新的正确统计方法
    const newVipCount = await User.countDocuments({ 
      vipStatus: { $in: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] } 
    });
    console.log(`✅ 新方法VIP统计 (仅真实VIP): ${newVipCount}`);

    // 普通用户统计
    const normalUsers = await User.countDocuments({
      $or: [
        { vipStatus: 'none' },
        { vipStatus: { $exists: false } },
        { vipStatus: null }
      ]
    });
    console.log(`👤 普通用户: ${normalUsers}`);

    console.log('\n🔍 详细分析');
    console.log('='.repeat(60));

    // vipStatus字段不存在的用户
    const noVipField = await User.countDocuments({ vipStatus: { $exists: false } });
    console.log(`📝 vipStatus字段不存在: ${noVipField}`);

    // vipStatus为null的用户
    const nullVip = await User.countDocuments({ vipStatus: null });
    console.log(`🔘 vipStatus为null: ${nullVip}`);

    // vipStatus为'none'的用户
    const noneVip = await User.countDocuments({ vipStatus: 'none' });
    console.log(`⭕ vipStatus为'none': ${noneVip}`);

    // 各种VIP等级统计
    console.log('\n💎 VIP等级分布:');
    const vipLevels = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    for (const level of vipLevels) {
      const count = await User.countDocuments({ vipStatus: level });
      if (count > 0) {
        console.log(`   ${level.toUpperCase()}: ${count}`);
      }
    }

    console.log('\n✅ 数据验证');
    console.log('='.repeat(60));
    console.log(`总用户 = VIP用户 + 普通用户`);
    console.log(`${totalUsers} = ${newVipCount} + ${normalUsers}`);
    const isValid = totalUsers === (newVipCount + normalUsers);
    console.log(`验证结果: ${isValid ? '✅ 正确' : '❌ 错误'}`);

    if (!isValid) {
      const diff = totalUsers - (newVipCount + normalUsers);
      console.log(`⚠️  差异: ${diff} 个用户`);
    }

    // 显示一些示例用户
    console.log('\n👥 示例用户 (前5个)');
    console.log('='.repeat(60));
    const sampleUsers = await User.find({}).limit(5).select('username email vipStatus createdAt');
    sampleUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username || user.email}`);
      console.log(`   VIP状态: ${user.vipStatus || '未设置'}`);
      console.log(`   注册时间: ${user.createdAt}`);
      console.log('');
    });

    console.log('✅ 测试完成');
    process.exit(0);
  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

testVIPStats();
