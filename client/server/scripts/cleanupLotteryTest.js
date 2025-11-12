/**
 * 清理抽奖系统测试数据
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const LotteryActivity = require('../models/LotteryActivity');
const LotteryRecord = require('../models/LotteryRecord');

async function cleanup() {
  try {
    console.log('连接数据库...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');
    
    // 删除测试用户
    console.log('清理测试用户...');
    const deletedUsers = await User.deleteMany({ 
      username: /lottery.*test/i 
    });
    console.log(`✅ 删除 ${deletedUsers.deletedCount} 个测试用户`);
    
    // 删除测试活动
    console.log('清理测试活动...');
    const deletedActivities = await LotteryActivity.deleteMany({ 
      name: /测试抽奖/ 
    });
    console.log(`✅ 删除 ${deletedActivities.deletedCount} 个测试活动`);
    
    // 删除孤立的抽奖记录
    console.log('清理抽奖记录...');
    const deletedRecords = await LotteryRecord.deleteMany({
      $or: [
        { userId: null },
        { activityId: null }
      ]
    });
    console.log(`✅ 删除 ${deletedRecords.deletedCount} 条孤立记录`);
    
    console.log('\n🎉 清理完成！');
    
  } catch (error) {
    console.error('❌ 清理失败:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('数据库连接已关闭');
  }
}

cleanup();
