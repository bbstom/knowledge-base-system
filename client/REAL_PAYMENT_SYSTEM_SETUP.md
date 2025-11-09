# 真实支付系统配置指南

## 📋 概述

本指南将帮助您配置真实的BEPUSDT支付系统，移除所有模拟支付功能。

---

## 🔧 配置步骤

### 1. 配置环境变量

编辑 `server/.env` 文件：

```env
# BEpusdt配置
BEPUSDT_URL=https://pay.vpno.eu.org
BEPUSDT_API_KEY=123234
BEPUSDT_MERCHANT_ID=1000
BEPUSDT_SECRET_KEY=1000
BEPUSDT_TEST_MODE=false  # ✅ 设置为false启用真实支付

# 前端地址（用于webhook回调）
FRONTEND_URL=http://localhost:5173  # 生产环境改为实际域名
```

### 2. 验证BEpusdt服务

确保您的BEpusdt服务正常运行：

```bash
# 测试API连接
curl -X GET "https://pay.vpno.eu.org/api/v1/health" \
  -H "Authorization: Bearer 123234"
```

### 3. 配置Webhook

在BEpusdt管理后台配置webhook URL：

```
https://your-domain.com/api/recharge/webhook
```

**重要：** 确保webhook URL可以从外网访问！

---

## 🚀 系统功能

### 支持的支付方式

1. **USDT (TRC20)**
   - 稳定币，汇率相对稳定
   - 1 USDT ≈ 7.2 CNY（实时汇率）
   - 最低充值：10元

2. **TRX (TRC20)**
   - 波场原生代币
   - 1 TRX ≈ 0.8 CNY（实时汇率）
   - 手续费更低

### 支付流程

```
用户选择金额 → 创建订单 → 生成收款地址 
    ↓
用户转账 → 区块链确认 → Webhook通知 
    ↓
订单完成 → 余额到账 → 佣金结算
```

---

## 💡 关键改进

### 1. 移除测试模式

**之前（测试模式）：**
```javascript
if (this.testMode) {
  return {
    success: true,
    payment_address: 'TTest123MockAddress...',
    // 模拟数据
  };
}
```

**现在（真实支付）：**
```javascript
// 直接调用真实API
const response = await axios.post(
  `${this.baseUrl}/api/v1/order/create-transaction`,
  orderData,
  { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
);
return response.data;
```

### 2. 实时订单状态检测

**轮询机制：**
- 订单创建后每5秒检查一次状态
- 支付成功后立即停止轮询
- 订单过期后自动停止

**Webhook通知：**
- 支付成功后BEpusdt主动推送通知
- 验证签名确保安全性
- 自动处理余额充值和佣金结算

### 3. 安全机制

**签名验证：**
```javascript
const signString = `${order_id}${amount}${actual_amount}${currency}${status}${secretKey}`;
const expectedSign = crypto.createHash('md5').update(signString).digest('hex');
return webhookData.sign === expectedSign;
```

**防重放攻击：**
- 检查订单状态，已支付的订单不重复处理
- 记录所有webhook请求日志
- 设置订单过期时间

---

## 📊 数据库设计

### RechargeOrder 模型

```javascript
{
  userId: ObjectId,           // 用户ID
  orderId: String,            // 订单号（唯一）
  type: String,               // 类型：points/vip
  amount: Number,             // 人民币金额
  actualAmount: Number,       // 加密货币金额
  currency: String,           // 币种：USDT/TRX
  paymentAddress: String,     // 收款地址
  status: String,             // 状态：pending/paid/expired/failed
  txHash: String,             // 交易哈希
  blockNumber: Number,        // 区块高度
  points: Number,             // 充值积分数
  vipDays: Number,            // VIP天数
  vipPackageName: String,     // VIP套餐名称
  expireAt: Date,             // 过期时间
  paidAt: Date,               // 支付时间
  createdAt: Date,            // 创建时间
  updatedAt: Date             // 更新时间
}
```

---

## 🔄 API接口

### 1. 创建充值订单

**接口：** `POST /api/recharge/create`

**请求头：**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体：**
```json
{
  "type": "points",
  "amount": 100,
  "currency": "USDT",
  "points": 1000
}
```

**响应：**
```json
{
  "success": true,
  "order": {
    "orderId": "ORDER1729328400123",
    "amount": 100,
    "actualAmount": 13.89,
    "currency": "USDT",
    "paymentAddress": "TXxx1234567890abcdefghijklmnopqrst",
    "expireAt": "2024-10-19T10:45:00Z",
    "status": "pending"
  }
}
```

### 2. 查询订单状态

**接口：** `GET /api/recharge/query/:orderId`

**响应：**
```json
{
  "success": true,
  "order": {
    "orderId": "ORDER1729328400123",
    "status": "paid",
    "amount": 100,
    "actualAmount": 13.89,
    "currency": "USDT",
    "txHash": "0xabcdef1234567890",
    "paidAt": "2024-10-19T10:35:00Z"
  }
}
```

### 3. 获取充值记录

**接口：** `GET /api/recharge/history`

**请求头：**
```
Authorization: Bearer <token>
```

**查询参数：**
```
page=1&limit=10
```

**响应：**
```json
{
  "success": true,
  "orders": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### 4. Webhook通知

**接口：** `POST /api/recharge/webhook`

**请求体：**
```json
{
  "order_id": "ORDER1729328400123",
  "amount": 100,
  "actual_amount": 13.89,
  "currency": "USDT",
  "status": "paid",
  "tx_hash": "0xabcdef1234567890",
  "block_number": 12345678,
  "sign": "md5_signature"
}
```

---

## 🧪 测试流程

### 开发环境测试

1. **启动服务器**
```bash
cd server
npm start
```

2. **访问充值页面**
```
http://localhost:5173/dashboard/recharge
```

3. **创建测试订单**
- 选择金额：10元
- 选择币种：USDT
- 点击"立即充值"

4. **模拟支付**
- 复制收款地址
- 使用测试钱包转账
- 等待区块确认

5. **验证结果**
- 检查订单状态变为"已支付"
- 验证余额是否到账
- 查看充值记录

### 生产环境部署

1. **更新环境变量**
```env
BEPUSDT_URL=https://your-bepusdt-domain.com
BEPUSDT_API_KEY=your-real-api-key
BEPUSDT_MERCHANT_ID=your-merchant-id
BEPUSDT_SECRET_KEY=your-secret-key
BEPUSDT_TEST_MODE=false
FRONTEND_URL=https://your-domain.com
```

2. **配置Nginx反向代理**
```nginx
location /api/recharge/webhook {
    proxy_pass http://localhost:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

3. **配置SSL证书**
```bash
certbot --nginx -d your-domain.com
```

4. **重启服务**
```bash
pm2 restart server
```

---

## 🔍 监控和日志

### 日志记录

**订单创建日志：**
```
📝 创建充值订单: { userId, type, amount, currency }
🔑 订单ID: ORDER1729328400123
🚀 调用BEpusdt API: { url, params }
✅ BEpusdt订单创建成功
```

**支付成功日志：**
```
📨 收到Webhook通知: { order_id, status, tx_hash }
✅ 订单 ORDER1729328400123 处理成功
✅ 用户 username 充值 1000 积分成功
💰 推荐佣金: 50元
```

### 错误处理

**常见错误：**

1. **无法连接到BEpusdt服务**
```
❌ 无法连接到支付服务，请检查BEpusdt服务是否正常运行
```
解决：检查BEPUSDT_URL配置和网络连接

2. **API密钥无效**
```
❌ 认证失败：Invalid API key
```
解决：检查BEPUSDT_API_KEY配置

3. **Webhook签名验证失败**
```
❌ Webhook签名验证失败
```
解决：检查BEPUSDT_SECRET_KEY配置

---

## 📈 性能优化

### 1. 缓存汇率

```javascript
// 使用Redis缓存汇率，5分钟更新一次
const cachedRates = await redis.get('exchange_rates');
if (!cachedRates) {
  const rates = await bepusdtService.getExchangeRates();
  await redis.setex('exchange_rates', 300, JSON.stringify(rates));
}
```

### 2. 异步处理Webhook

```javascript
// 使用消息队列处理webhook
router.post('/webhook', async (req, res) => {
  // 立即返回200，避免超时
  res.status(200).send('OK');
  
  // 异步处理订单
  await queue.add('process-payment', req.body);
});
```

### 3. 批量查询订单

```javascript
// 批量查询多个订单状态
const orderIds = ['ORDER1', 'ORDER2', 'ORDER3'];
const results = await Promise.all(
  orderIds.map(id => bepusdtService.queryOrder(id))
);
```

---

## 🛡️ 安全建议

### 1. API安全

- ✅ 使用HTTPS协议
- ✅ 验证所有请求签名
- ✅ 设置请求频率限制
- ✅ 记录所有API调用日志
- ✅ 定期更新API密钥

### 2. 数据安全

- ✅ 加密敏感数据
- ✅ 定期备份数据库
- ✅ 设置数据访问权限
- ✅ 监控异常交易
- ✅ 实施数据脱敏

### 3. 业务安全

- ✅ 设置单笔充值上限
- ✅ 设置每日充值上限
- ✅ 实施风控规则
- ✅ 人工审核大额订单
- ✅ 建立黑名单机制

---

## 📞 技术支持

### 相关文档

- BEpusdt项目：https://github.com/v03413/BEpusdt
- TRC20文档：https://developers.tron.network/
- TRON浏览器：https://tronscan.org/

### 常见问题

**Q: 如何测试webhook？**
A: 使用ngrok或类似工具将本地服务暴露到公网，然后配置webhook URL。

**Q: 支付后多久到账？**
A: TRC20网络确认时间约1-3分钟，系统检测到账后立即充值。

**Q: 如何处理订单过期？**
A: 订单过期后自动关闭，用户需要重新创建订单。

---

## ✅ 部署检查清单

部署前请确认以下项目：

- [ ] 配置正确的BEpusdt URL
- [ ] 配置正确的API密钥
- [ ] 配置正确的商户ID
- [ ] 配置正确的密钥
- [ ] 关闭测试模式（TEST_MODE=false）
- [ ] 配置正确的前端URL
- [ ] 配置webhook URL
- [ ] 测试订单创建
- [ ] 测试支付流程
- [ ] 测试webhook通知
- [ ] 验证余额到账
- [ ] 验证佣金结算
- [ ] 检查日志记录
- [ ] 配置监控告警
- [ ] 准备应急预案

---

## 🎉 总结

真实支付系统已配置完成！现在您可以：

✅ 接受真实的USDT/TRX充值
✅ 自动检测支付状态
✅ 自动充值用户余额
✅ 自动结算推荐佣金
✅ 查看完整的充值记录

祝您使用愉快！💰
