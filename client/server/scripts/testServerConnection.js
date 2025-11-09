/**
 * 测试服务器连接
 * 验证服务器是否正常运行并可以访问
 */

const axios = require('axios');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';

async function testConnection() {
  console.log('🔍 测试服务器连接\n');
  console.log(`目标地址: ${BASE_URL}\n`);
  
  // 测试1: 基本连接
  console.log('📝 测试1: 基本连接');
  try {
    const response = await axios.get(`${BASE_URL}`, { timeout: 5000 });
    console.log('✅ 服务器响应正常');
    console.log(`   状态码: ${response.status}`);
  } catch (error) {
    console.log('❌ 连接失败');
    console.log(`   错误: ${error.code} - ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.log('   💡 提示: 服务器未运行，请先启动服务器 (npm start)');
    }
  }
  
  // 测试2: Health 端点
  console.log('\n📝 测试2: Health 端点');
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    console.log('✅ Health 端点正常');
    console.log(`   响应: ${JSON.stringify(response.data)}`);
  } catch (error) {
    console.log('❌ Health 端点失败');
    console.log(`   错误: ${error.code} - ${error.message}`);
  }
  
  // 测试3: API 端点
  console.log('\n📝 测试3: API 端点');
  try {
    const response = await axios.get(`${BASE_URL}/api`, { timeout: 5000 });
    console.log('✅ API 端点可访问');
    console.log(`   状态码: ${response.status}`);
  } catch (error) {
    if (error.response) {
      console.log('✅ API 端点存在（返回错误是正常的）');
      console.log(`   状态码: ${error.response.status}`);
    } else {
      console.log('❌ API 端点不可访问');
      console.log(`   错误: ${error.code} - ${error.message}`);
    }
  }
  
  // 测试4: 邀请追踪端点
  console.log('\n📝 测试4: 邀请追踪端点');
  try {
    const response = await axios.post(
      `${BASE_URL}/api/referral/track`,
      { referralCode: 'TEST', fingerprint: 'test' },
      { 
        timeout: 5000,
        validateStatus: () => true // 接受所有状态码
      }
    );
    console.log('✅ 邀请追踪端点可访问');
    console.log(`   状态码: ${response.status}`);
    console.log(`   响应: ${JSON.stringify(response.data)}`);
  } catch (error) {
    console.log('❌ 邀请追踪端点失败');
    console.log(`   错误: ${error.code} - ${error.message}`);
  }
  
  // 总结
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试总结');
  console.log('='.repeat(60));
  console.log('如果所有测试都通过，说明服务器运行正常');
  console.log('如果有失败，请检查:');
  console.log('  1. 服务器是否启动 (npm start)');
  console.log('  2. 端口是否正确 (默认 3001)');
  console.log('  3. 防火墙设置');
  console.log('='.repeat(60));
}

testConnection();
