# 后端集成说明

## ⚠️ 重要提示

当前项目是**纯前端项目**，无法直接调用BEpusdt API。需要后端服务器来处理支付请求。

---

## 🔍 问题分析

### 当前错误
```
GET http://localhost:5173/api/bepusdt/create-order 500 (Internal Server Error)
GET http://localhost:5173/api/bepusdt/query-order 500 (Internal Server Error)
```

### 原因
1. 前端直接请求 `/api/bepusdt/*` 端点
2. 这些端点不存在（没有后端服务器）
3. 无法创建订单，无法获取支付地址
4. 因此无法显示二维码

---

## 💡 解决方案

### 方案1：添加后端服务器（推荐）

创建一个Node.js/Express后端服务器来处理BEpusdt API调用。

#### 1. 创建后端项目

```bash
# 在项目根目录创建server文件夹
mkdir server
cd server
npm init -y
npm install express cors dotenv axios
```

#### 2. 创建server/index.js

```javascript
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const BEPUSDT_URL = process.env.BEPUSDT_URL || 'https://pay.vpno.eu.org';
const BEPUSDT_API_KEY = process.env.BEPUSDT_API_KEY || '123234';
const BEPUSDT_MERCHANT_ID = process.env.BEPUSDT_MERCHANT_ID || '1000';

// 创建订单
app.post('/api/bepusdt/create-order', async (req, res) => {
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
    res.json(response.data);
  } catch (error) {
    console.error('Create order error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: error.response?.data?.message || '创建订单失败' 
    });
  }
});

// 查询订单
app.get('/api/bepusdt/query-order', async (req, res) => {
  try {
    const { order_id } = req.query;
    const response = await axios.get(
      `${BEPUSDT_URL}/api/v1/order/query-order-info?order_id=${order_id}`,
      {
        headers: {
          'Authorization': `Bearer ${BEPUSDT_API_KEY}`
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Query order error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: error.response?.data?.message || '查询订单失败' 
    });
  }
});

// Webhook通知
app.post('/api/payment/notify', async (req, res) => {
  try {
    const webhookData = req.body;
    console.log('Received webhook:', webhookData);
    
    // TODO: 验证签名
    // TODO: 更新订单状态
    // TODO: 充值用户余额
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`BEpusdt URL: ${BEPUSDT_URL}`);
});
```

#### 3. 创建server/.env

```env
BEPUSDT_URL=https://pay.vpno.eu.org
BEPUSDT_API_KEY=123234
BEPUSDT_MERCHANT_ID=1000
PORT=3001
```

#### 4. 启动后端服务器

```bash
cd server
node index.js
```

#### 5. 配置前端代理

在 `vite.config.ts` 中添加代理配置：

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
```

---

### 方案2：使用演示模式（临时方案）

修改前端代码，使用模拟数据进行演示。

#### 修改 src/pages/Dashboard/Recharge.tsx

在 `handleCreateOrder` 函数中，使用模拟数据：

```typescript
const handleCreateOrder = async () => {
  const amountNum = parseFloat(amount);
  if (!amountNum || amountNum < 10) {
    toast.error('充值金额不能低于10元');
    return;
  }

  setLoading(true);
  try {
    // 模拟订单数据（演示模式）
    const mockOrder: RechargeOrder = {
      orderId: `ORDER${Date.now()}`,
      amount: amountNum,
      actualAmount: parseFloat(calculateCryptoAmount(amountNum, currency)),
      currency: currency,
      address: 'TXxx1234567890abcdefghijklmnopqrst', // 模拟地址
      status: 'pending',
      createdAt: new Date().toISOString(),
      expireAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
    
    setCurrentOrder(mockOrder);
    toast.success('订单创建成功（演示模式）');
  } catch (error) {
    console.error('Create order error:', error);
    toast.error('创建订单失败');
  } finally {
    setLoading(false);
  }
};
```

#### 禁用订单状态查询

注释掉自动查询订单状态的代码：

```typescript
useEffect(() => {
  // 演示模式：禁用自动查询
  // let timer: NodeJS.Timeout;
  // if (currentOrder && currentOrder.status === 'pending') {
  //   timer = setInterval(() => {
  //     checkOrderStatus(currentOrder.orderId);
  //   }, 5000);
  // }
  // return () => {
  //   if (timer) clearInterval(timer);
  // };
}, [currentOrder]);
```

---

## 🚀 推荐实施步骤

### 使用方案1（完整功能）

1. **创建后端服务器**
   ```bash
   mkdir server
   cd server
   npm init -y
   npm install express cors dotenv axios
   ```

2. **复制上面的server/index.js代码**

3. **配置环境变量**
   ```
   BEPUSDT_URL=https://pay.vpno.eu.org
   BEPUSDT_API_KEY=123234
   BEPUSDT_MERCHANT_ID=1000
   ```

4. **启动后端**
   ```bash
   node index.js
   ```

5. **配置前端代理**（vite.config.ts）

6. **测试充值功能**

---

## 📋 后端API规范

### 1. 创建订单

**请求：**
```
POST /api/bepusdt/create-order
Content-Type: application/json

{
  "order_id": "ORDER1234567890",
  "amount": 100,
  "currency": "USDT",
  "notify_url": "https://yourdomain.com/api/payment/notify",
  "redirect_url": "https://yourdomain.com/dashboard/recharge"
}
```

**响应：**
```json
{
  "success": true,
  "order_id": "ORDER1234567890",
  "payment_address": "TXxx1234567890abcdefghijklmnopqrst",
  "amount": 100,
  "actual_amount": 13.89,
  "currency": "USDT",
  "expire_time": 900
}
```

### 2. 查询订单

**请求：**
```
GET /api/bepusdt/query-order?order_id=ORDER1234567890
```

**响应：**
```json
{
  "success": true,
  "order_id": "ORDER1234567890",
  "status": "paid",
  "amount": 100,
  "actual_amount": 13.89,
  "currency": "USDT",
  "payment_address": "TXxx1234567890abcdefghijklmnopqrst",
  "tx_hash": "0xabcdef1234567890",
  "created_at": "2024-10-19T10:30:00Z",
  "updated_at": "2024-10-19T10:35:00Z"
}
```

### 3. Webhook通知

**请求：**
```
POST /api/payment/notify
Content-Type: application/json

{
  "order_id": "ORDER1234567890",
  "amount": 100,
  "actual_amount": 13.89,
  "currency": "USDT",
  "status": "paid",
  "tx_hash": "0xabcdef1234567890",
  "sign": "md5_signature"
}
```

**响应：**
```
200 OK
```

---

## 🔐 安全建议

1. **验证Webhook签名**
   ```javascript
   const crypto = require('crypto');
   
   function verifySignature(data, secret) {
     const signString = `${data.order_id}${data.amount}${data.actual_amount}${data.currency}${data.status}${secret}`;
     const expectedSign = crypto.createHash('md5').update(signString).digest('hex');
     return data.sign === expectedSign;
   }
   ```

2. **使用环境变量**
   - 不要在代码中硬编码API密钥
   - 使用 `.env` 文件管理敏感信息

3. **添加请求限流**
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   });
   
   app.use('/api/', limiter);
   ```

4. **HTTPS部署**
   - 生产环境必须使用HTTPS
   - 配置SSL证书

---

## 📞 需要帮助？

如果需要完整的后端实现，请告诉我，我可以：
1. 创建完整的Node.js后端项目
2. 添加数据库集成
3. 实现用户余额管理
4. 添加订单记录
5. 实现Webhook处理

---

更新时间：2024-10-19
