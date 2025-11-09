# 🚀 从 GitHub 部署到生产服务器

## 📋 前提条件

### 服务器要求
- **操作系统**: Linux (Ubuntu 20.04+ / CentOS 7+)
- **Node.js**: >= 16.0.0
- **MongoDB**: >= 4.4
- **内存**: >= 2GB
- **磁盘**: >= 20GB

### 需要安装的软件
- Git
- Node.js 和 npm
- MongoDB
- PM2 (进程管理器)
- Nginx (可选，用于反向代理)

---

## 🔧 步骤 1: 准备服务器环境

### 1.1 连接到服务器

```bash
# 使用 SSH 连接
ssh root@your-server-ip

# 或使用密钥
ssh -i /path/to/key.pem user@your-server-ip
```

### 1.2 更新系统

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 1.3 安装 Node.js

```bash
# 使用 NodeSource 安装 Node.js 16.x
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node -v
npm -v
```

### 1.4 安装 MongoDB

```bash
# Ubuntu 20.04
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
sudo apt update
sudo apt install -y mongodb-org

# 启动 MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# 验证
sudo systemctl status mongod
```

### 1.5 安装 PM2

```bash
sudo npm install -g pm2

# 验证
pm2 -v
```

### 1.6 安装 Git

```bash
sudo apt install -y git

# 验证
git --version
```

---

## 📥 步骤 2: 从 GitHub 克隆项目

### 2.1 创建项目目录

```bash
# 创建应用目录
sudo mkdir -p /var/www
cd /var/www
```

### 2.2 克隆仓库

```bash
# 公开仓库
sudo git clone https://github.com/YOUR_USERNAME/knowledge-base-system.git

# 私有仓库（需要认证）
sudo git clone https://YOUR_USERNAME:YOUR_TOKEN@github.com/YOUR_USERNAME/knowledge-base-system.git

# 进入项目目录
cd knowledge-base-system
```

### 2.3 设置权限

```bash
# 设置目录所有者
sudo chown -R $USER:$USER /var/www/knowledge-base-system
```

---

## ⚙️ 步骤 3: 配置项目

### 3.1 安装依赖

```bash
# 安装后端依赖
cd /var/www/knowledge-base-system/server
npm install

# 返回根目录
cd /var/www/knowledge-base-system
```

### 3.2 配置环境变量

```bash
# 复制环境变量模板
cp server/.env.example server/.env

# 编辑环境变量
nano server/.env
```

**重要配置项**：

```env
# 服务器配置
PORT=3001
NODE_ENV=production

# 数据库配置
MONGO_URI=mongodb://localhost:27017/knowledge-base

# JWT 配置
JWT_SECRET=your-production-secret-key-change-this
JWT_EXPIRES_IN=7d

# 邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 网站配置
SITE_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

按 `Ctrl + X`，然后 `Y`，再按 `Enter` 保存。

### 3.3 构建前端

```bash
# 安装前端依赖
npm install

# 构建前端
npm run build
```

构建完成后，前端文件会在 `dist/` 目录中。

---

## 🗄️ 步骤 4: 配置 MongoDB

### 4.1 创建数据库用户（推荐）

```bash
# 连接到 MongoDB
mongosh

# 切换到 admin 数据库
use admin

# 创建管理员用户
db.createUser({
  user: "admin",
  pwd: "your-strong-password",
  roles: ["root"]
})

# 创建应用数据库用户
use knowledge-base
db.createUser({
  user: "kbuser",
  pwd: "your-app-password",
  roles: ["readWrite"]
})

# 退出
exit
```

### 4.2 启用 MongoDB 认证

```bash
# 编辑 MongoDB 配置
sudo nano /etc/mongod.conf

# 添加或修改以下内容：
security:
  authorization: enabled

# 重启 MongoDB
sudo systemctl restart mongod
```

### 4.3 更新 .env 文件

```bash
nano server/.env

# 更新 MONGO_URI
MONGO_URI=mongodb://kbuser:your-app-password@localhost:27017/knowledge-base?authSource=knowledge-base
```

---

## 🚀 步骤 5: 启动应用

### 5.1 创建管理员账号

```bash
cd /var/www/knowledge-base-system/server
node scripts/createAdminSimple.js
```

按提示输入管理员信息。

### 5.2 使用 PM2 启动

```bash
# 启动应用
pm2 start server/index.js --name "knowledge-base"

# 查看状态
pm2 status

# 查看日志
pm2 logs knowledge-base

# 设置开机自启
pm2 startup
pm2 save
```

### 5.3 验证应用运行

```bash
# 检查应用是否运行
curl http://localhost:3001/api/health

# 应该返回类似：{"status":"ok"}
```

---

## 🌐 步骤 6: 配置 Nginx（推荐）

### 6.1 安装 Nginx

```bash
sudo apt install -y nginx
```

### 6.2 配置 Nginx

```bash
# 创建配置文件
sudo nano /etc/nginx/sites-available/knowledge-base
```

**配置内容**：

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # 前端静态文件
    location / {
        root /var/www/knowledge-base-system/dist;
        try_files $uri $uri/ /index.html;
        
        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 上传文件大小限制
    client_max_body_size 10M;
}
```

### 6.3 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/knowledge-base /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🔒 步骤 7: 配置 SSL（HTTPS）

### 7.1 安装 Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 获取 SSL 证书

```bash
# 自动配置 SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 按提示输入邮箱和同意条款
```

### 7.3 自动续期

```bash
# 测试自动续期
sudo certbot renew --dry-run

# Certbot 会自动设置 cron 任务
```

---

## 🔥 步骤 8: 配置防火墙

```bash
# 允许 SSH
sudo ufw allow ssh

# 允许 HTTP 和 HTTPS
sudo ufw allow 'Nginx Full'

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

---

## 📊 步骤 9: 监控和维护

### 9.1 PM2 监控

```bash
# 查看应用状态
pm2 status

# 查看实时日志
pm2 logs knowledge-base

# 查看资源使用
pm2 monit

# 重启应用
pm2 restart knowledge-base

# 停止应用
pm2 stop knowledge-base
```

### 9.2 查看日志

```bash
# PM2 日志
pm2 logs knowledge-base --lines 100

# Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# MongoDB 日志
sudo tail -f /var/log/mongodb/mongod.log
```

### 9.3 备份数据库

```bash
# 创建备份脚本
nano /var/www/knowledge-base-system/backup.sh
```

**备份脚本内容**：

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

mongodump --uri="mongodb://kbuser:your-app-password@localhost:27017/knowledge-base?authSource=knowledge-base" --out="$BACKUP_DIR/backup_$DATE"

# 保留最近 7 天的备份
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +

echo "Backup completed: $BACKUP_DIR/backup_$DATE"
```

```bash
# 设置执行权限
chmod +x /var/www/knowledge-base-system/backup.sh

# 添加到 crontab（每天凌晨 2 点备份）
crontab -e

# 添加以下行：
0 2 * * * /var/www/knowledge-base-system/backup.sh >> /var/log/mongodb-backup.log 2>&1
```

---

## 🔄 步骤 10: 更新应用

### 10.1 从 GitHub 拉取更新

```bash
cd /var/www/knowledge-base-system

# 拉取最新代码
git pull origin main

# 安装新依赖
cd server && npm install
cd .. && npm install

# 重新构建前端
npm run build

# 重启应用
pm2 restart knowledge-base
```

### 10.2 自动化更新脚本

```bash
# 创建更新脚本
nano /var/www/knowledge-base-system/update.sh
```

**更新脚本内容**：

```bash
#!/bin/bash
cd /var/www/knowledge-base-system

echo "Pulling latest code..."
git pull origin main

echo "Installing dependencies..."
cd server && npm install
cd .. && npm install

echo "Building frontend..."
npm run build

echo "Restarting application..."
pm2 restart knowledge-base

echo "Update completed!"
pm2 status
```

```bash
# 设置执行权限
chmod +x /var/www/knowledge-base-system/update.sh

# 运行更新
./update.sh
```

---

## ✅ 验证部署

### 检查清单

- [ ] 服务器可以通过域名访问
- [ ] HTTPS 正常工作
- [ ] 前端页面正常显示
- [ ] API 接口正常响应
- [ ] 可以注册和登录
- [ ] 管理后台可以访问
- [ ] 数据库连接正常
- [ ] PM2 进程运行正常
- [ ] 日志记录正常

### 测试命令

```bash
# 测试前端
curl https://yourdomain.com

# 测试 API
curl https://yourdomain.com/api/health

# 检查 PM2 状态
pm2 status

# 检查 Nginx 状态
sudo systemctl status nginx

# 检查 MongoDB 状态
sudo systemctl status mongod
```

---

## 🐛 常见问题

### 问题 1: 端口被占用

```bash
# 查看端口占用
sudo lsof -i :3001

# 杀死进程
sudo kill -9 PID
```

### 问题 2: MongoDB 连接失败

```bash
# 检查 MongoDB 状态
sudo systemctl status mongod

# 查看日志
sudo tail -f /var/log/mongodb/mongod.log

# 重启 MongoDB
sudo systemctl restart mongod
```

### 问题 3: Nginx 配置错误

```bash
# 测试配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

### 问题 4: PM2 进程崩溃

```bash
# 查看日志
pm2 logs knowledge-base --err

# 重启进程
pm2 restart knowledge-base

# 删除并重新启动
pm2 delete knowledge-base
pm2 start server/index.js --name "knowledge-base"
```

---

## 📞 获取帮助

- **项目文档**: 查看 `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **GitHub Issues**: 报告问题
- **日志文件**: 检查应用和系统日志

---

**🎉 恭喜！你的应用已成功部署到生产服务器！**

记得定期备份数据和更新系统！
