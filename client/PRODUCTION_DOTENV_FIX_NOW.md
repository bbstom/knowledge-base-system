# 🚨 生产环境dotenv模块缺失 - 紧急修复

## 问题
```
Error: Cannot find module 'dotenv'
```

## 原因
生产服务器的 `server` 目录下没有安装 Node.js 依赖包。

---

## ✅ 立即修复（2步）

### 第1步：安装依赖

在生产服务器上执行：

```bash
cd /var/www/html/knowledge-base-system/client/server
npm install
```

### 第2步：启动服务

```bash
cd /var/www/html/knowledge-base-system/client
pm2 restart base2
pm2 logs base2 --lines 50
```

---

## 🎯 完整部署流程

如果上面的快速修复不够，执行完整流程：

```bash
# 1. 进入项目目录
cd /var/www/html/knowledge-base-system/client

# 2. 安装server依赖
cd server
npm install

# 3. 返回项目根目录
cd ..

# 4. 停止旧进程
pm2 stop base2
pm2 delete base2

# 5. 启动服务
pm2 start server/index.js --name base2

# 6. 查看日志
pm2 logs base2 --lines 50

# 7. 保存PM2配置
pm2 save
```

---

## ✅ 验证成功

成功的日志应该显示：

```
✓ 用户数据库连接成功
✓ 查询数据库连接成功
服务器运行在 http://0.0.0.0:3001
```

---

## 📋 检查清单

在生产服务器上确认：

```bash
# 1. 检查server/package.json存在
ls -la /var/www/html/knowledge-base-system/client/server/package.json

# 2. 检查node_modules存在
ls -la /var/www/html/knowledge-base-system/client/server/node_modules/

# 3. 检查dotenv已安装
ls -la /var/www/html/knowledge-base-system/client/server/node_modules/dotenv/

# 4. 检查.env文件存在
ls -la /var/www/html/knowledge-base-system/client/server/.env
```

---

## 🔍 如果npm install失败

### 问题1：权限不足

```bash
# 使用sudo
sudo npm install

# 或修改目录权限
sudo chown -R $USER:$USER /var/www/html/knowledge-base-system/
```

### 问题2：npm未安装

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### 问题3：网络问题

```bash
# 使用国内镜像
npm install --registry=https://registry.npmmirror.com

# 或设置永久镜像
npm config set registry https://registry.npmmirror.com
npm install
```

---

## 🚀 一键修复脚本

创建并运行此脚本：

```bash
cat > /tmp/fix-dotenv.sh << 'EOF'
#!/bin/bash
echo "=== 修复dotenv模块 ==="
cd /var/www/html/knowledge-base-system/client/server
echo "1. 安装依赖..."
npm install
echo "2. 返回项目根目录..."
cd ..
echo "3. 重启PM2..."
pm2 restart base2
echo "4. 查看日志..."
pm2 logs base2 --lines 30 --nostream
echo "=== 完成 ==="
EOF

chmod +x /tmp/fix-dotenv.sh
/tmp/fix-dotenv.sh
```

---

## 📊 依赖包列表

`server/package.json` 应该包含：

```json
{
  "dependencies": {
    "dotenv": "^16.6.1",
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    ...
  }
}
```

---

## ⚠️ 预防措施

为避免将来出现类似问题：

### 1. 部署前检查

```bash
# 在部署前确保依赖已安装
cd server
npm install
npm list dotenv
```

### 2. 使用部署脚本

创建 `deploy.sh`：

```bash
#!/bin/bash
cd /var/www/html/knowledge-base-system/client
git pull origin main
cd server
npm install
cd ..
pm2 restart base2
pm2 logs base2 --lines 50
```

### 3. 添加到文档

在 `README.md` 中添加：

```markdown
## 生产环境部署

1. 安装依赖
   ```bash
   cd server
   npm install
   ```

2. 启动服务
   ```bash
   pm2 start server/index.js --name base2
   ```
```

---

## 🔧 常见问题

### Q1: npm install很慢
**A:** 使用国内镜像：
```bash
npm install --registry=https://registry.npmmirror.com
```

### Q2: 安装后还是报错
**A:** 清除缓存重新安装：
```bash
rm -rf node_modules package-lock.json
npm install
```

### Q3: 权限被拒绝
**A:** 修改目录所有者：
```bash
sudo chown -R $USER:$USER /var/www/html/knowledge-base-system/
```

---

## 📞 快速命令参考

```bash
# 安装依赖
cd /var/www/html/knowledge-base-system/client/server && npm install

# 重启服务
pm2 restart base2

# 查看日志
pm2 logs base2

# 检查dotenv
npm list dotenv

# 测试启动
node index.js
```

---

**状态：** 🚨 紧急  
**优先级：** 最高  
**预计时间：** 2-5分钟  
**日期：** 2024-11-09

**立即执行：**
```bash
cd /var/www/html/knowledge-base-system/client/server
npm install
cd ..
pm2 restart base2
pm2 logs base2
```
