# BEpusdt订单查询问题解决方案

## 问题分析

通过测试BEpusdt的所有可能API路径，发现：
- `/api/v1/order/query` - 404
- `/api/order/query` - 404
- `/query` - 404
- 所有其他查询路径都返回404

**结论：BEpusdt不提供主动查询订单的API接口！**

## 解决方案

BEpusdt采用**Webhook回调机制**，而不是主动查询：

### 工作流程

```
1. 创建订单
   ↓
2. BEpusdt返回收款地址
   ↓
3. 用户转账到收款地址
   ↓
4. BEpusdt监控区块链
   ↓
5. 发现转账后，BEpusdt主动调用你的Webhook
   ↓
6. 你的服务器收到通知，更新订单状态
   ↓
7. 前端轮询查询数据库中的订单状态
```

### 代码修改

#### 1. bepusdtService.js

```javascript
async queryOrder(orderId) {
  console.log('⚠️  BEpusdt不提供主动查询API');
  console.log('💡 建议：依赖Webhook回调来更新订单状态');
  return null;  // 返回null表示不支持查询
}
```

#### 2. rechargeService.js

```javascript
async queryOrderStatus(orderId) {
  // 从数据库查询订单
  const order = await RechargeOrder.findOne({ orderId });
  
  // 直接返回数据库中的状态
  // 状态由Webhook回调自动更新
  return {
    success: true,
    order: {
      orderId: order.orderId,
      status: order.status,  // pending 或 paid
      amount: order.amount,
      paymentAddress: order.paymentAddress
    },
    message: '订单状态将通过支付回调自动更新'
  };
}
```

#### 3. Webhook处理

```javascript
router.post('/webhook', async (req, res) => {
  const webhookData = req.body;
  
  // 1. 验证签名
  const isValid = bepusdtService.verifyWebhookSignature(webhookData);
  if (!isValid) {
    return res.status(400).send('fail');
  }
  
  // 2. 检查支付状态
  if (webhookData.status === 2) {
    // 3. 更新订单状态
    const order = await RechargeOrder.findOne({ orderId: webhookData.order_id });
    await rechargeService.processPayment(order, {
      status: 'paid',
      tx_hash: webhookData.tx_hash,
      block_number: webhookData.block_number
    });
  }
  
  res.status(200).send('ok');
});
```

## 前端轮询

前端需要定时查询订单状态：

```javascript
// 创建订单后开始轮询
const pollOrderStatus = async (orderId) => {
  const interval = setInterval(async () => {
    const result = await api.get(`/api/recharge/query/${orderId}`);
    
    if (result.order.status === 'paid') {
      clearInterval(interval);
      message.success('充值成功！');
      // 刷新余额
    }
  }, 3000);  // 每3秒查询一次
  
  // 5分钟后停止轮询
  setTimeout(() => clearInterval(interval), 300000);
};
```

## 测试方法

### 1. 测试Webhook（需要服务器运行）

```bash
# 终端1：启动服务器
cd server
npm start

# 终端2：模拟支付回调
node scripts/simulatePayment.js ORDER1234567890
```

### 2. 完整流程测试

```bash
# 1. 启动后端
cd server
npm start

# 2. 启动前端
cd ..
npm run dev

# 3. 浏览器访问
http://localhost:5173

# 4. 登录后进入充值页面

# 5. 创建充值订单

# 6. 在另一个终端模拟支付
node server/scripts/simulatePayment.js [订单号]

# 7. 前端应该自动显示充值成功
```

## 生产环境配置

### 1. 配置公网URL

```env
# server/.env
BACKEND_URL=https://your-domain.com
```

### 2. 确保Webhook可访问

- 服务器有公网IP或域名
- 防火墙开放端口
- 使用Nginx反向代理（推荐）

### 3. Nginx配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. 本地开发使用内网穿透

如果在本地开发，BEpusdt无法访问localhost，需要使用：

**ngrok:**
```bash
ngrok http 3001
# 将生成的URL配置到BACKEND_URL
```

**frp:**
```bash
frpc -c frpc.ini
```

**cloudflare tunnel:**
```bash
cloudflared tunnel --url http://localhost:3001
```

## 监控和调试

### 查看Webhook日志

服务器日志会显示：
```
📨 收到Webhook通知: {...}
✅ Webhook签名验证通过
✅ 订单已支付，开始处理: ORDER123
🎉 订单处理完成: ORDER123
```

### 常见问题

**Q: 订单一直是pending状态？**

A: 检查：
1. BEpusdt能否访问你的Webhook URL
2. 查看服务器日志，是否收到Webhook通知
3. 签名验证是否通过
4. 用户是否真的转账了

**Q: 如何手动更新订单状态？**

A: 使用手动更新脚本：
```bash
node server/scripts/manualUpdateOrder.js ORDER123 paid TX_HASH
```

## 相关文件

- `server/services/bepusdtService.js` - BEpusdt服务（已修改）
- `server/services/rechargeService.js` - 充值服务（已修改）
- `server/routes/recharge.js` - Webhook路由（已优化）
- `server/scripts/simulatePayment.js` - 支付模拟脚本（新增）
- `server/scripts/testBepusdtQuery.js` - API测试脚本（新增）
- `BEPUSDT_WEBHOOK_GUIDE.md` - Webhook详细指南（新增）

## 总结

BEpusdt的设计理念是：
- ✅ 创建订单 - 支持
- ✅ Webhook回调 - 支持
- ❌ 主动查询 - 不支持

这种设计更安全、更高效，因为：
1. 减少API调用
2. 实时性更好（区块链确认后立即通知）
3. 避免轮询BEpusdt服务器

你的应用应该：
1. 依赖Webhook更新订单状态
2. 前端轮询查询自己的数据库
3. 确保Webhook URL可访问
4. 做好异常处理（超时、失败等）
