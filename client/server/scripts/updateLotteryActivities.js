require('dotenv').config();
const mongoose = require('mongoose');
const LotteryActivity = require('../models/LotteryActivity');

async function updateActivities() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');
    
    // 为所有没有animationType的活动添加默认值
    const result = await LotteryActivity.updateMany(
      { animationType: { $exists: false } },
      { $set: { animationType: 'slot' } }
    );
    
    console.log(`✅ 更新了 ${result.modifiedCount} 个活动`);
    console.log('所有活动现在都有 animationType 字段了\n');
    
    // 显示所有活动
    const activities = await LotteryActivity.find();
    console.log('活动列表:');
    activities.forEach(activity => {
      console.log(`  ${activity.name}: ${activity.animationType || 'slot'}`);
    });
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

updateActivities();
