# 生产环境部署检查清单 ✅

## 🎯 当前问题

1. ❌ `Error: Cannot find module 'dotenv'` - server目录缺少依赖
2. ❌ `USER_MONGO_URI 未在 .env 中配置` - 环境变量加载问题

---

## ✅ 完整部署流程

### 第1步：准备工作

```bash
# SSH登录到生产服务器
ssh root@your-server

# 进入项目目录
cd /var/www/html/knowledge-base-system/client

# 检查当前状态
pm2 status
```

### 第2步：安装依赖 ⭐ 重要

```bash
# 进入server目录
cd server

# 安装所有依赖
npm install

# 验证dotenv已安装
npm list dotenv

# 应该看到：
# └── dotenv@16.6.1

# 返回项目根目录
cd ..
```

### 第3步：更新代码

```bash
# 如果使用Git
git pull origin main

# 或手动更新server/index.js
# 确保第一行是：
# require('dotenv').config({ path: require('path').join(__dirname, '.env') });
```

### 第4步：验证配置

```bash
# 检查.env文件存在
ls -la server/.env

# 检查环境变量
cat server/.env | grep USER_MONGO_URI

# 应该看到类似：
# USER_MONGO_URI=mongodb://...
```

### 第5步：启动服务

```bash
# 停止旧进程
pm2 stop base2
pm2 delete base2

# 启动新进程
pm2 start server/index.js --name base2

# 或使用智能启动脚本（如果有）
# node start-pm2-with-env.cjs

# 保存PM2配置
pm2 save
```

### 第6步：验证启动

```bash
# 查看PM2状态
pm2 status

# 查看日志
pm2 logs base2 --lines 50

# 应该看到：
# ✓ 用户数据库连接成功
# ✓ 查询数据库连接成功
# 服务器运行在 http://0.0.0.0:3001
```

### 第7步：测试API

```bash
# 测试健康检查
curl http://localhost:3001/api/health

# 应该返回成功响应
```

---

## 📋 详细检查清单

### 环境检查

- [ ] Node.js已安装（v14+）
  ```bash
  node --version
  ```

- [ ] npm已安装
  ```bash
  npm --version
  ```

- [ ] PM2已安装
  ```bash
  pm2 --version
  ```

### 文件检查

- [ ] 项目目录存在
  ```bash
  ls -la /var/www/html/knowledge-base-system/client
  ```

- [ ] server/package.json存在
  ```bash
  ls -la server/package.json
  ```

- [ ] server/.env存在
  ```bash
  ls -la server/.env
  ```

- [ ] server/index.js存在
  ```bash
  ls -la server/index.js
  ```

### 依赖检查

- [ ] server/node_modules存在
  ```bash
  ls -la server/node_modules/
  ```

- [ ] dotenv已安装
  ```bash
  cd server && npm list dotenv
  ```

- [ ] 所有依赖已安装
  ```bash
  cd server && npm list
  ```

### 配置检查

- [ ] .env包含USER_MONGO_URI
  ```bash
  grep USER_MONGO_URI server/.env
  ```

- [ ] .env包含QUERY_MONGO_URI
  ```bash
  grep QUERY_MONGO_URI server/.env
  ```

- [ ] .env包含JWT_SECRET
  ```bash
  grep JWT_SECRET server/.env
  ```

- [ ] server/index.js正确加载.env
  ```bash
  head -n 2 server/index.js
  ```
  应该看到：
  ```javascript
  require('dotenv').config({ path: require('path').join(__dirname, '.env') });
  ```

### 服务检查

- [ ] PM2进程运行中
  ```bash
  pm2 list | grep base2
  ```

- [ ] 端口3001未被占用（或PM2正在使用）
  ```bash
  netstat -tlnp | grep 3001
  ```

- [ ] 数据库可访问
  ```bash
  ping api.anyconnects.eu.org
  ```

### 日志检查

- [ ] 无错误日志
  ```bash
  pm2 logs base2 --err --lines 50 --nostream
  ```

- [ ] 数据库连接成功
  ```bash
  pm2 logs base2 --lines 50 --nostream | grep "数据库连接成功"
  ```

---

## 🚨 常见问题修复

### 问题1: Cannot find module 'dotenv'

```bash
cd /var/www/html/knowledge-base-system/client/server
npm install
cd ..
pm2 restart base2
```

### 问题2: USER_MONGO_URI 未配置

```bash
# 检查.env文件
cat server/.env | grep USER_MONGO_URI

# 如果不存在，添加：
echo 'USER_MONGO_URI=mongodb://user:pass@host:port/db?authSource=admin' >> server/.env

# 重启服务
pm2 restart base2
```

### 问题3: PM2进程反复重启

```bash
# 查看错误日志
pm2 logs base2 --err --lines 100

# 完全重启
pm2 stop base2
pm2 delete base2
pm2 start server/index.js --name base2
```

### 问题4: 端口被占用

```bash
# 查找占用进程
netstat -tlnp | grep 3001

# 杀死进程
kill -9 <PID>

# 或修改端口
# 编辑 server/.env，修改 PORT=3002
```

### 问题5: 数据库连接失败

```bash
# 测试数据库连接
ping api.anyconnects.eu.org

# 检查数据库URI
cat server/.env | grep MONGO_URI

# 测试连接
node server/scripts/testDatabaseConnection.js
```

---

## 🔧 一键部署脚本

创建并运行：

```bash
cat > /tmp/deploy-production.sh << 'EOF'
#!/bin/bash
set -e

echo "=== 生产环境部署 ==="
echo ""

# 1. 进入项目目录
echo "[1/7] 进入项目目录..."
cd /var/www/html/knowledge-base-system/client

# 2. 安装依赖
echo "[2/7] 安装server依赖..."
cd server
npm install
cd ..

# 3. 更新代码（如果使用Git）
echo "[3/7] 更新代码..."
git pull origin main || echo "跳过Git更新"

# 4. 检查配置
echo "[4/7] 检查配置..."
if [ ! -f "server/.env" ]; then
    echo "错误: server/.env 不存在"
    exit 1
fi

# 5. 停止旧进程
echo "[5/7] 停止旧进程..."
pm2 stop base2 2>/dev/null || true
pm2 delete base2 2>/dev/null || true

# 6. 启动服务
echo "[6/7] 启动服务..."
pm2 start server/index.js --name base2

# 7. 保存配置
echo "[7/7] 保存PM2配置..."
pm2 save

echo ""
echo "=== 部署完成 ==="
echo ""
echo "查看状态: pm2 status"
echo "查看日志: pm2 logs base2"
echo ""

# 显示日志
pm2 logs base2 --lines 30 --nostream
EOF

chmod +x /tmp/deploy-production.sh
/tmp/deploy-production.sh
```

---

## 📊 成功标志

### PM2状态

```bash
pm2 status
```

应该看到：
```
┌─────┬──────────┬─────────────┬─────────┬─────────┬──────────┐
│ id  │ name     │ namespace   │ version │ mode    │ pid      │
├─────┼──────────┼─────────────┼─────────┼─────────┼──────────┤
│ 0   │ base2    │ default     │ 1.0.0   │ fork    │ online   │
└─────┴──────────┴─────────────┴─────────┴─────────┴──────────┘
```

### 日志输出

```bash
pm2 logs base2 --lines 20 --nostream
```

应该看到：
```
✓ 用户数据库连接成功
✓ 查询数据库连接成功
服务器运行在 http://0.0.0.0:3001
```

### API测试

```bash
curl http://localhost:3001/api/health
```

应该返回：
```json
{"status":"ok"}
```

---

## 📞 获取帮助

如果问题仍未解决：

1. **查看完整日志**
   ```bash
   pm2 logs base2 --lines 200
   ```

2. **查看错误日志**
   ```bash
   pm2 logs base2 --err --lines 100
   ```

3. **查看PM2详细信息**
   ```bash
   pm2 show base2
   ```

4. **参考文档**
   - PRODUCTION_DOTENV_FIX_NOW.md
   - PRODUCTION_PM2_FIX_NOW.md
   - PM2_使用指南.md

---

**最后更新：** 2024-11-09  
**状态：** ✅ 完整  
**优先级：** 🚨 高
