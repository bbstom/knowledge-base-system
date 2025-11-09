# BEpusdt快速参考

## 核心发现

**BEpusdt不提供查询订单API，只支持Webhook回调！**

## 快速测试

### 1. 启动服务器
```bash
cd server
npm start
```

### 2. 模拟支付（另一个终端）
```bash
cd server
node scripts/simulatePayment.js ORDER1234567890
```

### 3. 查看日志
服务器会显示：
```
📨 收到Webhook通知
✅ Webhook签名验证通过
✅ 订单已支付，开始处理
🎉 订单处理完成
```

## 工作原理

```
创建订单 → 返回收款地址 → 用户转账 
→ BEpusdt监控 → Webhook通知 → 更新状态
```

## 关键配置

### .env文件
```env
# BEpusdt配置
BEPUSDT_URL=https://pay.vpno.eu.org
BEPUSDT_MERCHANT_ID=1000
BEPUSDT_SECRET_KEY=123234

# Webhook URL（生产环境改为实际域名）
BACKEND_URL=http://localhost:3001
```

### Webhook端点
```
POST /api/recharge/webhook
```

## 前端轮询示例

```javascript
// 每3秒查询一次订单状态
const checkStatus = setInterval(async () => {
  const result = await api.get(`/api/recharge/query/${orderId}`);
  if (result.order.status === 'paid') {
    clearInterval(checkStatus);
    message.success('充值成功！');
  }
}, 3000);
```

## 生产环境

### 必须配置
1. 公网域名或IP
2. BACKEND_URL改为实际地址
3. 确保BEpusdt能访问Webhook

### 本地开发
使用内网穿透：
```bash
# ngrok
ngrok http 3001

# 然后更新BACKEND_URL
BACKEND_URL=https://xxx.ngrok.io
```

## 测试脚本

| 脚本 | 用途 |
|------|------|
| `testBepusdtQuery.js` | 测试查询API（会返回404） |
| `exploreBepusdtApi.js` | 探测可用API |
| `simulatePayment.js` | 模拟支付回调 |
| `manualUpdateOrder.js` | 手动更新订单 |

## 故障排查

### 订单一直pending？
1. 检查服务器日志，是否收到Webhook
2. 检查BACKEND_URL配置
3. 检查防火墙/端口
4. 检查签名验证

### 手动更新订单
```bash
node server/scripts/manualUpdateOrder.js ORDER123 paid TX_HASH
```

## 相关文档

- `BEPUSDT_QUERY_SOLUTION.md` - 完整解决方案
- `BEPUSDT_WEBHOOK_GUIDE.md` - Webhook详细指南
- `REAL_PAYMENT_SYSTEM_SETUP.md` - 支付系统设置

## 重要提示

✅ **正确做法：**
- 依赖Webhook更新订单
- 前端轮询查询数据库
- 做好异常处理

❌ **错误做法：**
- 尝试调用BEpusdt查询API（不存在）
- 不配置Webhook URL
- 不验证Webhook签名
