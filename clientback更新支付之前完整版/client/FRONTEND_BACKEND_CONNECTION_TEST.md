# 前后端连接测试指南

## ✅ 已完成的配置

### 1. Vite代理配置 ✅

`vite.config.ts` 已配置：
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
}
```

### 2. 前端API调用已更新 ✅

**充值页面 (Recharge.tsx):**
- ✅ 创建订单：`POST /api/recharge/create`
- ✅ 查询订单：`GET /api/recharge/query/:orderId`

**充值中心 (RechargeCenter.tsx):**
- ✅ 跳转到充值页面，传递套餐信息

### 3. 后端API端点 ✅

**服务器 (server/index.js):**
- ✅ `POST /api/recharge/create` - 创建充值订单
- ✅ `GET /api/recharge/query/:orderId` - 查询订单状态
- ✅ `GET /api/recharge/history/:userId` - 获取充值记录
- ✅ `POST /api/recharge/webhook` - Webhook通知

---

## 🚀 测试步骤

### 步骤1：启动后端服务器

```bash
cd server
npm install
npm start
```

应该看到：
```
🚀 知识库系统后端服务器启动成功
📡 服务器地址: http://localhost:3001
```

### 步骤2：测试后端健康检查

打开浏览器访问：http://localhost:3001/health

应该看到：
```json
{
  "status": "ok",
  "timestamp": "2024-10-19T...",
  "bepusdt": {
    "url": "https://pay.vpno.eu.org",
    "merchantId": "1000"
  }
}
```

### 步骤3：启动前端服务器

在新的终端窗口：
```bash
npm run dev
```

应该看到：
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### 步骤4：测试前后端连接

1. **打开浏览器**
   - 访问：http://localhost:5173

2. **打开开发者工具**
   - 按 F12
   - 切换到 Console 标签

3. **访问充值中心**
   - 点击侧边栏"充值中心"
   - 或访问：http://localhost:5173/dashboard/recharge-center

4. **选择充值套餐**
   - 选择任意积分套餐（如100积分/¥10）
   - 点击套餐卡片

5. **查看网络请求**
   - 切换到 Network 标签
   - 应该看到：
     ```
     POST /api/recharge/create
     Status: 200 OK
     ```

6. **查看后端日志**
   - 切换到后端服务器终端
   - 应该看到：
     ```
     📝 创建订单请求: { userId: '...', type: 'points', ... }
     ✅ 订单创建成功: { orderId: 'ORDER...', ... }
     ```

7. **查看支付页面**
   - 应该显示：
     - 订单号
     - 支付金额
     - 收款地址
     - 二维码区域

---

## 🔍 验证清单

### 后端验证

- [ ] 后端服务器启动成功
- [ ] 数据库连接成功（用户数据库 + 查询数据库）
- [ ] 健康检查返回正常
- [ ] BEpusdt配置正确

### 前端验证

- [ ] 前端服务器启动成功
- [ ] 充值中心页面显示正常
- [ ] 套餐列表显示正常
- [ ] 点击套餐可以跳转

### 连接验证

- [ ] 点击套餐后发送API请求
- [ ] API请求到达后端（查看后端日志）
- [ ] 后端返回订单数据
- [ ] 前端显示支付信息
- [ ] 收款地址显示正常
- [ ] 支付金额显示正常

---

## 🐛 常见问题

### 问题1：前端请求404

**现象：**
```
GET http://localhost:5173/api/recharge/create 404 (Not Found)
```

**原因：** Vite代理未生效

**解决：**
1. 检查 `vite.config.ts` 配置
2. 重启前端服务器
3. 清除浏览器缓存

### 问题2：后端CORS错误

**现象：**
```
Access to fetch at 'http://localhost:3001/api/recharge/create' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**原因：** 后端CORS配置问题

**解决：**
后端已配置CORS，如果仍有问题，检查 `server/index.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### 问题3：数据库连接失败

**现象：**
```
❌ 用户数据库连接失败: MongoNetworkError
```

**原因：** 数据库地址或密码错误

**解决：**
1. 检查 `server/.env` 中的数据库配置
2. 测试数据库连接
3. 检查网络和防火墙

### 问题4：BEpusdt API调用失败

**现象：**
```
❌ 创建订单失败: Request failed with status code 401
```

**原因：** API密钥或商户ID错误

**解决：**
1. 检查 `server/.env` 中的BEpusdt配置
2. 确认API密钥和商户ID正确
3. 测试BEpusdt服务是否正常

---

## 📊 完整测试流程

### 测试1：创建积分充值订单

1. 访问充值中心
2. 选择"100积分/¥10"套餐
3. 点击套餐卡片
4. 查看Network标签：
   ```
   Request URL: http://localhost:5173/api/recharge/create
   Request Method: POST
   Status Code: 200 OK
   ```
5. 查看Response：
   ```json
   {
     "success": true,
     "order": {
       "orderId": "ORDER1729328400123",
       "amount": 10,
       "actualAmount": 1.39,
       "currency": "USDT",
       "paymentAddress": "TXxx...",
       "status": "pending"
     }
   }
   ```
6. 查看后端日志：
   ```
   📝 创建订单请求: { userId: 'temp-user-id', type: 'points', amount: 10, currency: 'USDT', points: 100 }
   ✅ 订单创建成功
   ```

### 测试2：查询订单状态

1. 在支付页面
2. 点击"检查支付状态"按钮
3. 查看Network标签：
   ```
   Request URL: http://localhost:5173/api/recharge/query/ORDER1729328400123
   Request Method: GET
   Status Code: 200 OK
   ```
4. 查看Response：
   ```json
   {
     "success": true,
     "order": {
       "orderId": "ORDER1729328400123",
       "status": "pending",
       "amount": 10,
       "actualAmount": 1.39
     }
   }
   ```

---

## ✅ 成功标志

如果看到以下情况，说明前后端连接成功：

1. ✅ 后端服务器正常运行
2. ✅ 前端服务器正常运行
3. ✅ 点击套餐后，Network显示API请求成功
4. ✅ 后端日志显示收到请求
5. ✅ 前端显示支付信息（订单号、地址、金额）
6. ✅ 没有CORS错误
7. ✅ 没有404错误
8. ✅ 没有500错误

---

## 🎯 下一步

连接成功后：

1. **测试完整支付流程**
   - 使用测试网络完成一笔支付
   - 验证Webhook通知
   - 验证余额更新

2. **添加用户认证**
   - 实现登录功能
   - 获取真实用户ID
   - 替换临时用户ID

3. **完善错误处理**
   - 添加更详细的错误提示
   - 添加重试机制
   - 添加日志记录

4. **部署到生产环境**
   - 配置HTTPS
   - 配置域名
   - 配置Webhook URL

---

## 📞 需要帮助？

如果遇到问题：

1. **检查后端日志** - 查看详细错误信息
2. **检查浏览器Console** - 查看前端错误
3. **检查Network标签** - 查看API请求详情
4. **查看文档** - BACKEND_COMPLETE_GUIDE.md

---

更新时间：2024-10-19
状态：✅ 已配置完成，可以测试
