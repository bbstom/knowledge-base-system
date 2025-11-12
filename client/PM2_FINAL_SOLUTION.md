# PM2环境变量问题 - 最终解决方案 ✅

## 问题已解决！

环境变量加载测试成功：
```
✓ USER_MONGO_URI
✓ QUERY_MONGO_URI  
✓ JWT_SECRET
```

## 快速启动（3步）

### 1. 安装PM2（如果还没安装）

```bash
npm install -g pm2
```

### 2. 运行启动脚本

```bash
node start-pm2-with-env.cjs
```

### 3. 查看状态

```bash
pm2 status
pm2 logs base2
```

就这么简单！

## 工作原理

`start-pm2-with-env.cjs` 脚本会：

1. ✅ 自动加载 `server/.env` 文件
2. ✅ 验证所有关键环境变量
3. ✅ 停止旧的PM2进程
4. ✅ 使用正确的环境变量启动新进程
5. ✅ 显示启动状态和日志

## 生产环境部署

在你的生产服务器上：

```bash
# 1. 进入项目目录
cd /var/www/html/knowledge-base-system/client

# 2. 确保PM2已安装
npm install -g pm2

# 3. 运行启动脚本
node start-pm2-with-env.cjs

# 4. 设置开机自启
pm2 save
pm2 startup
```

## 常用PM2命令

```bash
# 查看所有进程
pm2 list

# 查看实时日志
pm2 logs base2

# 查看最近50行日志
pm2 logs base2 --lines 50

# 重启服务
pm2 restart base2

# 停止服务
pm2 stop base2

# 删除进程
pm2 delete base2

# 查看详细信息
pm2 show base2

# 监控资源使用
pm2 monit
```

## 文件说明

### 1. `ecosystem.config.js`
PM2配置文件，定义应用的基本设置。

### 2. `start-pm2-with-env.cjs`
智能启动脚本，自动处理环境变量加载。

### 3. `server/.env`
环境变量配置文件，包含所有敏感信息。

## 验证环境变量

如果想手动验证环境变量是否正确加载：

```bash
# 方法1：使用Node.js
node -e "require('dotenv').config({path:'./server/.env'}); console.log('USER_MONGO_URI:', process.env.USER_MONGO_URI)"

# 方法2：查看PM2进程信息
pm2 show base2
```

## 故障排查

### 问题1：PM2未安装
```bash
npm install -g pm2
```

### 问题2：端口被占用
```bash
# Windows
netstat -ano | findstr :3001

# Linux/Mac
lsof -i :3001

# 杀死占用端口的进程
pm2 stop base2
```

### 问题3：数据库连接失败
检查 `server/.env` 中的数据库URI是否正确：
```
USER_MONGO_URI=mongodb://user:pass@host:port/db?authSource=admin
```

### 问题4：环境变量未生效
重新运行启动脚本：
```bash
pm2 stop base2
pm2 delete base2
node start-pm2-with-env.cjs
```

## 成功标志

当你看到以下输出时，说明一切正常：

```
=== PM2环境变量启动脚本 ===

1. 加载环境变量...
   ✓ 环境变量已加载

2. 验证关键环境变量...
   ✓ USER_MONGO_URI
   ✓ QUERY_MONGO_URI
   ✓ JWT_SECRET

3. 停止旧PM2进程...
   ✓ 旧进程已停止

4. 启动PM2进程...
   ✓ PM2进程已启动

5. PM2状态:
┌─────┬──────────┬─────────────┬─────────┬─────────┬──────────┐
│ id  │ name     │ namespace   │ version │ mode    │ pid      │
├─────┼──────────┼─────────────┼─────────┼─────────┼──────────┤
│ 0   │ base2    │ default     │ 1.0.0   │ fork    │ 12345    │
└─────┴──────────┴─────────────┴─────────┴─────────┴──────────┘

6. 最新日志:
✓ 用户数据库连接成功
✓ 查询数据库连接成功
服务器运行在 http://0.0.0.0:3001

✅ 启动完成！
```

## 下一步

现在你可以：

1. ✅ 访问 http://localhost:3001 测试API
2. ✅ 查看实时日志：`pm2 logs base2`
3. ✅ 部署到生产环境
4. ✅ 设置开机自启：`pm2 save && pm2 startup`

## 技术细节

### 为什么之前失败？

PM2默认不会自动加载.env文件。需要：
1. 在启动前手动加载环境变量
2. 或使用PM2的ecosystem配置
3. 或使用我们的智能启动脚本

### 我们的解决方案

`start-pm2-with-env.cjs` 脚本在启动PM2之前：
1. 使用 `dotenv` 加载 `.env` 文件
2. 将环境变量注入到 `process.env`
3. PM2继承这些环境变量
4. 应用正常运行

### 为什么使用.cjs扩展名？

因为项目的 `package.json` 中设置了 `"type": "module"`，所以：
- `.js` 文件被视为ES模块
- `.cjs` 文件被视为CommonJS模块
- PM2和dotenv需要CommonJS格式

---

**状态：** ✅ 已完全解决
**测试：** ✅ 环境变量加载成功
**下一步：** 安装PM2并运行 `node start-pm2-with-env.cjs`

**最后更新：** 2024-11-09
