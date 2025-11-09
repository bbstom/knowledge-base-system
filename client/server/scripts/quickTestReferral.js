/**
 * 邀请系统快速测试脚本
 * 快速验证邀请追踪功能是否正常工作
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const ReferralVisit = require('../models/ReferralVisit');

async function quickTest() {
  console.log('🔍 邀请系统快速检查\n');
  
  try {
    await mongoose.connect(process.env.USER_MONGO_URI || process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');
    
    // 1. 检查有邀请码的用户
    const usersWithCode = await User.countDocuments({ 
      referralCode: { $exists: true, $ne: null } 
    });
    console.log(`📊 有邀请码的用户数: ${usersWithCode}`);
    
    // 2. 检查访问记录
    const totalVisits = await ReferralVisit.countDocuments();
    const convertedVisits = await ReferralVisit.countDocuments({ converted: true });
    console.log(`📊 总访问记录: ${totalVisits}`);
    console.log(`📊 已转化记录: ${convertedVisits}`);
    
    // 3. 检查推荐关系
    const referredUsers = await User.countDocuments({ 
      referredBy: { $exists: true, $ne: null } 
    });
    console.log(`📊 被推荐用户数: ${referredUsers}`);
    
    // 4. 显示最近的访问记录
    const recentVisits = await ReferralVisit.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    if (recentVisits.length > 0) {
      console.log('\n📋 最近5条访问记录:');
      recentVisits.forEach((visit, index) => {
        console.log(`  ${index + 1}. 邀请码: ${visit.referralCode}`);
        console.log(`     访问次数: ${visit.visitCount}`);
        console.log(`     已转化: ${visit.converted ? '是' : '否'}`);
        console.log(`     创建时间: ${visit.createdAt.toLocaleString('zh-CN')}`);
        console.log('');
      });
    }
    
    // 5. 显示推荐统计最多的用户
    const topReferrers = await User.find({ 
      'referralStats.totalReferrals': { $gt: 0 } 
    })
      .sort({ 'referralStats.totalReferrals': -1 })
      .limit(5)
      .select('username email referralCode referralStats')
      .lean();
    
    if (topReferrers.length > 0) {
      console.log('🏆 推荐排行榜 TOP 5:');
      topReferrers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.username} (${user.email})`);
        console.log(`     邀请码: ${user.referralCode}`);
        console.log(`     推荐人数: ${user.referralStats.totalReferrals}`);
        console.log(`     有效推荐: ${user.referralStats.validReferrals}`);
        console.log('');
      });
    } else {
      console.log('\n⚠️  暂无推荐数据');
    }
    
    // 6. 检查索引
    const visitIndexes = await ReferralVisit.collection.getIndexes();
    console.log('📑 ReferralVisit 索引:');
    Object.keys(visitIndexes).forEach(key => {
      console.log(`  - ${key}`);
    });
    
    console.log('\n✅ 快速检查完成！');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

quickTest();
