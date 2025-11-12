# 开发环境快速启动指南

## 前提条件
- Node.js (v14+)
- MongoDB (本地或远程)
- npm 或 yarn

## 启动步骤

### 1. 后端服务器

```bash
# 进入项目目录
cd /path/to/knowledge-base-system/client

# 安装依赖（如果还没安装）
cd server
npm install

# 启动后端服务器
npm start
```

后端将运行在 `http://localhost:3001`

### 2. 前端开发服务器

打开新的终端窗口：

```bash
# 回到项目根目录
cd /path/to/knowledge-base-system/client

# 安装前端依赖（如果还没安装）
npm install

# 启动前端开发服务器
npm run dev
```

前端将运行在 `http://localhost:5173`

### 3. 访问应用

打开浏览器访问：`http://localhost:5173`

默认管理员账号：
- 邮箱：`admin@example.com`
- 密码：`admin123`

## 常见问题

### 问题1：端口被占用

如果3001或5173端口被占用：

**Windows:**
```cmd
# 查看占用端口的进程
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# 结束进程（替换PID）
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# 查看占用端口的进程
lsof -i :3001
lsof -i :5173

# 结束进程
kill -9 <PID>
```

### 问题2：数据库连接失败

检查 `server/.env` 文件中的数据库配置：
```env
USER_MONGO_URI=mongodb://username:password@host:port/database?authSource=admin
```

确保：
- MongoDB服务正在运行
- 用户名密码正确
- 特殊字符已URL编码（如 `!` → `%21`，`@` → `%40`）

### 问题3：前端无法连接后端

检查 `src/utils/realApi.ts` 中的API地址配置。

开发环境应该是：
```typescript
const API_BASE_URL = 'http://localhost:3001/api';
```

## 开发工具推荐

### VS Code 扩展
- ESLint
- Prettier
- MongoDB for VS Code
- Thunder Client (API测试)

### 浏览器扩展
- React Developer Tools
- Redux DevTools (如果使用Redux)

## 热重载

- 前端：Vite自动热重载，保存文件即可看到更改
- 后端：需要手动重启服务器，或使用nodemon

### 使用nodemon（推荐）

```bash
# 安装nodemon
npm install -g nodemon

# 使用nodemon启动后端
cd server
nodemon index.js
```

## 调试技巧

### 后端调试
在代码中添加：
```javascript
console.log('调试信息:', variable);
```

### 前端调试
使用浏览器开发者工具：
- F12 打开开发者工具
- Console标签查看日志
- Network标签查看API请求

### 数据库调试
使用MongoDB Compass或命令行：
```bash
mongo
use userdata
db.users.find()
```

## 下一步

开发完成后，参考 `PRODUCTION_DEPLOYMENT_GUIDE.md` 进行生产环境部署。
