# BEpusdt Webhook配置指南

## 重要发现

**BEpusdt不提供主动查询订单的API接口！**

BEpusdt的工作方式是：
1. 创建订单时，BEpusdt返回收款地址
2. 用户向该地址转账
3. BEpusdt监控区块链，发现转账后**主动通知**你的服务器（Webhook）
4. 你的服务器收到通知后更新订单状态

## Webhook配置

### 1. Webhook URL

你的Webhook地址已配置为：
```
https://你的域名/api/recharge/webhook
```

在创建订单时，这个地址会自动传递给BEpusdt：
```javascript
notify_url: `${backendUrl}/api/recharge/webhook`
```

### 2. BEpusdt配置

确保在BEpusdt管理后台配置：
- **商户ID**: `1000`
- **密钥**: 你的SECRET_KEY
- **Webhook URL**: 允许你的服务器域名

### 3. Webhook数据格式

BEpusdt发送的Webhook数据格式：
```json
{
  "order_id": "ORDER1234567890",
  "status": 2,  // 2表示已支付
  "tx_hash": "0x...",  // 交易哈希
  "block_number": 12345,  // 区块号
  "signature": "..."  // 签名
}
```

### 4. 签名验证

Webhook接收到数据后会验证签名：
```javascript
// 1. 移除signature字段
// 2. 按key排序参数
// 3. 拼接成 key1=value1&key2=value2&SECRET_KEY
// 4. MD5加密并转小写
// 5. 对比签名
```

## 工作流程

### 用户充值流程

```
1. 用户选择充值金额
   ↓
2. 后端调用BEpusdt创建订单
   ↓
3. BEpusdt返回收款地址
   ↓
4. 前端显示收款地址和二维码
   ↓
5. 用户使用钱包转账
   ↓
6. BEpusdt监控到转账
   ↓
7. BEpusdt调用Webhook通知后端
   ↓
8. 后端验证签名
   ↓
9. 后端更新订单状态
   ↓
10. 后端给用户加积分/VIP
   ↓
11. 前端轮询查询订单状态
   ↓
12. 前端显示充值成功
```

### 订单状态查询

由于BEpusdt不提供查询API，订单状态查询的逻辑是：
1. 前端定时查询后端的订单状态
2. 后端直接返回数据库中的订单状态
3. 订单状态由Webhook回调自动更新

```javascript
// 前端轮询
setInterval(async () => {
  const result = await api.get(`/api/recharge/query/${orderId}`);
  if (result.order.status === 'paid') {
    // 显示充值成功
  }
}, 3000); // 每3秒查询一次
```

## 测试Webhook

### 本地测试

如果在本地开发，BEpusdt无法访问你的localhost，需要使用内网穿透工具：

1. **使用ngrok**
```bash
ngrok http 3001
```

2. **使用frp**
```bash
frpc -c frpc.ini
```

3. **使用cloudflare tunnel**
```bash
cloudflared tunnel --url http://localhost:3001
```

然后将生成的公网URL配置到环境变量：
```env
BACKEND_URL=https://your-ngrok-url.ngrok.io
```

### 生产环境

确保：
1. 服务器有公网IP或域名
2. 防火墙开放3001端口（或使用Nginx反向代理）
3. BACKEND_URL配置为你的实际域名

## 手动测试Webhook

可以使用curl模拟BEpusdt发送Webhook：

```bash
node server/scripts/testBepusdtWebhook.js ORDER1234567890
```

## 常见问题

### Q: 为什么订单一直是pending状态？

A: 可能的原因：
1. BEpusdt无法访问你的Webhook URL（检查防火墙、域名配置）
2. Webhook签名验证失败（检查SECRET_KEY是否正确）
3. BEpusdt服务未运行或配置错误
4. 用户还没有实际转账

### Q: 如何查看Webhook日志？

A: 查看服务器日志：
```bash
# 查看实时日志
cd server
npm start

# 日志会显示：
# 📨 收到Webhook通知: {...}
# ✅ Webhook签名验证通过
# ✅ 订单已支付，开始处理: ORDER123
# 🎉 订单处理完成: ORDER123
```

### Q: 测试模式下如何模拟支付？

A: 在测试模式下（BEPUSDT_TEST_MODE=true），可以手动调用Webhook：
```bash
node server/scripts/simulatePayment.js ORDER1234567890
```

## 安全建议

1. **验证签名** - 必须验证每个Webhook的签名
2. **防重放** - 检查订单是否已处理，避免重复加积分
3. **HTTPS** - 生产环境必须使用HTTPS
4. **IP白名单** - 可以限制只接受BEpusdt服务器的IP
5. **日志记录** - 记录所有Webhook请求，便于排查问题

## 相关文件

- `server/services/bepusdtService.js` - BEpusdt服务
- `server/services/rechargeService.js` - 充值服务
- `server/routes/recharge.js` - 充值路由（包含Webhook）
- `server/models/RechargeOrder.js` - 订单模型
- `server/.env` - 环境配置

## 下一步

1. 确保BEpusdt服务正常运行
2. 配置正确的Webhook URL
3. 测试完整的充值流程
4. 监控Webhook日志
5. 处理异常情况（超时、失败等）
