/**
 * 演示邀请码反作弊机制
 * 这个脚本会：
 * 1. 创建一个推荐人账户
 * 2. 使用推荐人的邀请码注册多个相似邮箱
 * 3. 展示反作弊机制如何拦截
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
  console.log('🎯 邀请码反作弊机制演示');
  console.log('='.repeat(70));
  console.log('');

  try {
    // 1. 创建推荐人
    console.log('📝 步骤1: 创建推荐人账户');
    console.log('-'.repeat(70));
    
    const referrerEmail = `referrer_${Date.now()}@test.com`;
    let referralCode;

    try {
      const res = await axios.post(`${API_BASE}/auth/register`, {
        username: 'referrer_demo',
        email: referrerEmail,
        password: 'password123'
      });
      referralCode = res.data.data.user.referralCode;
      console.log(`✅ 推荐人创建成功`);
      console.log(`   邮箱: ${referrerEmail}`);
      console.log(`   邀请码: ${referralCode}`);
    } catch (error) {
      console.error(`❌ 创建推荐人失败: ${error.response?.data?.message || error.message}`);
      return;
    }

    console.log('');
    await sleep(1000);

    // 2. 测试相似邮箱注册
    console.log('📝 步骤2: 测试相似邮箱批量注册（使用邀请码）');
    console.log('-'.repeat(70));
    console.log(`使用邀请码: ${referralCode}`);
    console.log('');

    const testEmails = [
      'testuser1@gmail.com',
      'testuser2@gmail.com',
      'testuser3@gmail.com',
      'testuser4@gmail.com'
    ];

    for (let i = 0; i < testEmails.length; i++) {
      const email = testEmails[i];
      const username = `testuser${i + 1}`;

      try {
        const res = await axios.post(`${API_BASE}/auth/register`, {
          username,
          email,
          password: 'password123',
          referralCode  // 使用邀请码
        });

        console.log(`✅ [${i + 1}/${testEmails.length}] ${email}`);
        console.log(`   注册成功，获得积分: ${res.data.data.user.points}`);
      } catch (error) {
        const message = error.response?.data?.message || error.message;
        console.log(`🚫 [${i + 1}/${testEmails.length}] ${email}`);
        console.log(`   被拦截: ${message}`);
      }

      await sleep(500);
    }

    console.log('');
    console.log('='.repeat(70));
    console.log('📊 测试结果说明');
    console.log('='.repeat(70));
    console.log('');
    console.log('✅ 第1个相似邮箱 (testuser1@gmail.com):');
    console.log('   应该注册成功 - 这是第一次使用该邮箱模式');
    console.log('');
    console.log('🚫 第2-4个相似邮箱 (testuser2-4@gmail.com):');
    console.log('   应该被拦截 - 检测到相似邮箱模式');
    console.log('');
    console.log('💡 反作弊规则:');
    console.log('   1. 相似邮箱检测: testuser1, testuser2... 会被识别为相似');
    console.log('   2. 同IP限制: 24小时内同一IP+同一邀请码最多2个账户');
    console.log('   3. 自推荐拦截: 推荐人和新用户不能使用相同IP');
    console.log('   4. 临时邮箱拦截: 不允许使用临时邮箱服务');
    console.log('');

  } catch (error) {
    console.error('❌ 演示失败:', error.message);
  }
}

// 运行演示
console.log('');
console.log('⚠️  请确保服务器正在运行: npm start');
console.log('');
setTimeout(demo, 1000);
