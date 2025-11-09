# 支付系统完整文档

## 系统概述

本系统集成了BEpusdt支付网关，支持USDT(TRC20)和TRX加密货币支付。采用Webhook回调机制实现实时支付通知。

## 核心特性

✅ **支持币种**
- USDT (TRC20)
- TRX (TRON)

✅ **支付类型**
- 积分充值
- VIP会员购买

✅ **安全机制**
- MD5签名验证
- Webhook回调验证
- 订单防重复处理
- 自动过期清理

✅ **佣金系统**
- 推荐人佣金自动计算
- 多级佣金分配
- 佣金提现功能

## 系统架构

```
用户 → 前端 → 后端API → BEpusdt → 区块链
                ↑                    ↓
                └──── Webhook ←──────┘
```

### 工作流程

1. **创建订单**
   - 用户选择充值金额/VIP套餐
   - 后端调用BEpusdt创建订单
   - BEpusdt返回收款地址
   - 前端显示收款地址和二维码

2. **用户支付**
   - 用户使用钱包扫码或复制地址
   - 向收款地址转账

3. **区块链确认**
   - BEpusdt监控区块链
   - 检测到转账后等待确认

4. **Webhook通知**
   - 支付确认后，BEpusdt调用Webhook
   - 后端验证签名
   - 更新订单状态
   - 给用户加积分/VIP
   - 计算推荐人佣金

5. **前端更新**
   - 前端轮询查询订单状态
   - 显示充值成功

## 技术实现

### 1. 数据模型

#### RechargeOrder（充值订单）

```javascript
{
  userId: ObjectId,           // 用户ID
  orderId: String,            // 订单号（唯一）
  type: String,               // 类型：points/vip
  amount: Number,             // 支付金额（CNY）
  actualAmount: Number,       // 实际支付金额（加密货币）
  currency: String,           // 币种：USDT/TRX
  paymentAddress: String,     // 收款地址
  status: String,             // 状态：pending/paid/expired/failed
  points: Number,             // 积分数量（type=points时）
  vipDays: Number,            // VIP天数（type=vip时）
  vipPackageName: String,     // VIP套餐名称
  txHash: String,             // 交易哈希
  blockNumber: Number,        // 区块号
  paidAt: Date,               // 支付时间
  expireAt: Date,             // 过期时间
  createdAt: Date             // 创建时间
}
```

### 2. API接口

#### 创建充值订单

```http
POST /api/recharge/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "points",      // 或 "vip"
  "amount": 100,         // CNY金额
  "currency": "USDT",    // 或 "TRX"
  "points": 1000,        // type=points时必填
  "vipDays": 30,         // type=vip时必填
  "vipPackageName": "月度会员"  // type=vip时必填
}
```

响应：
```json
{
  "success": true,
  "order": {
    "orderId": "ORDER1761006775605418",
    "amount": 100,
    "actualAmount": 10.5,
    "currency": "USDT",
    "paymentAddress": "TXxx...xxx",
    "expireAt": "2025-01-21T01:00:00.000Z",
    "status": "pending"
  }
}
```

#### 查询订单状态

```http
GET /api/recharge/query/:orderId
```

响应：
```json
{
  "success": true,
  "order": {
    "orderId": "ORDER1761006775605418",
    "status": "paid",
    "amount": 100,
    "actualAmount": 10.5,
    "currency": "USDT",
    "paymentAddress": "TXxx...xxx",
    "txHash": "0x...",
    "paidAt": "2025-01-21T00:34:24.000Z"
  },
  "message": "订单状态将通过支付回调自动更新"
}
```

#### 获取充值记录

```http
GET /api/recharge/history?page=1&limit=10
Authorization: Bearer <token>
```

响应：
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

#### Webhook回调（BEpusdt调用）

```http
POST /api/recharge/webhook
Content-Type: application/json

{
  "order_id": "ORDER1761006775605418",
  "status": 2,
  "tx_hash": "0x...",
  "block_number": 12345,
  "signature": "..."
}
```

### 3. 签名算法

#### 生成签名

```javascript
// 1. 过滤空值参数
const params = {
  order_id: "ORDER123",
  amount: "10",
  currency: "USDT"
};

// 2. 按key排序
const sortedParams = Object.entries(params)
  .filter(([_, v]) => v !== undefined && v !== null && v !== '')
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([k, v]) => `${k}=${v}`)
  .join('&');
// 结果: "amount=10&currency=USDT&order_id=ORDER123"

// 3. 拼接密钥
const stringToSign = sortedParams + SECRET_KEY;

// 4. MD5加密并转小写
const signature = crypto.createHash('md5')
  .update(stringToSign)
  .digest('hex')
  .toLowerCase();
```

#### 验证签名

```javascript
// Webhook数据
const webhookData = {
  order_id: "ORDER123",
  status: 2,
  signature: "abc123..."
};

// 移除signature字段
const params = { ...webhookData };
delete params.signature;

// 生成期望的签名
const expectedSign = generateSignature(params);

// 对比
if (webhookData.signature === expectedSign) {
  // 签名验证通过
}
```

### 4. 核心服务

#### BEpusdtService

```javascript
class BEpusdtService {
  // 创建订单
  async createOrder(params) {
    // 构建请求数据
    // 生成签名
    // 调用BEpusdt API
    // 返回收款地址
  }
  
  // 查询订单（BEpusdt不支持，返回null）
  async queryOrder(orderId) {
    return null;
  }
  
  // 验证Webhook签名
  verifyWebhookSignature(data) {
    // 移除signature
    // 生成期望签名
    // 对比验证
  }
}
```

#### RechargeService

```javascript
class RechargeService {
  // 创建充值订单
  async createRechargeOrder(userId, orderData) {
    // 生成订单号
    // 调用BEpusdt创建订单
    // 保存到数据库
  }
  
  // 查询订单状态
  async queryOrderStatus(orderId) {
    // 从数据库查询
    // 返回订单状态
  }
  
  // 处理支付成功
  async processPayment(order, paymentData) {
    // 更新订单状态
    // 给用户加积分/VIP
    // 计算推荐人佣金
  }
  
  // 处理积分充值
  async processPointsRecharge(user, order) {
    // 增加积分
    // 记录日志
    // 计算佣金
  }
  
  // 处理VIP充值
  async processVipRecharge(user, order) {
    // 延长VIP时间
    // 记录日志
    // 计算佣金
  }
}
```

#### CommissionService

```javascript
class CommissionService {
  // 计算佣金
  async calculateCommission(user, order, type) {
    // 查找推荐人
    // 计算佣金金额
    // 给推荐人加佣金
    // 记录佣金日志
  }
}
```

## 配置说明

### 环境变量

```env
# BEpusdt配置
BEPUSDT_URL=https://pay.vpno.eu.org
BEPUSDT_API_KEY=your_api_key
BEPUSDT_MERCHANT_ID=1000
BEPUSDT_SECRET_KEY=your_secret_key
BEPUSDT_TEST_MODE=false

# 后端地址（Webhook URL）
BACKEND_URL=http://dc.obash.cc:3001

# 前端地址
FRONTEND_URL=http://localhost:5173
```

### BEpusdt管理后台配置

1. 登录BEpusdt管理后台
2. 配置商户信息
3. 设置Webhook URL：`http://dc.obash.cc:3001/api/recharge/webhook`
4. 配置密钥（SECRET_KEY）
5. 启用支持的币种（USDT、TRX）

## 前端集成

### 1. 创建订单

```typescript
const createOrder = async (orderData) => {
  const response = await api.post('/api/recharge/create', orderData);
  return response.data;
};
```

### 2. 显示支付信息

```tsx
<div className="payment-info">
  <QRCode value={order.paymentAddress} />
  <p>收款地址: {order.paymentAddress}</p>
  <p>支付金额: {order.actualAmount} {order.currency}</p>
  <p>过期时间: {formatTime(order.expireAt)}</p>
</div>
```

### 3. 轮询查询状态

```typescript
const pollOrderStatus = (orderId: string) => {
  const interval = setInterval(async () => {
    const result = await api.get(`/api/recharge/query/${orderId}`);
    
    if (result.order.status === 'paid') {
      clearInterval(interval);
      message.success('充值成功！');
      // 刷新余额
      fetchUserBalance();
    }
  }, 3000); // 每3秒查询一次
  
  // 30分钟后停止轮询
  setTimeout(() => clearInterval(interval), 1800000);
};
```

## 安全措施

### 1. 签名验证

所有Webhook请求必须验证签名：

```javascript
const isValid = bepusdtService.verifyWebhookSignature(webhookData);
if (!isValid) {
  return res.status(400).send('fail');
}
```

### 2. 防重复处理

```javascript
if (order.status === 'paid') {
  console.log('订单已处理');
  return res.status(200).send('ok');
}
```

### 3. 订单过期清理

```javascript
// 每小时清理过期订单
setInterval(async () => {
  await RechargeOrder.updateMany(
    {
      status: 'pending',
      expireAt: { $lt: new Date() }
    },
    { status: 'expired' }
  );
}, 3600000);
```

### 4. 日志记录

```javascript
console.log('📨 收到Webhook通知:', webhookData);
console.log('✅ 订单已支付:', orderId);
console.log('🎉 订单处理完成:', orderId);
```

## 测试指南

### 1. 本地测试

```bash
# 启动服务器
cd server
npm start

# 模拟支付回调
node scripts/simulatePayment.js ORDER123456
```

### 2. 生产测试

1. 创建小额测试订单（最小金额）
2. 使用测试钱包支付
3. 查看服务器日志确认Webhook
4. 验证积分/VIP是否到账
5. 检查佣金是否正确计算

### 3. 压力测试

```bash
# 并发创建订单
for i in {1..100}; do
  curl -X POST http://localhost:3001/api/recharge/create \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"type":"points","amount":10,"currency":"USDT","points":100}' &
done
```

## 监控和维护

### 1. 日志监控

```bash
# 实时查看日志
cd server
npm start

# 过滤Webhook日志
npm start | grep "Webhook"
```

### 2. 数据库监控

```javascript
// 查询待处理订单
db.rechargeorders.find({ status: 'pending' }).count()

// 查询今日订单
db.rechargeorders.find({
  createdAt: {
    $gte: new Date(new Date().setHours(0,0,0,0))
  }
}).count()

// 查询支付成功率
const total = db.rechargeorders.count()
const paid = db.rechargeorders.find({ status: 'paid' }).count()
const rate = (paid / total * 100).toFixed(2) + '%'
```

### 3. 异常处理

#### Webhook失败重试

BEpusdt会自动重试失败的Webhook：
- 首次失败：立即重试
- 第二次失败：5分钟后重试
- 第三次失败：15分钟后重试
- 最多重试3次

#### 手动处理订单

```bash
# 手动更新订单状态
node server/scripts/manualUpdateOrder.js ORDER123 paid TX_HASH
```

## 常见问题

### Q: Webhook没有收到通知？

A: 检查：
1. BACKEND_URL配置是否正确
2. 端口映射是否配置
3. 防火墙是否允许
4. BEpusdt管理后台Webhook URL是否正确
5. 查看BEpusdt日志确认是否发送

### Q: 签名验证失败？

A: 检查：
1. SECRET_KEY是否正确
2. 参数是否完整
3. 签名算法是否正确
4. 字符编码是否一致

### Q: 订单一直pending？

A: 可能原因：
1. 用户还没有支付
2. 支付金额不正确
3. Webhook没有收到
4. 区块链确认延迟

### Q: 如何退款？

A: 加密货币支付无法自动退款，需要：
1. 联系用户获取退款地址
2. 手动转账退款
3. 更新订单状态为refunded

## 性能优化

### 1. 数据库索引

```javascript
// 订单号索引
RechargeOrder.index({ orderId: 1 }, { unique: true });

// 用户ID索引
RechargeOrder.index({ userId: 1 });

// 状态和过期时间复合索引
RechargeOrder.index({ status: 1, expireAt: 1 });
```

### 2. 缓存策略

```javascript
// 缓存汇率信息
const rateCache = new Map();
const CACHE_TTL = 300000; // 5分钟

async function getExchangeRate(currency) {
  const cached = rateCache.get(currency);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.rate;
  }
  
  const rate = await fetchRateFromAPI(currency);
  rateCache.set(currency, { rate, time: Date.now() });
  return rate;
}
```

### 3. 异步处理

```javascript
// 异步处理佣金计算
async processPayment(order, paymentData) {
  // 更新订单状态
  await this.updateOrderStatus(order, paymentData);
  
  // 异步计算佣金（不阻塞主流程）
  setImmediate(async () => {
    try {
      await commissionService.calculateCommission(user, order);
    } catch (error) {
      console.error('佣金计算失败:', error);
    }
  });
}
```

## 相关文件

### 核心代码
- `server/services/bepusdtService.js` - BEpusdt服务
- `server/services/rechargeService.js` - 充值服务
- `server/services/commissionService.js` - 佣金服务
- `server/routes/recharge.js` - 充值路由
- `server/models/RechargeOrder.js` - 订单模型

### 工具脚本
- `server/scripts/simulatePayment.js` - 模拟支付
- `server/scripts/manualUpdateOrder.js` - 手动更新订单
- `server/scripts/testBepusdtSignature.js` - 测试签名
- `server/scripts/showLocalIP.js` - 显示本机IP

### 文档
- `PAYMENT_SYSTEM_DOCUMENTATION.md` - 本文档
- `BEPUSDT_WEBHOOK_GUIDE.md` - Webhook详细指南
- `PORT_MAPPING_GUIDE.md` - 端口映射指南
- `NETWORK_ACCESS_GUIDE.md` - 网络访问指南

## 更新日志

### v1.0.0 (2025-01-21)
- ✅ 集成BEpusdt支付网关
- ✅ 支持USDT和TRX支付
- ✅ 实现Webhook回调机制
- ✅ 添加签名验证
- ✅ 集成佣金系统
- ✅ 添加订单过期清理
- ✅ 完善错误处理和日志

## 技术支持

如有问题，请查看：
1. 服务器日志
2. BEpusdt管理后台日志
3. 本文档常见问题部分
4. 相关文档和代码注释
