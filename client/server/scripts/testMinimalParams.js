/**
 * 测试最精简的BEpusdt参数
 * 根据历史文档，移除所有空字段
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const axios = require('axios');
const crypto = require('crypto');

const config = {
  url: process.env.BEPUSDT_URL,
  merchantId: process.env.BEPUSDT_MERCHANT_ID,
  secretKey: process.env.BEPUSDT_SECRET_KEY,
  backendUrl: process.env.BACKEND_URL,
  frontendUrl: process.env.FRONTEND_URL
};

function generateSignature(params, secretKey) {
  const sortedParams = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  
  const stringToSign = sortedParams + secretKey;
  const signature = crypto.createHash('md5')
    .update(stringToSign)
    .digest('hex')
    .toLowerCase();
  
  return signature;
}

async function testRequest(name, requestData) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🧪 ${name}`);
  console.log('='.repeat(70));
  console.log('请求参数:', JSON.stringify(requestData, null, 2));
  
  const signature = generateSignature(requestData, config.secretKey);
  requestData.signature = signature;
  
  console.log('签名:', signature);
  
  try {
    const response = await axios.post(
      `${config.url}/api/v1/order/create-transaction`,
      requestData,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );
    
    console.log('✅ 成功！');
    console.log('响应:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    if (error.response) {
      console.log('❌ 失败:', error.response.data.message || error.response.data);
    } else {
      console.log('❌ 网络错误:', error.message);
    }
    return false;
  }
}

async function runTests() {
  const orderId = `TEST${Date.now()}`;
  
  console.log('\n🔍 测试精简参数组合\n');
  
  // 测试1: 只包含必需字段（根据错误提示）
  await testRequest('测试1: 必需字段', {
    order_id: `${orderId}_1`,
    amount: '10.00',
    notify_url: `${config.backendUrl}/api/recharge/webhook`,
    redirect_url: `${config.frontendUrl}/dashboard/recharge`
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试2: 添加trade_type
  await testRequest('测试2: +trade_type', {
    order_id: `${orderId}_2`,
    trade_type: 'usdt.trc20',
    amount: '10.00',
    notify_url: `${config.backendUrl}/api/recharge/webhook`,
    redirect_url: `${config.frontendUrl}/dashboard/recharge`
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试3: 添加name（短名称）
  await testRequest('测试3: +name（短）', {
    order_id: `${orderId}_3`,
    trade_type: 'usdt.trc20',
    name: 'Test Order',
    amount: '10.00',
    notify_url: `${config.backendUrl}/api/recharge/webhook`,
    redirect_url: `${config.frontendUrl}/dashboard/recharge`
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试4: 添加timeout（不同值）
  await testRequest('测试4: +timeout=900', {
    order_id: `${orderId}_4`,
    trade_type: 'usdt.trc20',
    name: 'Test Order',
    timeout: 900,
    amount: '10.00',
    notify_url: `${config.backendUrl}/api/recharge/webhook`,
    redirect_url: `${config.frontendUrl}/dashboard/recharge`
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试5: 不包含name
  await testRequest('测试5: 无name字段', {
    order_id: `${orderId}_5`,
    trade_type: 'usdt.trc20',
    timeout: 1800,
    amount: '10.00',
    notify_url: `${config.backendUrl}/api/recharge/webhook`,
    redirect_url: `${config.frontendUrl}/dashboard/recharge`
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试6: 使用不同的订单号格式
  await testRequest('测试6: 简短订单号', {
    order_id: `T${Date.now()}`,
    trade_type: 'usdt.trc20',
    amount: '10.00',
    notify_url: `${config.backendUrl}/api/recharge/webhook`,
    redirect_url: `${config.frontendUrl}/dashboard/recharge`
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试7: 使用不同的金额格式
  await testRequest('测试7: 整数金额', {
    order_id: `${orderId}_7`,
    trade_type: 'usdt.trc20',
    amount: '10',
    notify_url: `${config.backendUrl}/api/recharge/webhook`,
    redirect_url: `${config.frontendUrl}/dashboard/recharge`
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试8: 使用数字类型的金额
  await testRequest('测试8: 数字类型金额', {
    order_id: `${orderId}_8`,
    trade_type: 'usdt.trc20',
    amount: 10,
    notify_url: `${config.backendUrl}/api/recharge/webhook`,
    redirect_url: `${config.frontendUrl}/dashboard/recharge`
  });
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 测试完成');
  console.log('='.repeat(70));
  console.log('\n💡 如果所有测试都失败，请联系BEpusdt服务提供商');
  console.log('💡 如果某些测试成功，说明是参数格式问题\n');
}

runTests().catch(console.error);
