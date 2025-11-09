/**
 * 模拟BEpusdt支付回调
 * 用于测试Webhook处理逻辑
 */

require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

const orderId = process.argv[2];
const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`;
const secretKey = process.env.BEPUSDT_SECRET_KEY;

if (!orderId) {
  console.error('❌ 请提供订单号');
  console.log('用法: node simulatePayment.js ORDER1234567890');
  process.exit(1);
}

// 生成签名
function generateSignature(params) {
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

async function simulatePayment() {
  console.log('🧪 模拟BEpusdt支付回调');
  console.log('📋 订单号:', orderId);
  console.log('🌐 Webhook URL:', `${backendUrl}/api/recharge/webhook`);
  console.log('');

  // 构造Webhook数据
  const webhookData = {
    order_id: orderId,
    status: 2,  // 2表示已支付
    tx_hash: `0x${crypto.randomBytes(32).toString('hex')}`,  // 模拟交易哈希
    block_number: Math.floor(Math.random() * 1000000) + 10000000,  // 模拟区块号
    amount: '100',  // 模拟金额
    actual_amount: '100'
  };

  // 生成签名
  const signature = generateSignature(webhookData);
  webhookData.signature = signature;

  console.log('📤 发送Webhook数据:');
  console.log(JSON.stringify(webhookData, null, 2));
  console.log('');

  try {
    const response = await axios.post(
      `${backendUrl}/api/recharge/webhook`,
      webhookData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('✅ Webhook响应:');
    console.log('   状态码:', response.status);
    console.log('   响应:', response.data);
    console.log('');
    console.log('🎉 支付模拟成功！');
    console.log('');
    console.log('💡 现在可以查询订单状态:');
    console.log(`   curl ${backendUrl}/api/recharge/query/${orderId}`);
  } catch (error) {
    console.error('❌ Webhook调用失败:');
    if (error.response) {
      console.error('   状态码:', error.response.status);
      console.error('   响应:', error.response.data);
    } else {
      console.error('   错误:', error.message);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 提示: 后端服务未运行，请先启动:');
      console.log('   cd server');
      console.log('   npm start');
    }
  }
}

simulatePayment().catch(console.error);
