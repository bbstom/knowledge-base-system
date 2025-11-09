# 启用真实支付系统 - 快速指南

## 🎯 目标

将系统从模拟支付切换到真实的BEPUSDT支付网关。

---

## ✅ 已完成的工作

### 1. 环境配置 ✅
- 修复了 `.env` 文件中的拼写错误（`flase` → `false`）
- 配置了BEPUSDT服务地址和密钥
- 设置了测试模式为 `false`

### 2. 后端服务 ✅
- `server/services/bepusdtService.js` - BEPUSDT API集成
- `server/services/rechargeService.js` - 充值订单处理
- `server/routes/recharge.js` - 充值路由和webhook

### 3. 前端页面 ✅
- 移除了模拟支付逻辑
- 添加了真实的二维码生成
- 优化了充值说明和警告提示
- 改进了错误处理

---

## 🚀 启用步骤

### 步骤 1: 验证BEPUSDT服务

确保您的BEPUSDT服务正常运行：

```bash
# 测试API连接
curl -X GET "https://pay.vpno.eu.org/api/v1/health" \
  -H "Authorization: Bearer 123234"
```

**预期响应：**
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

### 步骤 2: 配置Webhook

在BEPUSDT管理后台配置webhook URL：

**开发环境（使用ngrok）：**
```bash
# 启动ngrok
ngrok http 3001

# 配置webhook URL
https://your-ngrok-url.ngrok.io/api/recharge/webhook
```

**生产环境：**
```
https://your-domain.com/api/recharge/webhook
```

### 步骤 3: 重启服务器

```bash
cd server
npm start
```

### 步骤 4: 测试充值流程

1. 访问充值页面：`http://localhost:5173/dashboard/recharge`
2. 选择充值金额：10元
3. 选择币种：USDT
4. 点击"立即充值"
5. 查看生成的收款地址和二维码
6. 使用钱包转账（测试环境可以使用小额）
7. 等待1-3分钟确认
8. 验证余额是否到账

---

## 🔍 验证清单

### 前端验证

- [ ] 充值页面正常加载
- [ ] 可以选择预设金额
- [ ] 可以输入自定义金额
- [ ] 可以切换USDT/TRX
- [ ] 汇率显示正确
- [ ] 点击"立即充值"创建订单
- [ ] 显示收款地址
- [ ] 显示支付金额
- [ ] 显示二维码
- [ ] 显示倒计时
- [ ] 可以复制地址和金额
- [ ] 可以手动检查支付状态

### 后端验证

- [ ] 订单创建成功
- [ ] 调用BEPUSDT API成功
- [ ] 订单保存到数据库
- [ ] Webhook接收正常
- [ ] 签名验证通过
- [ ] 余额充值成功
- [ ] 佣金结算成功
- [ ] 日志记录完整

### 数据库验证

```javascript
// 检查订单记录
db.rechargeorders.find({ userId: ObjectId("your-user-id") })

// 检查余额日志
db.balancelogs.find({ userId: ObjectId("your-user-id"), type: "recharge" })

// 检查用户余额
db.users.findOne({ _id: ObjectId("your-user-id") })
```

---

## 📊 监控日志

### 正常流程日志

```
📝 创建充值订单: { userId: '...', type: 'points', amount: 100, currency: 'USDT' }
🔑 订单ID: ORDER1729328400123
🌐 BEpusdt配置: { url: 'https://pay.vpno.eu.org', hasApiKey: true, merchantId: '1000' }
🚀 调用BEpusdt API: { url: '...', params: {...} }
✅ BEpusdt订单创建成功: { order_id: '...', payment_address: '...' }

📨 收到Webhook通知: { order_id: 'ORDER1729328400123', status: 'paid' }
✅ 订单 ORDER1729328400123 处理成功
✅ 用户 username 充值 1000 积分成功
💰 推荐佣金: 50元
```

### 错误日志

```
❌ BEpusdt createOrder error: { message: '...', response: {...} }
❌ 无法连接到支付服务，请检查BEpusdt服务是否正常运行
❌ Webhook签名验证失败
```

---

## 🛠️ 故障排查

### 问题 1: 无法创建订单

**症状：** 点击"立即充值"后提示"创建订单失败"

**可能原因：**
1. BEPUSDT服务未运行
2. API密钥配置错误
3. 网络连接问题

**解决方案：**
```bash
# 检查BEPUSDT服务状态
curl https://pay.vpno.eu.org/api/v1/health

# 检查环境变量
cat server/.env | grep BEPUSDT

# 查看服务器日志
tail -f server/logs/app.log
```

### 问题 2: Webhook未收到通知

**症状：** 支付成功但余额未到账

**可能原因：**
1. Webhook URL配置错误
2. 服务器无法从外网访问
3. 签名验证失败

**解决方案：**
```bash
# 使用ngrok暴露本地服务
ngrok http 3001

# 在BEPUSDT后台配置webhook URL
https://your-ngrok-url.ngrok.io/api/recharge/webhook

# 测试webhook
curl -X POST http://localhost:3001/api/recharge/webhook \
  -H "Content-Type: application/json" \
  -d '{"order_id":"TEST","status":"paid","sign":"..."}'
```

### 问题 3: 余额未到账

**症状：** Webhook收到但余额未增加

**可能原因：**
1. 订单状态已经是paid
2. 用户不存在
3. 数据库更新失败

**解决方案：**
```javascript
// 检查订单状态
db.rechargeorders.findOne({ orderId: "ORDER1729328400123" })

// 检查用户余额
db.users.findOne({ _id: ObjectId("user-id") })

// 检查余额日志
db.balancelogs.find({ orderId: "ORDER1729328400123" })
```

---

## 🔐 安全检查

### 必须配置的安全项

- [ ] 使用HTTPS协议
- [ ] 配置正确的SECRET_KEY
- [ ] 启用webhook签名验证
- [ ] 设置请求频率限制
- [ ] 记录所有支付日志
- [ ] 监控异常订单
- [ ] 设置充值金额上限

### 推荐的安全措施

- [ ] 配置IP白名单
- [ ] 启用双因素认证
- [ ] 定期更新API密钥
- [ ] 实施风控规则
- [ ] 建立黑名单机制
- [ ] 设置告警通知

---

## 📈 性能优化建议

### 1. 使用Redis缓存

```javascript
// 缓存汇率数据
const rates = await redis.get('exchange_rates');
if (!rates) {
  const newRates = await bepusdtService.getExchangeRates();
  await redis.setex('exchange_rates', 300, JSON.stringify(newRates));
}
```

### 2. 异步处理Webhook

```javascript
// 使用消息队列
router.post('/webhook', async (req, res) => {
  res.status(200).send('OK');
  await queue.add('process-payment', req.body);
});
```

### 3. 批量查询订单

```javascript
// 批量查询pending订单
const pendingOrders = await RechargeOrder.find({ 
  status: 'pending',
  expireAt: { $gt: new Date() }
});
```

---

## 📞 获取帮助

### 文档资源

- **BEPUSDT项目：** https://github.com/v03413/BEpusdt
- **TRC20文档：** https://developers.tron.network/
- **TRON浏览器：** https://tronscan.org/

### 技术支持

如果遇到问题，请提供以下信息：

1. 错误日志
2. 订单ID
3. 用户ID
4. 操作步骤
5. 预期结果
6. 实际结果

---

## ✨ 下一步

真实支付系统已启用！您现在可以：

✅ 接受真实的USDT/TRX充值
✅ 自动检测支付状态
✅ 自动充值用户余额
✅ 自动结算推荐佣金
✅ 查看完整的充值记录

**建议：**
1. 先在测试环境充分测试
2. 使用小额进行真实支付测试
3. 验证所有功能正常后再上线
4. 配置监控和告警
5. 准备应急预案

祝您使用愉快！💰🎉
