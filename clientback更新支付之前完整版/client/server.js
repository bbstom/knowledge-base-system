// 简单的Express后端服务器 - 用于处理BEpusdt API调用
// 使用方法：node server.js

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// BEpusdt配置 - 从localStorage读取或使用默认值
const BEPUSDT_URL = 'https://pay.vpno.eu.org';
const BEPUSDT_API_KEY = '123234';
const BEPUSDT_MERCHANT_ID = '1000';

console.log('='.repeat(50));
console.log('BEpusdt支付服务器启动');
console.log('='.repeat(50));
console.log(`服务地址: ${BEPUSDT_URL}`);
console.log(`商户ID: ${BEPUSDT_MERCHANT_ID}`);
console.log('='.repeat(50));

// 创建订单
app.post('/api/bepusdt/create-order', async (req, res) => {
  console.log('\n📝 创建订单请求:', req.body);
  
  try {
    const response = await axios.post(
      `${BEPUSDT_URL}/api/v1/order/create-transaction`,
      {
        ...req.body,
        merchant_id: BEPUSDT_MERCHANT_ID
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BEPUSDT_API_KEY}`
        }
      }
    );
    
    console.log('✅ 订单创建成功:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('❌ 创建订单失败:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: error.response?.data?.message || '创建订单失败',
      error: error.message
    });
  }
});

// 查询订单
app.get('/api/bepusdt/query-order', async (req, res) => {
  const { order_id } = req.query;
  console.log(`\n🔍 查询订单: ${order_id}`);
  
  try {
    const response = await axios.get(
      `${BEPUSDT_URL}/api/v1/order/query-order-info?order_id=${order_id}`,
      {
        headers: {
          'Authorization': `Bearer ${BEPUSDT_API_KEY}`
        }
      }
    );
    
    console.log('✅ 订单查询成功:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('❌ 查询订单失败:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: error.response?.data?.message || '查询订单失败',
      error: error.message
    });
  }
});

// Webhook通知
app.post('/api/payment/notify', async (req, res) => {
  console.log('\n🔔 收到Webhook通知:', req.body);
  
  try {
    const webhookData = req.body;
    
    // TODO: 验证签名
    // TODO: 更新订单状态
    // TODO: 充值用户余额
    
    console.log('✅ Webhook处理成功');
    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Webhook处理失败:', error);
    res.status(500).send('Error');
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    bepusdt_url: BEPUSDT_URL,
    merchant_id: BEPUSDT_MERCHANT_ID
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📡 健康检查: http://localhost:${PORT}/health`);
  console.log('\n等待前端请求...\n');
});
