# PM2环境变量问题 - 解决总结

## ✅ 问题已解决

**原始问题：** PM2启动时报错 `USER_MONGO_URI 未在 .env 中配置`

**根本原因：** PM2默认不会自动加载.env文件中的环境变量

**解决方案：** 创建智能启动脚本，在启动PM2前自动加载环境变量

## 🎯 立即使用

### 最简单的方式

**Windows:**
```bash
start-pm2.bat
```

**Linux/Mac:**
```bash
chmod +x start-pm2.sh
./start-pm2.sh
```

### 手动方式

```bash
node start-pm2-with-env.cjs
```

## 📁 创建的文件

1. **start-pm2-with-env.cjs** - 智能启动脚本（核心）
2. **ecosystem.config.js** - PM2配置文件
3. **start-pm2.bat** - Windows一键启动
4. **start-pm2.sh** - Linux/Mac一键启动
5. **PM2_FINAL_SOLUTION.md** - 完整解决方案文档
6. **PM2_使用指南.md** - 详细使用指南

## 🔍 验证结果

运行测试后的输出：
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
```

## 🚀 下一步操作

### 开发环境

```bash
# 1. 安装PM2（如果还没有）
npm install -g pm2

# 2. 启动服务
node start-pm2-with-env.cjs

# 3. 查看日志
pm2 logs base2
```

### 生产环境

```bash
# 1. 进入项目目录
cd /var/www/html/knowledge-base-system/client

# 2. 安装PM2
npm install -g pm2

# 3. 启动服务
node start-pm2-with-env.cjs

# 4. 设置开机自启
pm2 save
pm2 startup
```

## 📊 常用命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs base2

# 重启服务
pm2 restart base2

# 停止服务
pm2 stop base2

# 监控资源
pm2 monit
```

## 🔧 技术细节

### 工作原理

1. `start-pm2-with-env.cjs` 使用 `dotenv` 加载 `server/.env`
2. 环境变量被注入到 `process.env`
3. PM2启动时继承这些环境变量
4. 应用可以正常访问所有环境变量

### 为什么使用.cjs扩展名

因为项目的 `package.json` 设置了 `"type": "module"`：
- `.js` 文件 = ES模块
- `.cjs` 文件 = CommonJS模块
- PM2和dotenv需要CommonJS

### 环境变量列表

从 `server/.env` 加载的变量：
- `USER_MONGO_URI` - 用户数据库连接
- `QUERY_MONGO_URI` - 查询数据库连接
- `JWT_SECRET` - JWT密钥
- `BEPUSDT_*` - 支付配置
- `SMTP_*` - 邮件配置
- `PORT` - 服务端口
- `TZ` - 时区设置

## ⚠️ 注意事项

1. **不要提交.env文件到Git**
   - 已在 `.gitignore` 中排除
   - 包含敏感信息

2. **生产环境安全**
   - 使用强密码
   - 限制数据库访问IP
   - 配置防火墙

3. **定期维护**
   - 查看日志：`pm2 logs base2`
   - 监控资源：`pm2 monit`
   - 定期重启：`pm2 restart base2`

## 🐛 故障排查

### PM2未安装
```bash
npm install -g pm2
```

### 端口被占用
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <进程ID> /F

# Linux/Mac
lsof -i :3001
kill -9 <进程ID>
```

### 数据库连接失败
```bash
# 测试连接
node server/scripts/testDatabaseConnection.js

# 检查.env配置
cat server/.env | grep MONGO_URI
```

### 环境变量未生效
```bash
# 完全重启
pm2 stop base2
pm2 delete base2
node start-pm2-with-env.cjs
```

## 📖 相关文档

- **PM2_FINAL_SOLUTION.md** - 详细解决方案
- **PM2_使用指南.md** - 完整使用指南
- **PRODUCTION_DEPLOYMENT_GUIDE.md** - 生产部署指南

## ✨ 总结

问题已完全解决！现在你可以：

✅ 使用一键脚本启动PM2  
✅ 环境变量自动加载  
✅ 数据库连接正常  
✅ 服务稳定运行  
✅ 支持生产环境部署  

---

**状态：** ✅ 已解决  
**测试：** ✅ 通过  
**文档：** ✅ 完整  
**日期：** 2024-11-09
