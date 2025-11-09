require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const SystemConfig = require('../models/SystemConfig');

async function checkSystemConfig() {
  try {
    console.log('🔍 检查系统配置...\n');

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/knowbase');
    console.log('✅ 数据库连接成功\n');

    const config = await SystemConfig.getConfig();
    
    console.log('📊 当前系统配置:');
    console.log('');
    console.log('积分配置 (points):');
    console.log('  注册奖励 (registerReward):', config.points?.registerReward || '未设置（默认100）');
    console.log('  推荐奖励 (referralReward):', config.points?.referralReward || '未设置（默认100）');
    console.log('  每日签到 (dailyReward):', config.points?.dailyReward || '未设置（默认10）');
    console.log('  最低提现 (minWithdrawAmount):', config.points?.minWithdrawAmount || '未设置（默认50）');
    console.log('  提现手续费 (withdrawFee):', config.points?.withdrawFee || '未设置（默认5）');
    console.log('');
    console.log('完整配置对象:');
    console.log(JSON.stringify(config.points, null, 2));
    
    console.log('\n✅ 检查完成');
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkSystemConfig();
