# 快速启动后端服务器

## 🚀 3步启动

### 步骤1：安装依赖

```bash
# 复制package.json
cp server-package.json package.json

# 安装依赖
npm install
```

### 步骤2：启动服务器

```bash
node server.js
```

你会看到：
```
==================================================
BEpusdt支付服务器启动
==================================================
服务地址: https://pay.vpno.eu.org
商户ID: 1000
==================================================

🚀 服务器运行在 http://localhost:3001
📡 健康检查: http://localhost:3001/health

等待前端请求...
```

### 步骤3：配置前端代理

在 `vite.config.ts` 中添加：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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

然后重启前端开发服务器：
```bash
npm run dev
```

---

## ✅ 测试

1. 访问健康检查：http://localhost:3001/health
2. 前端访问充值中心
3. 选择套餐，创建订单
4. 查看服务器控制台日志

---

## 📝 服务器日志示例

```
📝 创建订单请求: {
  order_id: 'ORDER1729328400123',
  amount: 100,
  currency: 'USDT',
  notify_url: 'http://localhost:5173/api/payment/notify',
  redirect_url: 'http://localhost:5173/dashboard/recharge'
}

✅ 订单创建成功: {
  success: true,
  order_id: 'ORDER1729328400123',
  payment_address: 'TXxx1234567890...',
  amount: 100,
  actual_amount: 13.89,
  currency: 'USDT',
  expire_time: 900
}
```

---

## 🔧 故障排除

### 问题1：端口被占用

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### 问题2：依赖安装失败

```bash
# 清除缓存
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 问题3：CORS错误

确保server.js中有：
```javascript
app.use(cors());
```

---

## 🎯 下一步

1. ✅ 启动后端服务器
2. ✅ 配置前端代理
3. ✅ 测试充值功能
4. 📝 实现数据库存储
5. 📝 实现用户余额管理
6. 📝 实现Webhook处理

---

需要完整的数据库集成吗？告诉我！
