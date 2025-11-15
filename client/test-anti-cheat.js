/**
 * 测试邀请码反作弊机制
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// 测试配置
const TEST_CONFIG = {
  referrerEmail: 'referrer@test.com',
  referrerPassword: 'password123',
  testEmails: [
    'aabb1@gmail.com',
    'aabb2@gmail.com',
    'aabb3@gmail.com',
    'aabb4@gmail.com',
    'aabb5@gmail.com',
    'aabb6@gmail.com'
  ]
};

async function testAntiCheat() {
  console.log('🧪 开始测试邀请码反作弊机制\n');

  try {
    // 1. 注册推荐人账户
    console.log('📝 步骤1: 注册推荐人账户...');
    let referrerData;
    try {
      const registerRes = await axios.post(`${API_BASE}/auth/register`, {
        username: 'referrer_user',
        email: TEST_CONFIG.referrerEmail,
        password: TEST_CONFIG.referrerPassword
      });
      referrerData = registerRes.data.data;
      console.log(`✅ 推荐人注册成功: ${TEST_CONFIG.referrerEmail}`);
      console.log(`   邀请码: ${referrerData.user.referralCode}\n`);
    } catch (error) {
      if (error.response?.data?.message?.includes('已被注册')) {
        // 如果已存在，尝试登录
        console.log('ℹ️  推荐人账户已存在，尝试登录...');
        const loginRes = await axios.post(`${API_BASE}/auth/login`, {
          email: TEST_CONFIG.referrerEmail,
          password: TEST_CONFIG.referrerPassword
        });
        referrerData = loginRes.data.data;
        console.log(`✅ 推荐人登录成功`);
        console.log(`   邀请码: ${referrerData.user.referralCode}\n`);
      } else {
        throw error;
      }
    }

    const referralCode = referrerData.user.referralCode;

    // 2. 测试批量注册相似邮箱
    console.log('📝 步骤2: 测试批量注册相似邮箱...');
    console.log('   使用邀请码:', referralCode);
    console.log('   测试邮箱:', TEST_CONFIG.testEmails.join(', '));
    console.log('');

    let successCount = 0;
    let blockedCount = 0;

    for (let i = 0; i < TEST_CONFIG.testEmails.length; i++) {
      const email = TEST_CONFIG.testEmails[i];
      const username = `testuser${i + 1}`;

      try {
        const res = await axios.post(`${API_BASE}/auth/register`, {
          username,
          email,
          password: 'password123',
          referralCode
        });

        successCount++;
        console.log(`✅ [${i + 1}/${TEST_CONFIG.testEmails.length}] ${email} - 注册成功`);
      } catch (error) {
        const message = error.response?.data?.message || error.message;
        
        if (message.includes('异常注册') || message.includes('相似邮箱')) {
          blockedCount++;
          console.log(`🚫 [${i + 1}/${TEST_CONFIG.testEmails.length}] ${email} - 被反作弊拦截: ${message}`);
        } else if (message.includes('已被注册')) {
          console.log(`⚠️  [${i + 1}/${TEST_CONFIG.testEmails.length}] ${email} - 邮箱已存在（跳过）`);
        } else {
          console.log(`❌ [${i + 1}/${TEST_CONFIG.testEmails.length}] ${email} - 注册失败: ${message}`);
        }
      }

      // 延迟一下，避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 3. 显示测试结果
    console.log('\n' + '='.repeat(60));
    console.log('📊 测试结果汇总');
    console.log('='.repeat(60));
    console.log(`✅ 成功注册: ${successCount} 个`);
    console.log(`🚫 被拦截: ${blockedCount} 个`);
    console.log(`📧 总测试数: ${TEST_CONFIG.testEmails.length} 个`);
    console.log('');

    if (successCount === 1 && blockedCount === TEST_CONFIG.testEmails.length - 1) {
      console.log('🎉 反作弊机制工作正常！');
      console.log('   ✓ 第一个相似邮箱可以注册');
      console.log('   ✓ 后续相似邮箱被正确拦截');
    } else if (successCount > 2) {
      console.log('⚠️  反作弊机制可能过于宽松！');
      console.log(`   允许了 ${successCount} 个相似邮箱注册`);
    } else if (successCount === 0) {
      console.log('⚠️  反作弊机制可能过于严格！');
      console.log('   所有注册都被拦截');
    }

    console.log('\n💡 提示:');
    console.log('   - 相似邮箱检测: aabb1, aabb2, aabb3... 会被识别为相似模式');
    console.log('   - 同IP限制: 24小时内同一IP最多注册2个账户');
    console.log('   - 自推荐拦截: 推荐人和新用户不能使用相同IP');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.response?.data) {
      console.error('   错误详情:', error.response.data);
    }
  }
}

// 运行测试
testAntiCheat();
