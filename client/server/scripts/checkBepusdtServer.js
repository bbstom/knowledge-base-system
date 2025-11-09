/**
 * 检查BEpusdt服务器状态和可用端点
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const axios = require('axios');

const baseUrl = process.env.BEPUSDT_URL;

console.log('\n🔍 检查BEpusdt服务器状态\n');
console.log('服务器地址:', baseUrl);
console.log('='.repeat(70) + '\n');

async function checkEndpoint(name, url, method = 'GET') {
  try {
    console.log(`📡 测试: ${name}`);
    console.log(`   URL: ${url}`);
    console.log(`   方法: ${method}`);
    
    const response = await axios({
      method,
      url,
      timeout: 10000,
      validateStatus: () => true // 接受所有状态码
    });
    
    console.log(`   ✅ 响应: ${response.status}`);
    if (response.data) {
      console.log(`   数据:`, JSON.stringify(response.data).substring(0, 200));
    }
    console.log('');
    return true;
  } catch (error) {
    console.log(`   ❌ 错误: ${error.message}`);
    console.log('');
    return false;
  }
}

async function runChecks() {
  // 检查常见端点
  await checkEndpoint('主页', baseUrl);
  await checkEndpoint('API根路径', `${baseUrl}/api`);
  await checkEndpoint('API v1', `${baseUrl}/api/v1`);
  await checkEndpoint('健康检查', `${baseUrl}/health`);
  await checkEndpoint('健康检查 (API)', `${baseUrl}/api/health`);
  await checkEndpoint('状态', `${baseUrl}/status`);
  await checkEndpoint('状态 (API)', `${baseUrl}/api/status`);
  await checkEndpoint('版本信息', `${baseUrl}/version`);
  await checkEndpoint('版本信息 (API)', `${baseUrl}/api/version`);
  await checkEndpoint('支持的币种', `${baseUrl}/api/v1/supported-currencies`);
  await checkEndpoint('汇率', `${baseUrl}/api/v1/exchange-rates`);
  await checkEndpoint('订单创建端点', `${baseUrl}/api/v1/order/create-transaction`, 'POST');
  
  console.log('='.repeat(70));
  console.log('📊 检查完成');
  console.log('='.repeat(70));
  console.log('\n💡 如果服务器响应正常，说明服务器在线但有bug');
  console.log('💡 如果服务器无响应，说明服务器可能下线或维护中\n');
}

runChecks().catch(console.error);
