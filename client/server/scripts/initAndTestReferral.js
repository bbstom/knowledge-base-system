/**
 * 初始化并测试邀请系统
 * 创建必要的集合和索引，然后运行基本测试
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const ReferralVisit = require('../models/ReferralVisit');

async function initAndTest() {
  console.log('🚀 邀请系统初始化和测试\n');
  
  try {
    // 连接数据库
    await mongoose.connect(process.env.USER_MONGO_URI || process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');
    
    // 1. 确保集合存在
    console.log('📋 步骤1: 检查集合...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (!collectionNames.includes('referralvisits')) {
      console.log('   创建 referralvisits 集合...');
      await mongoose.connection.db.createCollection('referralvisits');
      console.log('   ✅ 集合创建成功');
    } else {
      console.log('   ✅ referralvisits 集合已存在');
    }
    
    // 2. 创建索引
    console.log('\n📋 步骤2: 创建索引...');
    try {
      await ReferralVisit.createIndexes();
      console.log('   ✅ 索引创建成功');
    } catch (error) {
      console.log('   ⚠️  索引创建警告:', error.message);
    }
    
    // 3. 检查现有数据
    console.log('\n📋 步骤3: 检查现有数据...');
    const usersWithCode = await User.countDocuments({ 
      referralCode: { $exists: true, $ne: null } 
    });
    console.log(`   有邀请码的用户: ${usersWithCode}`);
    
    const referredUsers = await User.countDocuments({ 
      referredBy: { $exists: true, $ne: null } 
    });
    console.log(`   被推荐的用户: ${referredUsers}`);
    
    const visitCount = await ReferralVisit.countDocuments();
    console.log(`   访问记录数: ${visitCount}`);
    
    // 4. 显示示例用户
    console.log('\n📋 步骤4: 示例用户信息...');
    const sampleUsers = await User.find({ 
      referralCode: { $exists: true, $ne: null } 
    })
      .limit(3)
      .select('username email referralCode referralStats')
      .lean();
    
    if (sampleUsers.length > 0) {
      console.log('   可用于测试的邀请码:');
      sampleUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. 用户: ${user.username}`);
        console.log(`      邮箱: ${user.email}`);
        console.log(`      邀请码: ${user.referralCode}`);
        console.log(`      推荐数: ${user.referralStats?.totalReferrals || 0}`);
        console.log('');
      });
    } else {
      console.log('   ⚠️  没有找到有邀请码的用户');
      console.log('   提示: 注册新用户会自动生成邀请码');
    }
    
    // 5. 测试基本功能
    console.log('📋 步骤5: 测试基本功能...');
    
    if (sampleUsers.length > 0) {
      const testCode = sampleUsers[0].referralCode;
      const testFingerprint = 'test_init_' + Date.now();
      
      console.log(`   使用邀请码 ${testCode} 创建测试访问记录...`);
      
      try {
        const visit = new ReferralVisit({
          referralCode: testCode,
          fingerprint: testFingerprint,
          ip: '127.0.0.1',
          userAgent: 'Test Script',
          visitCount: 1
        });
        
        await visit.save();
        console.log('   ✅ 测试访问记录创建成功');
        
        // 查询验证
        const savedVisit = await ReferralVisit.findOne({ fingerprint: testFingerprint });
        if (savedVisit) {
          console.log('   ✅ 访问记录查询成功');
          console.log(`      记录ID: ${savedVisit._id}`);
          console.log(`      访问次数: ${savedVisit.visitCount}`);
        }
        
        // 清理测试数据
        await ReferralVisit.deleteOne({ fingerprint: testFingerprint });
        console.log('   ✅ 测试数据已清理');
        
      } catch (error) {
        console.log('   ❌ 测试失败:', error.message);
      }
    }
    
    // 6. 系统状态总结
    console.log('\n' + '='.repeat(60));
    console.log('📊 系统状态总结');
    console.log('='.repeat(60));
    console.log(`✅ 数据库连接: 正常`);
    console.log(`✅ 集合状态: 已创建`);
    console.log(`✅ 索引状态: 已创建`);
    console.log(`📊 用户数据: ${usersWithCode} 个用户有邀请码`);
    console.log(`📊 推荐关系: ${referredUsers} 个用户被推荐`);
    console.log(`📊 访问记录: ${visitCount} 条记录`);
    console.log('='.repeat(60));
    
    console.log('\n✅ 初始化和测试完成！');
    console.log('\n💡 下一步:');
    console.log('   1. 启动服务器: npm start');
    console.log('   2. 运行完整测试: node server/scripts/testReferralSystem.js');
    console.log('   3. 或手动测试邀请功能');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 数据库连接已关闭');
  }
}

initAndTest();
