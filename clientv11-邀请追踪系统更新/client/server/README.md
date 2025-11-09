# 知识库系统后端服务器

## 🚀 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env` 并填写配置：

```bash
cp .env.example .env
```

已配置的数据库：
- 用户数据库: `mongodb://chroot:Ubuntu123!@172.16.254.15:27017/userdata?authSource=admin`
- 查询数据库: `mongodb://daroot:Ubuntu123!@172.16.254.77:27017/database?authSource=admin`

已配置的BEpusdt：
- 服务地址: `https://pay.vpno.eu.org`
- 商户ID: `1000`
- API密钥: `123234`

### 3. 启动服务器

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

---

## 📁 项目结构

```
server/
├── config/
│   └── database.js          # 数据库配置
├── models/
│   ├── User.js              # 用户模型
│   ├── RechargeOrder.js     # 充值订单模型
│   └── BalanceLog.js        # 余额变动日志模型
├── services/
│   ├── bepusdtService.js    # BEpusdt服务
│   └── rechargeService.js   # 充值服务
├── routes/
│   └── recharge.js          # 充值路由
├── index.js                 # 主服务器文件
├── package.json             # 依赖配置
├── .env                     # 环境变量（已配置）
└── README.md                # 本文件
```

---

## 📡 API端点

### 1. 健康检查

```
GET /health
```

**响应：**
```json
{
  "status": "ok",
  "timestamp": "2024-10-19T10:30:00.000Z",
  "env": "development",
  "bepusdt": {
    "url": "https://pay.vpno.eu.org",
    "merchantId": "1000"
  }
}
```

### 2. 创建充值订单

```
POST /api/recharge/create
Content-Type: application/json

{
  "userId": "用户ID",
  "type": "points",  // 或 "vip"
  "amount": 100,
  "currency": "USDT",
  "points": 1000,    // 积分充值时必填
  "vipDays": 30,     // VIP充值时必填
  "vipPackageName": "月度VIP"  // VIP充值时必填
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
    "paymentAddress": "TXxx1234567890...",
    "expireAt": "2024-10-19T10:45:00.000Z",
    "status": "pending"
  }
}
```

### 3. 查询订单状态

```
GET /api/recharge/query/:orderId
```

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
    "txHash": "0xabcdef...",
    "paidAt": "2024-10-19T10:35:00.000Z"
  }
}
```

### 4. 获取充值记录

```
GET /api/recharge/history/:userId?page=1&limit=10
```

**响应：**
```json
{
  "success": true,
  "orders": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### 5. Webhook通知

```
POST /api/recharge/webhook
Content-Type: application/json

{
  "order_id": "ORDER1729328400123",
  "amount": 100,
  "actual_amount": 13.89,
  "currency": "USDT",
  "status": "paid",
  "tx_hash": "0xabcdef...",
  "sign": "md5_signature"
}
```

---

## 🗄️ 数据模型

### User（用户）

```javascript
{
  username: String,
  email: String,
  password: String,
  balance: Number,
  points: Number,
  vipExpireAt: Date,
  isVip: Boolean,
  role: String,
  referralCode: String,
  referredBy: ObjectId,
  totalRecharged: Number,
  totalConsumed: Number
}
```

### RechargeOrder（充值订单）

```javascript
{
  userId: ObjectId,
  orderId: String,
  type: String,  // 'points' | 'vip'
  amount: Number,
  actualAmount: Number,
  currency: String,
  paymentAddress: String,
  status: String,  // 'pending' | 'paid' | 'expired' | 'failed'
  txHash: String,
  blockNumber: Number,
  points: Number,
  vipDays: Number,
  vipPackageName: String,
  expireAt: Date,
  paidAt: Date
}
```

### BalanceLog（余额日志）

```javascript
{
  userId: ObjectId,
  type: String,  // 'recharge' | 'consume' | 'refund' | 'commission' | 'vip'
  amount: Number,
  balanceBefore: Number,
  balanceAfter: Number,
  orderId: String,
  description: String
}
```

---

## 🔄 充值流程

### 积分充值流程

1. 用户选择积分套餐
2. 前端调用 `POST /api/recharge/create`
3. 后端创建BEpusdt订单
4. 后端保存订单到数据库
5. 返回支付地址给前端
6. 用户完成支付
7. BEpusdt发送Webhook通知
8. 后端验证签名
9. 后端更新订单状态
10. 后端增加用户积分
11. 记录余额变动日志

### VIP充值流程

1. 用户选择VIP套餐
2. 前端调用 `POST /api/recharge/create`
3. 后端创建BEpusdt订单
4. 后端保存订单到数据库
5. 返回支付地址给前端
6. 用户完成支付
7. BEpusdt发送Webhook通知
8. 后端验证签名
9. 后端更新订单状态
10. 后端延长用户VIP时间
11. 记录余额变动日志

---

## 🧪 测试

### 测试健康检查

```bash
curl http://localhost:3001/health
```

### 测试创建订单

```bash
curl -X POST http://localhost:3001/api/recharge/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "用户ID",
    "type": "points",
    "amount": 100,
    "currency": "USDT",
    "points": 1000
  }'
```

---

## 🔐 安全建议

1. **生产环境配置**
   - 修改 `JWT_SECRET`
   - 修改 `BEPUSDT_SECRET_KEY`
   - 使用HTTPS
   - 启用防火墙

2. **数据库安全**
   - 使用强密码
   - 限制IP访问
   - 定期备份

3. **API安全**
   - 添加身份验证
   - 添加请求限流
   - 验证输入数据

---

## 📊 监控

建议监控以下指标：
- 订单创建成功率
- 订单支付成功率
- 平均支付时间
- Webhook处理成功率
- 数据库连接状态

---

## 🐛 故障排除

### 数据库连接失败

检查：
1. 数据库地址是否正确
2. 用户名密码是否正确
3. 网络是否可达
4. 防火墙是否开放

### BEpusdt API调用失败

检查：
1. API地址是否正确
2. API密钥是否正确
3. 商户ID是否正确
4. 网络是否可达

### Webhook未收到通知

检查：
1. Webhook URL是否配置正确
2. 服务器是否可从外网访问
3. 防火墙是否开放端口

---

## 📞 需要帮助？

如有问题，请检查：
1. 服务器日志
2. 数据库日志
3. BEpusdt后台日志

---

更新时间：2024-10-19
版本：v1.0.0
