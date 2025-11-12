/**
 * 抽奖系统完整测试脚本
 * 测试所有功能：创建活动、用户抽奖、充值限制、概率分布等
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const LotteryActivity = require('../models/LotteryActivity');
const LotteryRecord = require('../models/LotteryRecord');

// 测试配置
const TEST_CONFIG = {
  adminUser: {
    username: 'lottery_test_admin',
    email: 'lottery_admin@test.com',
    password: 'Admin123!@#'
  },
  normalUser: {
    username: 'lottery_test_user',
    email: 'lottery_user@test.com',
    password: 'User123!@#'
  },
  rechargedUser: {
    username: 'lottery_recharged_user',
    email: 'lottery_recharged@test.com',
    password: 'User123!@#',
    totalRecharged: 100
  }
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// 连接数据库
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logSuccess('数据库连接成功');
    return true;
  } catch (error) {
    logError(`数据库连接失败: ${error.message}`);
    return false;
  }
}

// 清理测试数据
async function cleanupTestData() {
  logSection('清理测试数据');
  
  try {
    // 删除测试用户
    const usernames = [
      TEST_CONFIG.adminUser.username,
      TEST_CONFIG.normalUser.username,
      TEST_CONFIG.rechargedUser.username
    ];
    
    const deletedUsers = await User.deleteMany({ 
      username: { $in: usernames } 
    });
    logInfo(`删除测试用户: ${deletedUsers.deletedCount} 个`);
    
    // 删除测试活动
    const deletedActivities = await LotteryActivity.deleteMany({ 
      name: /测试抽奖/ 
    });
    logInfo(`删除测试活动: ${deletedActivities.deletedCount} 个`);
    
    // 删除测试记录
    const testUsers = await User.find({ username: { $in: usernames } });
    const testUserIds = testUsers.map(u => u._id);
    const deletedRecords = await LotteryRecord.deleteMany({ 
      userId: { $in: testUserIds } 
    });
    logInfo(`删除测试记录: ${deletedRecords.deletedCount} 个`);
    
    logSuccess('测试数据清理完成');
  } catch (error) {
    logError(`清理测试数据失败: ${error.message}`);
  }
}

// 创建测试用户
async function createTestUsers() {
  logSection('创建测试用户');
  
  const users = {};
  
  try {
    // 创建管理员
    users.admin = await User.create({
      ...TEST_CONFIG.adminUser,
      role: 'admin',
      points: 10000,
      totalRecharged: 1000
    });
    logSuccess(`管理员创建成功: ${users.admin.username}`);
    
    // 创建普通用户（未充值）
    users.normal = await User.create({
      ...TEST_CONFIG.normalUser,
      role: 'user',
      points: 1000,
      totalRecharged: 0
    });
    logSuccess(`普通用户创建成功: ${users.normal.username} (未充值)`);
    
    // 创建充值用户
    users.recharged = await User.create({
      ...TEST_CONFIG.rechargedUser,
      role: 'user',
      points: 5000,
      totalRecharged: TEST_CONFIG.rechargedUser.totalRecharged
    });
    logSuccess(`充值用户创建成功: ${users.recharged.username} (已充值 ${users.recharged.totalRecharged})`);
    
    return users;
  } catch (error) {
    logError(`创建测试用户失败: ${error.message}`);
    throw error;
  }
}

// 测试1: 创建抽奖活动
async function testCreateActivity() {
  logSection('测试1: 创建抽奖活动');
  
  try {
    const activity = await LotteryActivity.create({
      name: '测试抽奖活动',
      description: '这是一个测试活动',
      costPoints: 100,
      dailyLimit: 5,
      startTime: new Date(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后
      prizes: [
        {
          name: '500积分',
          type: 'points',
          value: 500,
          stock: 10,
          probability: 5
        },
        {
          name: '7天VIP',
          type: 'vip',
          value: 7,
          stock: 5,
          probability: 3
        },
        {
          name: '100积分',
          type: 'points',
          value: 100,
          stock: 20,
          probability: 10
        },
        {
          name: '谢谢参与',
          type: 'none',
          value: 0,
          stock: -1,
          probability: 82
        }
      ],
      status: 'active'
    });
    
    logSuccess(`活动创建成功: ${activity.name}`);
    logInfo(`活动ID: ${activity._id}`);
    logInfo(`消耗积分: ${activity.costPoints}`);
    logInfo(`每日限制: ${activity.dailyLimit} 次`);
    logInfo(`奖品数量: ${activity.prizes.length} 个`);
    
    // 验证概率总和
    const totalProbability = activity.prizes.reduce((sum, p) => sum + p.probability, 0);
    if (totalProbability === 100) {
      logSuccess(`概率总和正确: ${totalProbability}%`);
    } else {
      logWarning(`概率总和: ${totalProbability}% (应该为100%)`);
    }
    
    return activity;
  } catch (error) {
    logError(`创建活动失败: ${error.message}`);
    throw error;
  }
}

// 测试2: 未充值用户抽奖（应该失败）
async function testUnrechargedUserDraw(activity, user) {
  logSection('测试2: 未充值用户抽奖（应该被拒绝）');
  
  try {
    logInfo(`用户: ${user.username}`);
    logInfo(`充值金额: ${user.totalRecharged}`);
    logInfo(`当前积分: ${user.points}`);
    
    // 尝试抽奖
    const lotteryService = require('../services/lotteryService');
    
    try {
      await lotteryService.draw(activity._id.toString(), user._id.toString());
      logError('未充值用户竟然可以抽奖！测试失败！');
      return false;
    } catch (error) {
      if (error.message.includes('充值用户')) {
        logSuccess(`正确拒绝: ${error.message}`);
        return true;
      } else {
        logError(`意外错误: ${error.message}`);
        return false;
      }
    }
  } catch (error) {
    logError(`测试失败: ${error.message}`);
    return false;
  }
}

// 测试3: 充值用户抽奖（应该成功）
async function testRechargedUserDraw(activity, user) {
  logSection('测试3: 充值用户抽奖（应该成功）');
  
  try {
    logInfo(`用户: ${user.username}`);
    logInfo(`充值金额: ${user.totalRecharged}`);
    logInfo(`当前积分: ${user.points}`);
    
    const lotteryService = require('../services/lotteryService');
    
    // 抽奖
    const result = await lotteryService.draw(activity._id.toString(), user._id.toString());
    
    logSuccess('抽奖成功！');
    logInfo(`中奖结果: ${result.prize.name}`);
    logInfo(`奖品类型: ${result.prize.type}`);
    logInfo(`奖品价值: ${result.prize.value}`);
    
    // 验证积分扣除
    const updatedUser = await User.findById(user._id);
    const expectedPoints = user.points - activity.costPoints;
    
    if (result.prize.type === 'points') {
      // 如果中了积分，应该加上奖励
      const finalExpected = expectedPoints + result.prize.value;
      if (updatedUser.points === finalExpected) {
        logSuccess(`积分正确: ${updatedUser.points} (扣除${activity.costPoints} + 奖励${result.prize.value})`);
      } else {
        logWarning(`积分异常: 期望${finalExpected}, 实际${updatedUser.points}`);
      }
    } else {
      if (updatedUser.points === expectedPoints) {
        logSuccess(`积分扣除正确: ${updatedUser.points} (扣除${activity.costPoints})`);
      } else {
        logWarning(`积分异常: 期望${expectedPoints}, 实际${updatedUser.points}`);
      }
    }
    
    // 验证VIP
    if (result.prize.type === 'vip') {
      const updatedUserWithVIP = await User.findById(user._id);
      if (updatedUserWithVIP.vipExpireAt) {
        logSuccess(`VIP已发放: 到期时间 ${updatedUserWithVIP.vipExpireAt}`);
      } else {
        logWarning('VIP未正确发放');
      }
    }
    
    return result;
  } catch (error) {
    logError(`抽奖失败: ${error.message}`);
    throw error;
  }
}

// 测试4: 多次抽奖测试概率分布
async function testMultipleDraws(activity, user, count = 20) {
  logSection(`测试4: 多次抽奖测试 (${count}次)`);
  
  try {
    logInfo(`用户: ${user.username}`);
    logInfo(`初始积分: ${user.points}`);
    
    const lotteryService = require('../services/lotteryService');
    const results = {};
    let successCount = 0;
    
    for (let i = 0; i < count; i++) {
      try {
        // 确保用户有足够积分
        await User.findByIdAndUpdate(user._id, { 
          $inc: { points: activity.costPoints } 
        });
        
        const result = await lotteryService.draw(activity._id.toString(), user._id.toString());
        
        const prizeName = result.prize.name;
        results[prizeName] = (results[prizeName] || 0) + 1;
        successCount++;
        
        process.stdout.write(`\r抽奖进度: ${i + 1}/${count}`);
      } catch (error) {
        logError(`\n第${i + 1}次抽奖失败: ${error.message}`);
      }
    }
    
    console.log('\n');
    logSuccess(`完成 ${successCount}/${count} 次抽奖`);
    
    // 显示结果统计
    logInfo('中奖统计:');
    for (const [prizeName, count] of Object.entries(results)) {
      const percentage = ((count / successCount) * 100).toFixed(2);
      const prize = activity.prizes.find(p => p.name === prizeName);
      const expectedProb = prize ? prize.probability : 0;
      
      console.log(`  ${prizeName}: ${count}次 (${percentage}%, 期望${expectedProb}%)`);
    }
    
    return results;
  } catch (error) {
    logError(`多次抽奖测试失败: ${error.message}`);
    throw error;
  }
}

// 测试5: 每日限制测试
async function testDailyLimit(activity, user) {
  logSection('测试5: 每日抽奖次数限制');
  
  try {
    logInfo(`用户: ${user.username}`);
    logInfo(`每日限制: ${activity.dailyLimit} 次`);
    
    const lotteryService = require('../services/lotteryService');
    
    // 给用户足够的积分
    await User.findByIdAndUpdate(user._id, { 
      points: activity.costPoints * (activity.dailyLimit + 2) 
    });
    
    let successCount = 0;
    
    // 尝试抽奖超过限制次数
    for (let i = 0; i < activity.dailyLimit + 2; i++) {
      try {
        await lotteryService.draw(activity._id.toString(), user._id.toString());
        successCount++;
        logInfo(`第 ${i + 1} 次抽奖成功`);
      } catch (error) {
        if (error.message.includes('已达到每日抽奖次数上限')) {
          logSuccess(`第 ${i + 1} 次抽奖被正确限制: ${error.message}`);
          break;
        } else {
          logError(`意外错误: ${error.message}`);
        }
      }
    }
    
    if (successCount === activity.dailyLimit) {
      logSuccess(`每日限制正确: 成功抽奖 ${successCount} 次`);
      return true;
    } else {
      logWarning(`每日限制异常: 期望${activity.dailyLimit}次, 实际${successCount}次`);
      return false;
    }
  } catch (error) {
    logError(`每日限制测试失败: ${error.message}`);
    return false;
  }
}

// 测试6: 库存测试
async function testStockLimit() {
  logSection('测试6: 奖品库存限制');
  
  try {
    // 创建一个库存很少的活动
    const activity = await LotteryActivity.create({
      name: '测试抽奖活动-库存限制',
      description: '测试库存限制',
      costPoints: 10,
      dailyLimit: 0, // 无限制
      startTime: new Date(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      prizes: [
        {
          name: '大奖',
          type: 'points',
          value: 1000,
          stock: 2, // 只有2个
          probability: 100 // 100%中奖
        }
      ],
      status: 'active'
    });
    
    logInfo(`活动创建: ${activity.name}`);
    logInfo(`大奖库存: 2个, 中奖率: 100%`);
    
    // 创建测试用户
    const testUser = await User.create({
      username: 'lottery_stock_test',
      email: 'stock@test.com',
      password: 'Test123!@#',
      points: 1000,
      totalRecharged: 100
    });
    
    const lotteryService = require('../services/lotteryService');
    let wonCount = 0;
    
    // 尝试抽奖3次
    for (let i = 0; i < 3; i++) {
      try {
        const result = await lotteryService.draw(activity._id.toString(), testUser._id.toString());
        wonCount++;
        logInfo(`第 ${i + 1} 次: 中奖 - ${result.prize.name}`);
      } catch (error) {
        if (error.message.includes('库存不足')) {
          logSuccess(`第 ${i + 1} 次: 库存不足被正确拦截`);
        } else {
          logError(`第 ${i + 1} 次: ${error.message}`);
        }
      }
    }
    
    if (wonCount === 2) {
      logSuccess('库存限制正确: 只能中奖2次');
    } else {
      logWarning(`库存限制异常: 期望2次, 实际${wonCount}次`);
    }
    
    // 清理
    await User.deleteOne({ _id: testUser._id });
    await LotteryActivity.deleteOne({ _id: activity._id });
    
    return wonCount === 2;
  } catch (error) {
    logError(`库存测试失败: ${error.message}`);
    return false;
  }
}

// 测试7: 查询抽奖记录
async function testQueryRecords(user) {
  logSection('测试7: 查询抽奖记录');
  
  try {
    const records = await LotteryRecord.find({ userId: user._id })
      .populate('activityId')
      .sort({ createdAt: -1 })
      .limit(10);
    
    logSuccess(`找到 ${records.length} 条抽奖记录`);
    
    records.forEach((record, index) => {
      console.log(`\n记录 ${index + 1}:`);
      console.log(`  活动: ${record.activityId?.name || '已删除'}`);
      console.log(`  奖品: ${record.prizeName}`);
      console.log(`  类型: ${record.prizeType}`);
      console.log(`  价值: ${record.prizeValue}`);
      console.log(`  时间: ${record.createdAt}`);
    });
    
    return records;
  } catch (error) {
    logError(`查询记录失败: ${error.message}`);
    return [];
  }
}

// 主测试流程
async function runTests() {
  console.log('\n');
  log('🎰 抽奖系统完整测试', 'cyan');
  log('测试开始时间: ' + new Date().toLocaleString(), 'cyan');
  console.log('\n');
  
  let testResults = {
    total: 0,
    passed: 0,
    failed: 0
  };
  
  try {
    // 连接数据库
    const connected = await connectDB();
    if (!connected) {
      process.exit(1);
    }
    
    // 清理旧数据
    await cleanupTestData();
    
    // 创建测试用户
    const users = await createTestUsers();
    
    // 测试1: 创建活动
    testResults.total++;
    const activity = await testCreateActivity();
    testResults.passed++;
    
    // 测试2: 未充值用户抽奖
    testResults.total++;
    const test2Result = await testUnrechargedUserDraw(activity, users.normal);
    if (test2Result) testResults.passed++;
    else testResults.failed++;
    
    // 测试3: 充值用户抽奖
    testResults.total++;
    try {
      await testRechargedUserDraw(activity, users.recharged);
      testResults.passed++;
    } catch (error) {
      testResults.failed++;
    }
    
    // 测试4: 多次抽奖
    testResults.total++;
    try {
      await testMultipleDraws(activity, users.admin, 20);
      testResults.passed++;
    } catch (error) {
      testResults.failed++;
    }
    
    // 测试5: 每日限制
    testResults.total++;
    const test5Result = await testDailyLimit(activity, users.recharged);
    if (test5Result) testResults.passed++;
    else testResults.failed++;
    
    // 测试6: 库存限制
    testResults.total++;
    const test6Result = await testStockLimit();
    if (test6Result) testResults.passed++;
    else testResults.failed++;
    
    // 测试7: 查询记录
    testResults.total++;
    try {
      await testQueryRecords(users.admin);
      testResults.passed++;
    } catch (error) {
      testResults.failed++;
    }
    
    // 最终报告
    logSection('测试完成');
    console.log(`总测试数: ${testResults.total}`);
    logSuccess(`通过: ${testResults.passed}`);
    if (testResults.failed > 0) {
      logError(`失败: ${testResults.failed}`);
    }
    
    const passRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
    console.log(`\n通过率: ${passRate}%`);
    
    if (testResults.failed === 0) {
      log('\n🎉 所有测试通过！抽奖系统运行正常！', 'green');
    } else {
      log('\n⚠️  部分测试失败，请检查日志', 'yellow');
    }
    
  } catch (error) {
    logError(`测试过程出错: ${error.message}`);
    console.error(error);
  } finally {
    // 询问是否清理测试数据
    console.log('\n');
    logInfo('测试数据已保留，可手动查看');
    logInfo('如需清理，请运行: node server/scripts/cleanupLotteryTest.js');
    
    await mongoose.connection.close();
    logInfo('数据库连接已关闭');
  }
}

// 运行测试
runTests().catch(console.error);
