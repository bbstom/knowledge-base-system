/**
 * BEpusdt支付诊断工具
 * 用于排查前端/后端的支付问题
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const axios = require('axios');
const crypto = require('crypto');

console.log('\n' + '='.repeat(70));
console.log('🔍 BEpusdt支付系统诊断工具');
console.log('='.repeat(70) + '\n');

// 1. 检查环境变量配置
console.log('📋 步骤1: 检查环境变量配置');
console.log('-'.repeat(70));

const config = {
  url: process.env.BEPUSDT_URL,
  apiKey: process.env.BEPUSDT_API_KEY,
  merchantId: process.env.BEPUSDT_MERCHANT_ID,
  secretKey: process.env.BEPUSDT_SECRET_KEY,
  testMode: process.env.BEPUSDT_TEST_MODE,
  backendUrl: process.env.BACKEND_URL,
  frontendUrl: process.env.FRONTEND_URL
};

console.log('BEPUSDT_URL:', config.url || '❌ 未配置');
console.log('BEPUSDT_API_KEY:', config.apiKey ? `✅ 已配置 (${config.apiKey.substring(0, 5)}***)` : '❌ 未配置');
console.log('BEPUSDT_MERCHANT_ID:', config.merchantId || '❌ 未配置');
console.log('BEPUSDT_SECRET_KEY:', config.secretKey ? `✅ 已配置 (${config.secretKey.substring(0, 5)}***)` : '❌ 未配置');
console.log('BEPUSDT_TEST_MODE:', config.testMode || 'false');
console.log('BACKEND_URL:', config.backendUrl || '❌ 未配置');
console.log('FRONTEND_URL:', config.frontendUrl || '❌ 未配置');

if (!config.url || !config.merchantId || !config.secretKey) {
  console.log('\n❌ 配置不完整，请检查.env文件！');
  process.exit(1);
}

console.log('\n✅ 环境变量配置完整\n');

// 2. 生成签名函数
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
  
  return { signature, sortedParams, stringToSign };
}

// 3. 测试创建订单
async function testCreateOrder() {
  console.log('📋 步骤2: 测试创建订单');
  console.log('-'.repeat(70));
  
  const testOrderId = `TEST${Date.now()}`;
  
  const requestData = {
    address: '',
    trade_type: 'usdt.trc20',
    order_id: testOrderId,
    name: `测试订单-${testOrderId}`,
    timeout: 1800,
    rate: '',
    amount: '10.00',
    notify_url: `${config.backendUrl}/api/recharge/webhook`,
    redirect_url: `${config.frontendUrl}/dashboard/recharge`
  };
  
  console.log('\n📤 请求数据:');
  console.log(JSON.stringify(requestData, null, 2));
  
  const { signature, sortedParams, stringToSign } = generateSignature(requestData, config.secretKey);
  
  console.log('\n🔐 签名信息:');
  console.log('排序参数:', sortedParams);
  console.log('签名字符串:', stringToSign.substring(0, 50) + '***');
  console.log('MD5签名:', signature);
  
  requestData.signature = signature;
  
  try {
    console.log('\n🚀 发送请求到:', `${config.url}/api/v1/order/create-transaction`);
    console.log('⏳ 等待响应...\n');
    
    const response = await axios.post(
      `${config.url}/api/v1/order/create-transaction`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    console.log('✅ 请求成功！');
    console.log('\n📥 响应数据:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.status_code === 200) {
      console.log('\n🎉 订单创建成功！');
      console.log('订单ID:', testOrderId);
      console.log('收款地址:', response.data.data.token || response.data.data.address);
      console.log('支付金额:', response.data.data.actual_amount || response.data.data.amount);
      return true;
    } else {
      console.log('\n⚠️ 订单创建失败');
      console.log('错误信息:', response.data.message);
      return false;
    }
    
  } catch (error) {
    console.log('\n❌ 请求失败！');
    
    if (error.response) {
      console.log('\n📥 错误响应:');
      console.log('状态码:', error.response.status);
      console.log('响应数据:', JSON.stringify(error.response.data, null, 2));
      
      // 分析具体错误
      const errorMsg = error.response.data?.message || '';
      
      if (errorMsg.includes('transaction')) {
        console.log('\n🔍 错误分析:');
        console.log('❌ SQL事务错误 - 这是BEpusdt服务器端的问题');
        console.log('   可能原因:');
        console.log('   1. BEpusdt服务器正在维护');
        console.log('   2. 数据库连接池问题');
        console.log('   3. 并发事务处理bug');
        console.log('   4. 服务器负载过高');
        console.log('\n💡 建议:');
        console.log('   1. 联系BEpusdt服务提供商');
        console.log('   2. 检查服务器状态页面');
        console.log('   3. 稍后重试');
        console.log('   4. 使用充值卡系统作为临时方案');
      } else if (errorMsg.includes('signature')) {
        console.log('\n🔍 错误分析:');
        console.log('❌ 签名验证失败');
        console.log('   可能原因:');
        console.log('   1. SECRET_KEY配置错误');
        console.log('   2. 签名算法不匹配');
        console.log('   3. 参数格式问题');
        console.log('\n💡 建议:');
        console.log('   1. 检查.env中的BEPUSDT_SECRET_KEY');
        console.log('   2. 确认与BEpusdt服务商提供的密钥一致');
        console.log('   3. 检查签名算法是否正确');
      } else if (errorMsg.includes('merchant')) {
        console.log('\n🔍 错误分析:');
        console.log('❌ 商户ID错误');
        console.log('   可能原因:');
        console.log('   1. MERCHANT_ID配置错误');
        console.log('   2. 商户未激活');
        console.log('   3. 商户权限不足');
        console.log('\n💡 建议:');
        console.log('   1. 检查.env中的BEPUSDT_MERCHANT_ID');
        console.log('   2. 联系BEpusdt服务商确认商户状态');
      } else {
        console.log('\n🔍 错误分析:');
        console.log('❌ 未知错误:', errorMsg);
        console.log('\n💡 建议:');
        console.log('   1. 查看完整错误信息');
        console.log('   2. 联系BEpusdt服务商');
      }
      
    } else if (error.request) {
      console.log('\n🔍 错误分析:');
      console.log('❌ 网络连接失败');
      console.log('   错误代码:', error.code);
      console.log('   可能原因:');
      console.log('   1. BEpusdt服务器无法访问');
      console.log('   2. 网络连接问题');
      console.log('   3. 防火墙阻止');
      console.log('   4. URL配置错误');
      console.log('\n💡 建议:');
      console.log('   1. 检查网络连接');
      console.log('   2. 确认BEPUSDT_URL是否正确');
      console.log('   3. 尝试在浏览器访问:', config.url);
      console.log('   4. 检查防火墙设置');
    } else {
      console.log('\n🔍 错误分析:');
      console.log('❌ 未知错误:', error.message);
    }
    
    return false;
  }
}

// 4. 测试Webhook签名验证
function testWebhookSignature() {
  console.log('\n📋 步骤3: 测试Webhook签名验证');
  console.log('-'.repeat(70));
  
  const webhookData = {
    order_id: 'TEST123456',
    status: 2,
    tx_hash: '0xabcdef1234567890',
    block_number: 12345678,
    amount: '10.00'
  };
  
  console.log('\n📤 模拟Webhook数据:');
  console.log(JSON.stringify(webhookData, null, 2));
  
  const { signature } = generateSignature(webhookData, config.secretKey);
  webhookData.signature = signature;
  
  console.log('\n🔐 生成的签名:', signature);
  
  // 验证签名
  const dataToVerify = { ...webhookData };
  const receivedSignature = dataToVerify.signature;
  delete dataToVerify.signature;
  
  const { signature: expectedSignature } = generateSignature(dataToVerify, config.secretKey);
  
  console.log('收到的签名:', receivedSignature);
  console.log('期望的签名:', expectedSignature);
  console.log('验证结果:', receivedSignature === expectedSignature ? '✅ 通过' : '❌ 失败');
  
  return receivedSignature === expectedSignature;
}

// 5. 运行所有测试
async function runDiagnostics() {
  try {
    const orderSuccess = await testCreateOrder();
    const webhookSuccess = testWebhookSignature();
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 诊断结果汇总');
    console.log('='.repeat(70));
    console.log('环境变量配置:', '✅ 通过');
    console.log('创建订单测试:', orderSuccess ? '✅ 通过' : '❌ 失败');
    console.log('Webhook签名:', webhookSuccess ? '✅ 通过' : '❌ 失败');
    console.log('='.repeat(70) + '\n');
    
    if (orderSuccess && webhookSuccess) {
      console.log('🎉 所有测试通过！BEpusdt支付系统配置正确！');
    } else {
      console.log('⚠️ 部分测试失败，请根据上述错误分析进行修复。');
    }
    
  } catch (error) {
    console.error('\n❌ 诊断过程出错:', error.message);
  }
}

// 运行诊断
runDiagnostics();
