/**
 * 测试不同的BEpusdt请求参数组合
 * 找出导致SQL错误的具体原因
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

async function testVariation(name, requestData) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🧪 测试: ${name}`);
  console.log('='.repeat(70));
  console.log('请求参数:', JSON.stringify(requestData, null, 2));
  
  const signature = generateSignature(requestData, config.secretKey);
  requestData.signature = signature;
  
  try {
    const response = await axios.post(
      `${config.url}/api/v1/order/create-transaction`,
      requestData,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );
    
    if (response.data.status_code === 200) {
      console.log('✅ 成功！');
      console.log('响应:', JSON.stringify(response.data, null, 2));
      return true;
    } else {
      console.log('❌ 失败:', response.data.message);
      return false;
    }
  } catch (error) {
    if (error.response) {
      console.log('❌ 失败:', error.response.data.message);
    } else {
      console.log('❌ 网络错误:', error.message);
    }
    return false;
  }
}

async function runTests() {
  console.log('\n🔍 BEpusdt参数变化测试');
  console.log('目标: 找出导致SQL错误的具体参数\n');
  
  const baseOrderId = `TEST${Date.now()}`;
  
  // 测试1: 最简参数（只包含必需字段）
  await testVariation('最简参数', {
    order_id: `${baseOrderId}_1`,
    amount: '10.00',
    notify_url: `${config.backendUrl}/api/recharge/webhook`
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试2: 添加trade_type
  await testVariation('添加trade_type', {
    order_id: `${baseOrderId}_2`,
    trade_type: 'usdt.trc20',
    amount: '10.00',
    notify_url: `${config.backendUrl}/api/recharge/webhook`
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试3: 添加name
  await testVariation('添加name', {
    order_id: `${baseOrderId}_3`,
    trade_type: 'usdt.trc20',
    name: '测试订单',
    amount: '10.00',
    notify_url: `${config.backendUrl}/api/recharge/webhook`
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试4: 添加timeout
  await testVariation('添加timeout', {
    order_id: `${baseOrderId}_4`,
    trade_type: 'usdt.trc20',
    name: '测试订单',
    timeout: 1800,
    amount: '10.00',
    notify_url: `${config.backendUrl}/api/recharge/webhook`
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试5: 添加redirect_url
  await testVariation('添加redirect_url', {
    order_id: `${baseOrderId}_5`,
    trade_type: 'usdt.trc20',
    name: '测试订单',
    timeout: 1800,
    amount: '10.00',
    notify_url: `${config.backendUrl}/api/recharge/webhook`,
    redirect_url: `${config.frontendUrl}/dashboard/recharge`
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试6: 完整参数（包含空字段）
  await testVariation('完整参数（包含空字段）', {
    address: '',
    trade_type: 'usdt.trc20',
    order_id: `${baseOrderId}_6`,
    name: '测试订单',
    timeout: 1800,
    rate: '',
    amount: '10.00',
    notify_url: `${config.backendUrl}/api/recharge/webhook`,
    redirect_url: `${config.frontendUrl}/dashboard/recharge`
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试7: 不包含空字段
  await testVariation('不包含空字段', {
    trade_type: 'usdt.trc20',
    order_id: `${baseOrderId}_7`,
    name: '测试订单',
    timeout: 1800,
    amount: '10.00',
    notify_url: `${config.backendUrl}/api/recharge/webhook`,
    redirect_url: `${config.frontendUrl}/dashboard/recharge`
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试8: 使用TRX
  await testVariation('使用TRX币种', {
    trade_type: 'tron.trx',
    order_id: `${baseOrderId}_8`,
    name: '测试订单',
    timeout: 1800,
    amount: '10.00',
    notify_url: `${config.backendUrl}/api/recharge/webhook`,
    redirect_url: `${config.frontendUrl}/dashboard/recharge`
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试9: 不同的金额
  await testVariation('小金额(1.00)', {
    trade_type: 'usdt.trc20',
    order_id: `${baseOrderId}_9`,
    name: '测试订单',
    timeout: 1800,
    amount: '1.00',
    notify_url: `${config.backendUrl}/api/recharge/webhook`,
    redirect_url: `${config.frontendUrl}/dashboard/recharge`
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试10: 大金额
  await testVariation('大金额(1000.00)', {
    trade_type: 'usdt.trc20',
    order_id: `${baseOrderId}_10`,
    name: '测试订单',
    timeout: 1800,
    amount: '1000.00',
    notify_url: `${config.backendUrl}/api/recharge/webhook`,
    redirect_url: `${config.frontendUrl}/dashboard/recharge`
  });
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 测试完成');
  console.log('='.repeat(70));
  console.log('\n💡 如果所有测试都失败，说明是BEpusdt服务器端问题');
  console.log('💡 如果某些测试成功，说明是特定参数导致的问题\n');
}

runTests().catch(console.error);
