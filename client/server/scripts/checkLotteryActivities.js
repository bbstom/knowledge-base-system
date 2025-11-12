const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

// 直接定义Schema，避免使用复杂的数据库管理器
const lotteryActivitySchema = new mongoose.Schema({
  name: String,
  isActive: Boolean,
  startTime: Date,
  endTime: Date,
  costPoints: Number,
  animationType: String,
  prizes: Array
}, { timestamps: true });

const LotteryActivity = mongoose.model('LotteryActivity', lotteryActivitySchema);

async function checkActivities() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.USER_MONGO_URI;
    if (!mongoUri) {
      console.error('❌ 错误: 未找到数据库连接字符串');
      console.log('请检查 .env 文件中的 MONGODB_URI 或 USER_MONGO_URI');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('✅ 数据库连接成功\n');
    
    const activities = await LotteryActivity.find();
    
    console.log(`找到 ${activities.length} 个抽奖活动\n`);
    
    activities.forEach((activity, index) => {
      console.log(`活动 ${index + 1}:`);
      console.log(`  名称: ${activity.name}`);
      console.log(`  状态: ${activity.isActive ? '✅ 激活' : '❌ 未激活'}`);
      console.log(`  开始时间: ${activity.startTime}`);
      console.log(`  结束时间: ${activity.endTime}`);
      console.log(`  消耗积分: ${activity.costPoints}`);
      console.log(`  动画类型: ${activity.animationType || 'slot'}`);
      console.log(`  奖品数量: ${activity.prizes?.length || 0}`);
      
      const now = new Date();
      const isInTime = now >= activity.startTime && now <= activity.endTime;
      console.log(`  时间有效: ${isInTime ? '✅ 是' : '❌ 否'}`);
      
      console.log('');
    });
    
    // 检查是否有可用活动
    const now = new Date();
    const availableActivities = activities.filter(a => 
      a.isActive && 
      now >= a.startTime && 
      now <= a.endTime
    );
    
    console.log(`\n当前可用活动: ${availableActivities.length} 个`);
    
    if (availableActivities.length === 0) {
      console.log('\n⚠️  没有可用的抽奖活动！');
      console.log('请在管理后台创建活动，并确保：');
      console.log('  1. isActive = true');
      console.log('  2. 开始时间 <= 现在');
      console.log('  3. 结束时间 >= 现在');
      console.log('  4. 至少有一个奖品');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkActivities();
