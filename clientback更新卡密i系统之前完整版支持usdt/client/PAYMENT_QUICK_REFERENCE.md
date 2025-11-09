# 支付系统快速参考

## 快速开始

### 1. 配置环境变量

```env
BEPUSDT_URL=https://pay.vpno.eu.org
BEPUSDT_MERCHANT_ID=1000
BEPUSDT_SECRET_KEY=your_secret_key
BACKEND_URL=http://dc.obash.cc:3001
```

### 2. 启动服务器

```bash
cd server
npm start
```

### 3. 测试支付

```bash
# 模拟支付回调
node scripts/simulatePayment.js ORDER123456
```

## API快速参考

### 创建订单

```bash
curl -X POST http://localhost:3001/api/recharge/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "points",
    "amount": 100,
    "currency": "USDT",
    "points": 1000
  }'
```

### 查询订单

```bash
curl http://localhost:3001/api/recharge/query/ORDER123456
```

### 获取充值记录

```bash
curl http://localhost:3001/api/recharge/history?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Webhook数据格式

```json
{
  "order_id": "ORDER123456",
  "status": 2,
  "tx_hash": "0x...",
  "block_number": 12345,
  "signature": "..."
}
```

## 订单状态

- `pending` - 待支付
- `paid` - 已支付
- `expired` - 已过期
- `failed` - 失败

## 支付类型

- `points` - 积分充值
- `vip` - VIP会员

## 支持币种

- `USDT` - USDT (TRC20)
- `TRX` - TRON

## 常用命令

```bash
# 查看本机IP
node server/scripts/showLocalIP.js

# 模拟支付
node server/scripts/simulatePayment.js ORDER123

# 手动更新订单
node server/scripts/manualUpdateOrder.js ORDER123 paid TX_HASH

# 测试签名
node server/scripts/testBepusdtSignature.js
```

## 重要URL

- **Webhook**: `http://dc.obash.cc:3001/api/recharge/webhook`
- **健康检查**: `http://dc.obash.cc:3001/health`
- **BEpusdt**: `https://pay.vpno.eu.org`

## 故障排查

### Webhook未收到

```bash
# 1. 检查服务器是否运行
curl http://dc.obash.cc:3001/health

# 2. 检查端口映射
# 路由器管理界面 -> 端口转发 -> 3001

# 3. 检查防火墙
netsh advfirewall firewall show rule name="Backend API"
```

### 签名验证失败

```bash
# 测试签名算法
node server/scripts/testBepusdtSignature.js
```

### 订单一直pending

```bash
# 查看服务器日志
cd server
npm start

# 查看BEpusdt管理后台日志
```

## 监控命令

```bash
# 查询待处理订单数量
mongo userdata --eval "db.rechargeorders.find({status:'pending'}).count()"

# 查询今日订单
mongo userdata --eval "db.rechargeorders.find({createdAt:{\$gte:new Date(new Date().setHours(0,0,0,0))}}).count()"

# 查询支付成功率
mongo userdata --eval "
  var total = db.rechargeorders.count();
  var paid = db.rechargeorders.find({status:'paid'}).count();
  print('成功率: ' + (paid/total*100).toFixed(2) + '%');
"
```

## 文档链接

- [完整文档](./PAYMENT_SYSTEM_DOCUMENTATION.md)
- [Webhook指南](./BEPUSDT_WEBHOOK_GUIDE.md)
- [端口映射指南](./PORT_MAPPING_GUIDE.md)
- [网络访问指南](./NETWORK_ACCESS_GUIDE.md)
