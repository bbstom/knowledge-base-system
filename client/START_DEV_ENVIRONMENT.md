# 开发环境启动指南

## 快速启动

### 1. 启动后端服务器

打开第一个终端：

```bash
# Windows
cd server
npm start

# 或者使用 nodemon 实现热重载
npm install -g nodemon
nodemon server/index.js
```

后端将运行在：`http://localhost:3001`

### 2. 启动前端开发服务器

打开第二个终端：

```bash
# 在项目根目录
npm run dev
```

前端将运行在：`http://localhost:5173`

### 3. 访问应用

浏览器打开：`http://localhost:5173`

测试账号：
- 邮箱：`admin@example.com`
- 密码：`admin123`

## 环境配置

### 后端配置 (server/.env)

确保以下配置正确：

```env
# 服务器端口
PORT=3001

# 数据库连接（注意特殊字符需要URL编码）
USER_MONGO_URI=mongodb://username:password@host:port/database?authSource=admin

# JWT密钥
JWT_SECRET=your-secret-key

# 前端地址
FRONTEND_URL=http://localhost:5173
```

### 前端API配置

前端会自动连接到 `http://localhost:3001/api`

## 开发工具

### 推荐的VS Code扩展
- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- MongoDB for VS Code

### 浏览器开发工具
- React Developer Tools
- 按F12打开开发者工具查看网络请求和控制台日志

## 常见问题

### 端口冲突

如果端口被占用，可以修改：

**后端端口**：修改 `server/.env` 中的 `PORT`

**前端端口**：修改 `vite.config.ts`：
```typescript
export default defineConfig({
  server: {
    port: 5174  // 改成其他端口
  }
})
```

### 数据库连接失败

1. 确认MongoDB正在运行
2. 检查 `server/.env` 中的连接字符串
3. 特殊字符需要URL编码：
   - `!` → `%21`
   - `@` → `%40`
   - `#` → `%23`
   - `&` → `%26`

### 前端无法连接后端

检查后端是否正常运行：
```bash
curl http://localhost:3001/api/health
```

## 热重载

- **前端**：Vite自动热重载，保存即生效
- **后端**：需要重启服务器，或使用nodemon

## 调试技巧

### 查看后端日志
后端终端会显示所有请求和错误日志

### 查看前端日志
浏览器按F12 → Console标签

### 测试API
使用curl或Postman测试：
```bash
# 测试登录
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## 下一步

开发完成后，参考以下文档部署：
- `PRODUCTION_DEPLOYMENT_GUIDE.md` - 生产环境部署
- `DEPLOY_QUICK_REFERENCE.md` - 快速部署参考
