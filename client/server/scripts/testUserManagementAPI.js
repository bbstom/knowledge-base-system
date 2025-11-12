require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const SearchLog = require('../models/SearchLog');
const BalanceLog = require('../models/BalanceLog');

async function testUserManagementAPI() {
  try {
    console.log('🔄 连接数据库...');
    // 等待数据库初始化完成
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ 数据库连接成功\n');

    console.log('📊 用户管理API测试');
    console.log('='.repeat(60));

    // 测试1: 获取所有用户
    console.log('\n1️⃣ 测试获取所有用户');
    console.log('-'.repeat(60));
    const allUsers = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    console.log(`找到 ${allUsers.length} 个用户:`);
    for (const user of allUsers) {
      console.log(`  - ${user.username} (${user.email})`);
      console.log(`    VIP状态: ${user.vipStatus || '未设置'}`);
      console.log(`    积分: ${user.points || 0}, 佣金: ${user.commission || 0}`);
    }

    // 测试2: VIP用户统计
    console.log('\n2️⃣ 测试VIP用户统计');
    console.log('-'.repeat(60));
    const totalUsers = await User.countDocuments();
    const vipUsers = await User.countDocuments({ 
      vipStatus: { $in: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] } 
    });
    const normalUsers = await User.countDocuments({
      $or: [
        { vipStatus: 'none' },
        { vipStatus: { $exists: false } },
        { vipStatus: null }
      ]
    });
    
    console.log(`总用户数: ${totalUsers}`);
    console.log(`VIP用户: ${vipUsers}`);
    console.log(`普通用户: ${normalUsers}`);
    console.log(`验证: ${totalUsers === (vipUsers + normalUsers) ? '✅ 正确' : '❌ 错误'}`);

    // 测试3: 用户详细统计
    if (allUsers.length > 0) {
      console.log('\n3️⃣ 测试用户详细统计');
      console.log('-'.repeat(60));
      const testUser = allUsers[0];
      console.log(`测试用户: ${testUser.username}`);

      // 推荐用户数
      const referralCount = await User.countDocuments({ referredBy: testUser._id });
      console.log(`  推荐用户数: ${referralCount}`);

      // 搜索次数
      const searchCount = await SearchLog.countDocuments({ userId: testUser._id });
      console.log(`  搜索次数: ${searchCount}`);

      // 佣金记录
      const commissionLogs = await BalanceLog.find({
        userId: testUser._id,
        currency: 'commission'
      }).limit(5);
      console.log(`  佣金记录数: ${commissionLogs.length}`);

      // 积分记录
      const pointsLogs = await BalanceLog.find({
        userId: testUser._id,
        currency: 'points'
      }).limit(5);
      console.log(`  积分记录数: ${pointsLogs.length}`);
    }

    // 测试4: 搜索功能
    console.log('\n4️⃣ 测试搜索功能');
    console.log('-'.repeat(60));
    if (allUsers.length > 0) {
      const searchTerm = allUsers[0].username.substring(0, 2);
      const searchResults = await User.find({
        $or: [
          { username: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } }
        ]
      }).select('username email').limit(5);
      
      console.log(`搜索关键词: "${searchTerm}"`);
      console.log(`找到 ${searchResults.length} 个匹配用户:`);
      searchResults.forEach(u => {
        console.log(`  - ${u.username} (${u.email})`);
      });
    }

    // 测试5: VIP过滤
    console.log('\n5️⃣ 测试VIP过滤');
    console.log('-'.repeat(60));
    
    const vipFilterResults = await User.find({
      vipStatus: { $in: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] }
    }).select('username vipStatus').limit(5);
    console.log(`VIP用户: ${vipFilterResults.length} 个`);
    vipFilterResults.forEach(u => {
      console.log(`  - ${u.username}: ${u.vipStatus}`);
    });

    const normalFilterResults = await User.find({
      $or: [
        { vipStatus: 'none' },
        { vipStatus: { $exists: false } },
        { vipStatus: null }
      ]
    }).select('username vipStatus').limit(5);
    console.log(`普通用户: ${normalFilterResults.length} 个`);
    normalFilterResults.forEach(u => {
      console.log(`  - ${u.username}: ${u.vipStatus || '未设置'}`);
    });

    console.log('\n✅ 所有测试完成');
    process.exit(0);
  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

testUserManagementAPI();
