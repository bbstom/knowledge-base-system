/**
 * 为所有用户添加 referralStats 字段
 * 并根据现有数据计算统计信息
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function addReferralStats() {
  console.log('🚀 开始添加 referralStats 字段\n');
  
  try {
    await mongoose.connect(process.env.USER_MONGO_URI || process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');
    
    // 1. 为所有用户添加 referralStats 字段（如果不存在）
    console.log('📋 步骤1: 初始化 referralStats 字段...');
    const result = await User.updateMany(
      { referralStats: { $exists: false } },
      {
        $set: {
          referralStats: {
            totalReferrals: 0,
            validReferrals: 0,
            totalEarnings: 0
          }
        }
      }
    );
    console.log(`   更新了 ${result.modifiedCount} 个用户\n`);
    
    // 2. 计算每个用户的实际推荐数
    console.log('📋 步骤2: 计算实际推荐数...');
    const usersWithReferrals = await User.aggregate([
      {
        $match: { referralCode: { $exists: true, $ne: null } }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'referredBy',
          as: 'referrals'
        }
      },
      {
        $project: {
          _id: 1,
          username: 1,
          referralCode: 1,
          referralCount: { $size: '$referrals' }
        }
      },
      {
        $match: { referralCount: { $gt: 0 } }
      }
    ]);
    
    console.log(`   找到 ${usersWithReferrals.length} 个有推荐记录的用户\n`);
    
    // 3. 更新每个用户的 referralStats
    console.log('📋 步骤3: 更新推荐统计...');
    for (const userStat of usersWithReferrals) {
      await User.updateOne(
        { _id: userStat._id },
        {
          $set: {
            'referralStats.totalReferrals': userStat.referralCount,
            'referralStats.validReferrals': userStat.referralCount
          }
        }
      );
      console.log(`   ✅ ${userStat.username}: ${userStat.referralCount} 个推荐`);
    }
    
    // 4. 显示统计结果
    console.log('\n' + '='.repeat(60));
    console.log('📊 统计结果');
    console.log('='.repeat(60));
    
    const totalUsers = await User.countDocuments();
    const usersWithCode = await User.countDocuments({ 
      referralCode: { $exists: true, $ne: null } 
    });
    const usersWithStats = await User.countDocuments({ 
      'referralStats.totalReferrals': { $gt: 0 } 
    });
    
    console.log(`总用户数: ${totalUsers}`);
    console.log(`有邀请码的用户: ${usersWithCode}`);
    console.log(`有推荐记录的用户: ${usersWithStats}`);
    console.log('='.repeat(60));
    
    console.log('\n✅ referralStats 字段添加完成！');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 数据库连接已关闭');
  }
}

addReferralStats();
