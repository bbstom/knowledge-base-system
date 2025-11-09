const mongoose = require('mongoose');
const User = require('../models/User');
const BalanceLog = require('../models/BalanceLog');

// 直接连接MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/knowbase';

async function backfillPointsLogs() {
  try {
    console.log('🔍 开始补充历史用户积分记录...\n');

    // 连接数据库
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    // 查找所有有积分但没有积分记录的用户
    const users = await User.find({ points: { $gt: 0 } });
    console.log(`📊 找到 ${users.length} 个有积分的用户\n`);

    let补充数量 = 0;
    let跳过数量 = 0;

    for (const user of users) {
      // 检查是否已有积分记录
      const hasLog = await BalanceLog.findOne({
        userId: user._id,
        currency: 'points'
      });

      if (!hasLog) {
        // 没有记录，创建注册奖励记录
        await BalanceLog.create({
          userId: user._id,
          type: 'register',
          currency: 'points',
          amount: user.points,
          balanceBefore: 0,
          balanceAfter: user.points,
          description: '注册奖励（补录）',
          createdAt: user.createdAt
        });

        console.log(`✅ 为用户 ${user.username} (${user.email}) 补充了积分记录`);
        console.log(`   积分: ${user.points}`);
        console.log(`   注册时间: ${new Date(user.createdAt).toLocaleString()}`);
        console.log('');
        补充数量++;
      } else {
        跳过数量++;
      }
    }

    console.log('\n📈 补充完成统计:');
    console.log(`   补充记录: ${补充数量} 个用户`);
    console.log(`   已有记录: ${跳过数量} 个用户`);
    console.log(`   总用户数: ${users.length}`);

    console.log('\n✅ 补充完成');
  } catch (error) {
    console.error('❌ 补充失败:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n⚠️  数据库连接已关闭');
  }
}

backfillPointsLogs();
