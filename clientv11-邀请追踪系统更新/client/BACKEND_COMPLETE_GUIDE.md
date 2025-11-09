# 后端服务器完整指南

## ✅ 已完成的工作

### 1. 项目结构

```
server/
├── config/
│   └── database.js              # 数据库配置（双数据库）
├── models/
│   ├── User.js                  # 用户模型
│   ├── RechargeOrder.js         # 充值订单模型
│   └── BalanceLog.js            # 余额日志模型
├── services/
│   ├── bepusdtService.js        # BEpusdt API服务
│   └── rechargeService.js       # 充值业务逻辑
├── routes/
│   └── recharge.js              # 充值API路由
├── index.js                     # 主服务器文件
├── package.json                 # 依赖配置
├── .env                         # 环境变量（已配置）
├── .env.example                 # 环境变量示例
├── .gitignore                   # Git忽略文件
├── README.md                    # 详细文档
├── start.sh                     # Linux/Mac启动脚本
└── start.bat                    # Windows启动脚本
```

### 2. 已配置的数据库

**用户数据库：**
```
mongodb://chroot:Ubuntu123!@172.16.254.15:27017/userdata?authSource=admin
```

**查询数据库：**
```
mongodb://daroot:Ubuntu123!@172.16.254.77:27017/database?authSource=admin
```

### 3. 已配置的BEpusdt

```
服务地址: https://pay.vpno.eu.org
商户ID: 1000
API密钥: 123234
```

### 4. 核心功能

- ✅ 双数据库连接（用户数据库 + 查询数据库）
- ✅ 用户管理（余额、积分、VIP）
- ✅ 充值订单管理
- ✅ BEpusdt支付集成
- ✅ Webhook处理
- ✅ 余额变动日志
- ✅ VIP时间管理
- ✅ 充值记录查询

---

## 🚀 快速启动（3步）

### 步骤1：安装依赖

```bash
cd server
npm install
```

### 步骤2：启动服务器

**Windows:**
```bash
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**或直接使用npm:**
```bash
npm start
```

### 步骤3：验证服务器

访问：http://localhost:3001/health

应该看到：
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

---

## 📡 API端点

### 1. 创建充值订单

```bash
POST /api/recharge/create

{
  "userId": "用户ID",
  "type": "points",      # 或 "vip"
  "amount": 100,
  "currency": "USDT",
  "points": 1000,        # 积分充值时必填
  "vipDays": 30,         # VIP充值时必填
  "vipPackageName": "月度VIP"  # VIP充值时必填
}
```

### 2. 查询订单状态

```bash
GET /api/recharge/query/:orderId
```

### 3. 获取充值记录

```bash
GET /api/recharge/history/:userId?page=1&limit=10
```

### 4. Webhook通知

```bash
POST /api/recharge/webhook
```

---

## 🔄 完整充值流程

### 积分充值

1. **前端** → 用户选择积分套餐（如1000积分/¥100）
2. **前端** → 调用 `POST /api/recharge/create`
   ```json
   {
     "userId": "67890",
     "type": "points",
     "amount": 100,
     "currency": "USDT",
     "points": 1000
   }
   ```
3. **后端** → 调用BEpusdt创建订单
4. **后端** → 保存订单到数据库
5. **后端** → 返回支付地址
   ```json
   {
     "success": true,
     "order": {
       "orderId": "ORDER1729328400123",
       "paymentAddress": "TXxx1234567890...",
       "actualAmount": 13.89,
       "currency": "USDT"
     }
   }
   ```
6. **前端** → 显示支付地址和二维码
7. **用户** → 使用钱包转账
8. **BEpusdt** → 检测到支付，发送Webhook
9. **后端** → 接收Webhook，验证签名
10. **后端** → 更新订单状态为 `paid`
11. **后端** → 增加用户积分 `user.points += 1000`
12. **后端** → 记录余额变动日志
13. **前端** → 轮询订单状态，显示支付成功

### VIP充值

1. **前端** → 用户选择VIP套餐（如月度VIP/30天/¥30）
2. **前端** → 调用 `POST /api/recharge/create`
   ```json
   {
     "userId": "67890",
     "type": "vip",
     "amount": 30,
     "currency": "USDT",
     "vipDays": 30,
     "vipPackageName": "月度VIP"
   }
   ```
3. **后端** → 创建订单并返回支付地址
4. **用户** → 完成支付
5. **后端** → 接收Webhook
6. **后端** → 延长VIP时间 `user.extendVip(30)`
7. **后端** → 设置 `user.isVip = true`
8. **后端** → 记录余额变动日志
9. **前端** → 显示VIP开通成功

---

## 🗄️ 数据库集合

### users（用户表）

```javascript
{
  _id: ObjectId,
  username: "user123",
  email: "user@example.com",
  password: "hashed_password",
  balance: 0,
  points: 1000,
  vipExpireAt: "2024-11-19T10:30:00.000Z",
  isVip: true,
  role: "user",
  referralCode: "ABC123",
  totalRecharged: 100,
  totalConsumed: 0,
  createdAt: "2024-10-19T10:30:00.000Z"
}
```

### rechargeorders（充值订单表）

```javascript
{
  _id: ObjectId,
  userId: ObjectId("..."),
  orderId: "ORDER1729328400123",
  type: "points",
  amount: 100,
  actualAmount: 13.89,
  currency: "USDT",
  paymentAddress: "TXxx1234567890...",
  status: "paid",
  txHash: "0xabcdef...",
  points: 1000,
  vipDays: 0,
  expireAt: "2024-10-19T10:45:00.000Z",
  paidAt: "2024-10-19T10:35:00.000Z",
  createdAt: "2024-10-19T10:30:00.000Z"
}
```

### balancelogs（余额日志表）

```javascript
{
  _id: ObjectId,
  userId: ObjectId("..."),
  type: "recharge",
  amount: 1000,
  balanceBefore: 0,
  balanceAfter: 0,
  orderId: "ORDER1729328400123",
  description: "充值1000积分",
  createdAt: "2024-10-19T10:35:00.000Z"
}
```

---

## 🔗 前端集成

### 1. 更新前端API调用

修改 `src/pages/Dashboard/Recharge.tsx`:

```typescript
// 创建订单
const response = await fetch('/api/recharge/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: currentUser.id,  // 从登录状态获取
    type: 'points',
    amount: amountNum,
    currency: currency,
    points: selectedPackage.points
  })
});

// 查询订单
const response = await fetch(`/api/recharge/query/${orderId}`);
```

### 2. 配置Vite代理

在 `vite.config.ts` 中添加：

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

## 🧪 测试

### 测试1：健康检查

```bash
curl http://localhost:3001/health
```

### 测试2：创建积分充值订单

```bash
curl -X POST http://localhost:3001/api/recharge/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "测试用户ID",
    "type": "points",
    "amount": 100,
    "currency": "USDT",
    "points": 1000
  }'
```

### 测试3：创建VIP充值订单

```bash
curl -X POST http://localhost:3001/api/recharge/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "测试用户ID",
    "type": "vip",
    "amount": 30,
    "currency": "USDT",
    "vipDays": 30,
    "vipPackageName": "月度VIP"
  }'
```

---

## 📊 监控日志

服务器会输出详细日志：

```
✅ 用户数据库连接成功
✅ 查询数据库连接成功

📝 创建订单请求: { userId: '...', type: 'points', ... }
✅ 订单创建成功: { orderId: 'ORDER...', ... }

📨 收到Webhook通知: { order_id: 'ORDER...', status: 'paid', ... }
✅ 订单 ORDER1729328400123 处理成功
✅ 用户 user123 充值 1000 积分成功
```

---

## 🔐 安全建议

### 生产环境配置

1. **修改密钥**
   ```env
   JWT_SECRET=生成一个强随机密钥
   BEPUSDT_SECRET_KEY=从BEpusdt后台获取
   ```

2. **使用HTTPS**
   - 配置SSL证书
   - 强制HTTPS访问

3. **添加身份验证**
   - JWT token验证
   - API密钥验证

4. **添加请求限流**
   ```javascript
   const rateLimit = require('express-rate-limit');
   app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
   ```

---

## 🐛 故障排除

### 问题1：数据库连接失败

```
❌ 用户数据库连接失败: MongoNetworkError
```

**解决方案：**
1. 检查数据库地址和端口
2. 检查用户名密码
3. 检查网络连接
4. 检查防火墙设置

### 问题2：BEpusdt API调用失败

```
❌ 创建订单失败: Request failed with status code 401
```

**解决方案：**
1. 检查API密钥是否正确
2. 检查商户ID是否正确
3. 检查BEpusdt服务是否正常

### 问题3：Webhook未收到

**解决方案：**
1. 确保服务器可从外网访问
2. 在BEpusdt后台配置正确的Webhook URL
3. 检查防火墙是否开放端口

---

## 📞 下一步

1. ✅ 启动后端服务器
2. ✅ 测试API端点
3. 📝 更新前端API调用
4. 📝 配置Vite代理
5. 📝 测试完整充值流程
6. 📝 部署到生产环境

---

需要帮助？查看：
- `server/README.md` - 详细文档
- 服务器日志 - 实时错误信息
- BEpusdt后台 - 订单和Webhook日志

---

更新时间：2024-10-19
版本：v1.0.0
状态：✅ 完成
