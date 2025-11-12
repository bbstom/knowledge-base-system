/**
 * 抽奖系统快速测试
 * 快速验证核心功能是否正常
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const LotteryActivity = require('../models/LotteryActivity');
const lotteryService = require('../services/lotteryService');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

async function quickTest() {
  try {
    log('\n🎰 抽奖系统快速测试\n', 'cyan');
    
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI);
    log('✅ 数据库连接成功', 'green');
    
    // 查找或创建测试用户
    let testUser = await User.findOne({ username: 'quick_test_user' });
    if (!testUser) {
      testUser = await User.create({
        username: 'quick_test_user',
        email: 'quicktest@test.com',
        password: 'Test123!@#',
        points: 10000,
        totalRecharged: 100
      });
      log('✅ 测试用户创建成功', 'green');
    } else {
      // 重置积分
      testUser.points = 10000;
      await testUser.save();
      log('✅ 使用现有测试用户', 'green');
    }
    
    // 查找活跃的抽奖活动
    let activity = await LotteryActivity.findOne({ status: 'active' });
    
    if (!activity) {
      // 创建测试活动
      activity = await LotteryActivity.create({
        name: '快速测试活动',
        description: '用于快速测试',
        costPoints: 100,
        dailyLimit: 10,
        startTime: new Date(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        prizes: [
          {
            name: '500积分',
            type: 'points',
            value: 500,
            stock: 10,
            probability: 10
          },
          {
            name: '100积分',
            type: 'points',
            value: 100,
            stock: 20,
            probability: 20
          },
          {
            name: '谢谢参与',
            type: 'none',
            value: 0,
            stock: -1,
            probability: 70
          }
        ],
        status: 'active'
      });
      log('✅ 测试活动创建成功', 'green');
    } else {
      log(`✅ 使用现有活动: ${activity.name}`, 'green');
    }
    
    console.log('\n--- 活动信息 ---');
    console.log(`活动名称: ${activity.name}`);
    console.log(`消耗积分: ${activity.costPoints}`);
    console.log(`每日限制: ${activity.dailyLimit} 次`);
    console.log(`奖品数量: ${activity.prizes.length} 个`);
    
    console.log('\n--- 用户信息 ---');
    console.log(`用户名: ${testUser.username}`);
    console.log(`当前积分: ${testUser.points}`);
    console.log(`充值金额: ${testUser.totalRecharged}`);
    
    // 执行抽奖
    console.log('\n--- 开始抽奖 ---');
    const drawCount = 5;
    const results = {};
    
    for (let i = 0; i < drawCount; i++) {
      try {
        const result = await lotteryService.draw(
          activity._id.toString(),
          testUser._id.toString()
        );
        
        const prizeName = result.prize.name;
        results[prizeName] = (results[prizeName] || 0) + 1;
        
        log(`第 ${i + 1} 次: ${prizeName} (${result.prize.type})`, 'green');
      } catch (error) {
        log(`第 ${i + 1} 次失败: ${error.message}`, 'red');
      }
    }
    
    // 统计结果
    console.log('\n--- 抽奖统计 ---');
    for (const [prize, count] of Object.entries(results)) {
      console.log(`${prize}: ${count} 次`);
    }
    
    // 查看用户最新积分
    const updatedUser = await User.findById(testUser._id);
    console.log(`\n最终积分: ${updatedUser.points}`);
    
    log('\n✅ 快速测试完成！', 'green');
    log('提示: 运行完整测试请使用 node server/scripts/testLotterySystem.js', 'yellow');
    
  } catch (error) {
    log(`\n❌ 测试失败: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await mongoose.connection.close();
  }
}

quickTest();
