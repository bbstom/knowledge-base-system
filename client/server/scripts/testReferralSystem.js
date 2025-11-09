/**
 * 邀请追踪系统完整测试脚本
 * 测试整个邀请流程：访问追踪 -> 注册转化 -> 佣金发放
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const axios = require('axios');
const User = require('../models/User');
const ReferralVisit = require('../models/ReferralVisit');
const BalanceLog = require('../models/BalanceLog');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';
const API_URL = `${BASE_URL}/api`;

// 测试数据
const testData = {
  referrer: {
    username: 'referrer_test_' + Date.now(),
    email: 'referrer_' + Date.now() + '@test.com',
    password: 'Test123456'
  },
  referee: {
    username: 'referee_test_' + Date.now(),
    email: 'referee_' + Date.now() + '@test.com',
    password: 'Test123456'
  },
  fingerprint: 'test_fp_' + Date.now()
};

let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// 测试辅助函数
function logTest(name, passed, message) {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${name}`);
  if (message) console.log(`   ${message}`);
  
  testResults.tests.push({ name, passed, message });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function connectDB() {
  try {
    await mongoose.connect(process.env.USER_MONGO_URI || process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    process.exit(1);
  }
}

async function cleanup() {
  console.log('\n🧹 清理测试数据...');
  try {
    await User.deleteMany({
      email: { $in: [testData.referrer.email, testData.referee.email] }
    });
    await ReferralVisit.deleteMany({
      fingerprint: testData.fingerprint
    });
    console.log('✅ 测试数据清理完成\n');
  } catch (error) {
    console.error('⚠️  清理失败:', error.message);
  }
}

// 测试1: 创建推荐人账户
async function test1_CreateReferrer() {
  console.log('📝 测试1: 创建推荐人账户');
  try {
    const response = await axios.post(`${API_URL}/auth/register`, testData.referrer);
    
    if (response.data.success && response.data.data) {
      testData.referrerCode = response.data.data.user.referralCode;
      testData.referrerId = response.data.data.user.id;
      logTest('创建推荐人', true, `邀请码: ${testData.referrerCode}`);
      return true;
    } else {
      logTest('创建推荐人', false, response.data.message);
      return false;
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || '未知错误';
    console.error('   详细错误:', error.code, error.message);
    if (error.response) {
      console.error('   响应状态:', error.response.status);
      console.error('   响应数据:', JSON.stringify(error.response.data));
    }
    logTest('创建推荐人', false, errorMsg);
    return false;
  }
}

// 测试2: 追踪邀请访问
async function test2_TrackVisit() {
  console.log('\n📝 测试2: 追踪邀请访问');
  try {
    const response = await axios.post(`${API_URL}/referral/track`, {
      referralCode: testData.referrerCode,
      fingerprint: testData.fingerprint
    });
    
    if (response.data.success) {
      logTest('追踪访问', true, '访问记录已创建');
      
      // 验证数据库记录
      const visit = await ReferralVisit.findOne({
        referralCode: testData.referrerCode,
        fingerprint: testData.fingerprint
      });
      
      if (visit) {
        logTest('访问记录验证', true, `访问次数: ${visit.visitCount}`);
        return true;
      } else {
        logTest('访问记录验证', false, '数据库中未找到记录');
        return false;
      }
    } else {
      logTest('追踪访问', false, response.data.message);
      return false;
    }
  } catch (error) {
    logTest('追踪访问', false, error.response?.data?.message || error.message);
    return false;
  }
}

// 测试3: 重复访问（测试去重）
async function test3_DuplicateVisit() {
  console.log('\n📝 测试3: 重复访问测试');
  try {
    await delay(1000); // 等待1秒
    
    const response = await axios.post(`${API_URL}/referral/track`, {
      referralCode: testData.referrerCode,
      fingerprint: testData.fingerprint
    });
    
    if (response.data.success) {
      // 验证访问次数增加
      const visit = await ReferralVisit.findOne({
        referralCode: testData.referrerCode,
        fingerprint: testData.fingerprint
      });
      
      if (visit && visit.visitCount >= 2) {
        logTest('重复访问计数', true, `访问次数: ${visit.visitCount}`);
        return true;
      } else {
        logTest('重复访问计数', false, '访问次数未正确更新');
        return false;
      }
    } else {
      logTest('重复访问', false, response.data.message);
      return false;
    }
  } catch (error) {
    logTest('重复访问', false, error.response?.data?.message || error.message);
    return false;
  }
}

// 测试4: 获取邀请码（被邀请人）
async function test4_GetReferralCode() {
  console.log('\n📝 测试4: 获取邀请码');
  try {
    const response = await axios.post(`${API_URL}/referral/get-code`, {
      fingerprint: testData.fingerprint
    });
    
    if (response.data.success && response.data.referralCode === testData.referrerCode) {
      logTest('获取邀请码', true, `邀请码: ${response.data.referralCode}`);
      return true;
    } else {
      logTest('获取邀请码', false, '邀请码不匹配');
      return false;
    }
  } catch (error) {
    logTest('获取邀请码', false, error.response?.data?.message || error.message);
    return false;
  }
}

// 测试5: 被邀请人注册（转化）
async function test5_RefereeRegister() {
  console.log('\n📝 测试5: 被邀请人注册');
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      ...testData.referee,
      referralCode: testData.referrerCode
    });
    
    if (response.data.success && response.data.data) {
      testData.refereeId = response.data.data.user.id;
      logTest('被邀请人注册', true, `用户ID: ${testData.refereeId}`);
      
      // 等待异步处理完成（佣金发放等）
      console.log('   等待异步处理...');
      await delay(3000);
      
      // 验证转化状态
      const visit = await ReferralVisit.findOne({
        referralCode: testData.referrerCode,
        fingerprint: testData.fingerprint
      });
      
      if (visit && visit.converted) {
        logTest('转化状态更新', true, `转化时间: ${visit.convertedAt}`);
        return true;
      } else {
        logTest('转化状态更新', false, '转化状态未更新');
        return false;
      }
    } else {
      logTest('被邀请人注册', false, response.data.message);
      return false;
    }
  } catch (error) {
    logTest('被邀请人注册', false, error.response?.data?.message || error.message);
    return false;
  }
}

// 测试6: 验证推荐人佣金
async function test6_VerifyCommission() {
  console.log('\n📝 测试6: 验证推荐人佣金');
  try {
    const referrer = await User.findById(testData.referrerId);
    
    if (!referrer) {
      logTest('查询推荐人', false, '推荐人不存在');
      return false;
    }
    
    // 检查推荐人统计
    if (referrer.referralStats && referrer.referralStats.totalReferrals >= 1) {
      logTest('推荐人统计', true, `总推荐数: ${referrer.referralStats.totalReferrals}`);
    } else {
      logTest('推荐人统计', false, `推荐数未更新 (当前: ${referrer.referralStats?.totalReferrals || 0})`);
    }
    
    // 检查佣金记录（尝试两种类型）
    let commissionLog = await BalanceLog.findOne({
      userId: testData.referrerId,
      type: 'referral_bonus',
      relatedUserId: testData.refereeId
    });
    
    // 如果没找到，尝试旧的类型名
    if (!commissionLog) {
      commissionLog = await BalanceLog.findOne({
        userId: testData.referrerId,
        type: 'referral_reward',
        relatedUser: testData.refereeId
      });
    }
    
    if (commissionLog) {
      logTest('佣金记录', true, `佣金金额: ${commissionLog.amount} (类型: ${commissionLog.type})`);
      return true;
    } else {
      logTest('佣金记录', false, '未找到佣金记录（已尝试 referral_bonus 和 referral_reward）');
      return false;
    }
  } catch (error) {
    logTest('验证佣金', false, error.message);
    return false;
  }
}

// 测试7: 验证被邀请人数据
async function test7_VerifyReferee() {
  console.log('\n📝 测试7: 验证被邀请人数据');
  try {
    const referee = await User.findById(testData.refereeId);
    
    if (!referee) {
      logTest('查询被邀请人', false, '被邀请人不存在');
      return false;
    }
    
    if (referee.referredBy && referee.referredBy.toString() === testData.referrerId) {
      logTest('推荐关系', true, '推荐关系正确');
      return true;
    } else {
      logTest('推荐关系', false, '推荐关系不正确');
      return false;
    }
  } catch (error) {
    logTest('验证被邀请人', false, error.message);
    return false;
  }
}

// 测试8: 性能测试（批量访问）
async function test8_PerformanceTest() {
  console.log('\n📝 测试8: 性能测试（10次并发访问）');
  try {
    const startTime = Date.now();
    const promises = [];
    
    for (let i = 0; i < 10; i++) {
      promises.push(
        axios.post(`${API_URL}/referral/track`, {
          referralCode: testData.referrerCode,
          fingerprint: `perf_test_${i}_${Date.now()}`
        }).catch(err => ({ error: true, message: err.message }))
      );
    }
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const successCount = results.filter(r => !r.error && r.data?.success).length;
    
    logTest('并发访问', successCount >= 8, 
      `成功: ${successCount}/10, 耗时: ${duration}ms`);
    
    return successCount >= 8;
  } catch (error) {
    logTest('性能测试', false, error.message);
    return false;
  }
}

// 检查服务器是否运行
async function checkServer() {
  console.log('🔍 检查服务器状态...');
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 3000 });
    console.log('✅ 服务器运行正常\n');
    return true;
  } catch (error) {
    console.error('❌ 服务器未运行或无法访问');
    console.error(`   请确保服务器在 ${BASE_URL} 上运行`);
    console.error('   运行命令: npm start\n');
    return false;
  }
}

// 主测试流程
async function runTests() {
  console.log('🚀 开始邀请追踪系统测试\n');
  console.log('='.repeat(60));
  
  // 检查服务器
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('⚠️  跳过 API 测试，因为服务器未运行');
    console.log('💡 提示: 先启动服务器 (npm start)，然后重新运行测试\n');
    process.exit(1);
  }
  
  await connectDB();
  await cleanup();
  
  console.log('='.repeat(60));
  console.log('\n📋 开始执行测试用例\n');
  
  // 执行测试
  await test1_CreateReferrer();
  await test2_TrackVisit();
  await test3_DuplicateVisit();
  await test4_GetReferralCode();
  await test5_RefereeRegister();
  await test6_VerifyCommission();
  await test7_VerifyReferee();
  await test8_PerformanceTest();
  
  // 输出测试报告
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试报告');
  console.log('='.repeat(60));
  console.log(`总测试数: ${testResults.tests.length}`);
  console.log(`✅ 通过: ${testResults.passed}`);
  console.log(`❌ 失败: ${testResults.failed}`);
  console.log(`成功率: ${((testResults.passed / testResults.tests.length) * 100).toFixed(2)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n失败的测试:');
    testResults.tests
      .filter(t => !t.passed)
      .forEach(t => console.log(`  - ${t.name}: ${t.message}`));
  }
  
  console.log('='.repeat(60));
  
  // 清理并关闭
  await cleanup();
  await mongoose.connection.close();
  
  console.log('\n✅ 测试完成！');
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// 运行测试
runTests().catch(error => {
  console.error('❌ 测试执行失败:', error);
  process.exit(1);
});
