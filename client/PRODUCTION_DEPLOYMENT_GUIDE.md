# 生产环境部署指南

**版本**: 1.0.0  
**更新日期**: 2025-11-08  
**适用环境**: Linux/Windows/macOS

---

## 📋 目录

1. [系统要求](#系统要求)
2. [部署前准备](#部署前准备)
3. [环境配置](#环境配置)
4. [数据库设置](#数据库设置)
5. [应用部署](#应用部署)
6. [反向代理配置](#反向代理配置)
7. [SSL证书配置](#ssl证书配置)
8. [进程管理](#进程管理)
9. [监控和日志](#监控和日志)
10. [备份策略](#备份策略)
11. [故障排查](#故障排查)
12. [安全加固](#安全加固)

---

## 系统要求

### 硬件要求

**最低配置**:
- CPU: 2核
- 内存: 4GB
- 硬盘: 20GB SSD
- 带宽: 5Mbps

**推荐配置**:
- CPU: 4核+
- 内存: 8GB+
- 硬盘: 50GB+ SSD
- 带宽: 10Mbps+

### 软件要求

- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Windows Server 2019+
- **Node.js**: 16.x 或更高版本
- **MongoDB**: 4.4 或更高版本
- **Nginx**: 1.18+ (可选，用于反向代理)
- **PM2**: 最新版本 (进程管理)

---

## 部署前准备

### 1. 创建部署用户

```bash
# Linux
sudo adduser deploy
sudo usermod -aG sudo deploy
su - deploy
```

### 2. 安装 Node.js

```bash
# 使用 nvm 安装
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
node --version
```

### 3. 安装 MongoDB

```bash
# Ubuntu
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 4. 安装 PM2

```bash
npm install -g pm2
pm2 startup
```

### 5. 安装 Nginx

```bash
# Ubuntu
sudo apt-get update
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 环境配置

### 1. 克隆项目

```bash
cd /var/www
sudo mkdir -p myapp
sudo chown deploy:deploy myapp
cd myapp
git clone <your-repo-url> .
```

### 2. 配置环境变量

创建 `server/.env` 文件：

```bash
cd server
cp .env.example .env
nano .env
```

**生产环境配置示例**:

```env
# 环境
NODE_ENV=production

# 服务器配置
PORT=3001
FRONTEND_URL=https://yourdomain.com

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/yourdb
MONGODB_USER=youruser
MONGODB_PASSWORD=your_secure_password

# JWT配置
JWT_SECRET=your_very_long_and_secure_random_string_here_at_least_64_characters
JWT_EXPIRES_IN=7d

# 邮件配置 (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 支付配置 (BEpusdt)
BEPUSDT_URL=https://pay.vpno.eu.org
BEPUSDT_API_KEY=your_api_key
BEPUSDT_MERCHANT_ID=your_merchant_id
BEPUSDT_SECRET_KEY=your_secret_key

# 加密密钥
ENCRYPTION_KEY=your_32_character_encryption_key

# 时区配置
TZ=Asia/Shanghai
DEFAULT_TIMEZONE=Asia/Shanghai

# 日志配置
LOG_LEVEL=info
LOG_FILE=/var/log/myapp/app.log
```

### 3. 安装依赖

```bash
# 后端依赖
cd server
npm install --production

# 前端依赖
cd ..
npm install
```

### 4. 构建前端

```bash
npm run build
```

---

## 数据库设置

### 1. 创建数据库用户

```bash
mongosh
```

```javascript
use admin
db.createUser({
  user: "youruser",
  pwd: "your_secure_password",
  roles: [
    { role: "readWrite", db: "yourdb" },
    { role: "dbAdmin", db: "yourdb" }
  ]
})
```

### 2. 启用认证

编辑 `/etc/mongod.conf`:

```yaml
security:
  authorization: enabled
```

重启 MongoDB:

```bash
sudo systemctl restart mongod
```

### 3. 创建数据库索引

```bash
node server/scripts/createIndexes.js
```

### 4. 初始化管理员账户

```bash
node server/scripts/createAdminSimple.js
```

---

## 应用部署

### 1. 使用 PM2 启动应用

创建 `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'myapp-backend',
    script: './server/index.js',
    cwd: '/var/www/myapp',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/myapp/error.log',
    out_file: '/var/log/myapp/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
```

启动应用:

```bash
pm2 start ecosystem.config.js
pm2 save
```

### 2. 验证应用运行

```bash
pm2 status
pm2 logs myapp-backend
curl http://localhost:3001/health
```

---

## 反向代理配置

### Nginx 配置

创建 `/etc/nginx/sites-available/myapp`:

```nginx
# 后端 API
upstream backend {
    server 127.0.0.1:3001;
    keepalive 64;
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Let's Encrypt 验证
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # 重定向到 HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS 服务器
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # 前端静态文件
    root /var/www/myapp/dist;
    index index.html;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
    
    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 健康检查
    location /health {
        proxy_pass http://backend;
        access_log off;
    }
    
    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

启用配置:

```bash
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL证书配置

### 使用 Let's Encrypt

```bash
# 安装 Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

### 设置自动续期

```bash
sudo crontab -e
```

添加:

```
0 0 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

---

## 进程管理

### PM2 常用命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs myapp-backend
pm2 logs myapp-backend --lines 100

# 重启应用
pm2 restart myapp-backend

# 停止应用
pm2 stop myapp-backend

# 删除应用
pm2 delete myapp-backend

# 监控
pm2 monit

# 保存配置
pm2 save

# 开机自启
pm2 startup
```

### 零停机重启

```bash
pm2 reload myapp-backend
```

---

## 监控和日志

### 1. 日志管理

创建日志目录:

```bash
sudo mkdir -p /var/log/myapp
sudo chown deploy:deploy /var/log/myapp
```

### 2. 日志轮转

创建 `/etc/logrotate.d/myapp`:

```
/var/log/myapp/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 deploy deploy
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 3. 性能监控

安装监控工具:

```bash
npm install -g pm2-logrotate
pm2 install pm2-logrotate
```

### 4. 健康检查脚本

创建 `scripts/healthcheck.sh`:

```bash
#!/bin/bash

HEALTH_URL="http://localhost:3001/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "✓ 应用健康"
    exit 0
else
    echo "✗ 应用异常 (HTTP $RESPONSE)"
    # 发送告警
    # curl -X POST "https://your-alert-webhook.com" -d "应用健康检查失败"
    exit 1
fi
```

设置定时检查:

```bash
chmod +x scripts/healthcheck.sh
crontab -e
```

添加:

```
*/5 * * * * /var/www/myapp/scripts/healthcheck.sh >> /var/log/myapp/healthcheck.log 2>&1
```

---

## 备份策略

### 1. 数据库备份

创建备份脚本 `scripts/backup-db.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="yourdb"

mkdir -p $BACKUP_DIR

mongodump \
  --uri="mongodb://youruser:your_password@localhost:27017/$DB_NAME" \
  --out="$BACKUP_DIR/$DATE"

# 压缩备份
tar -czf "$BACKUP_DIR/$DATE.tar.gz" -C "$BACKUP_DIR" "$DATE"
rm -rf "$BACKUP_DIR/$DATE"

# 删除30天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "✓ 数据库备份完成: $DATE.tar.gz"
```

设置自动备份:

```bash
chmod +x scripts/backup-db.sh
crontab -e
```

添加:

```
0 2 * * * /var/www/myapp/scripts/backup-db.sh >> /var/log/myapp/backup.log 2>&1
```

### 2. 代码备份

```bash
# 创建 Git 标签
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0

# 或创建备份分支
git checkout -b backup/$(date +%Y%m%d)
git push origin backup/$(date +%Y%m%d)
```

---

## 故障排查

### 常见问题

#### 1. 应用无法启动

```bash
# 检查日志
pm2 logs myapp-backend --lines 50

# 检查端口占用
sudo netstat -tulpn | grep 3001

# 检查环境变量
pm2 env 0
```

#### 2. 数据库连接失败

```bash
# 测试数据库连接
mongosh "mongodb://youruser:password@localhost:27017/yourdb"

# 检查 MongoDB 状态
sudo systemctl status mongod

# 查看 MongoDB 日志
sudo tail -f /var/log/mongodb/mongod.log
```

#### 3. Nginx 502 错误

```bash
# 检查后端是否运行
curl http://localhost:3001/health

# 检查 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 测试 Nginx 配置
sudo nginx -t
```

#### 4. 内存不足

```bash
# 查看内存使用
free -h
pm2 monit

# 重启应用释放内存
pm2 reload myapp-backend
```

### 调试模式

```bash
# 启用详细日志
NODE_ENV=production LOG_LEVEL=debug pm2 restart myapp-backend
```

---

## 安全加固

### 1. 防火墙配置

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

### 2. 限制 MongoDB 访问

编辑 `/etc/mongod.conf`:

```yaml
net:
  bindIp: 127.0.0.1
  port: 27017
```

### 3. 定期更新

```bash
# 更新系统
sudo apt-get update
sudo apt-get upgrade -y

# 更新 Node.js 依赖
cd /var/www/myapp/server
npm audit
npm audit fix
```

### 4. 设置速率限制

在应用中已实现，确保配置正确。

### 5. 启用 HTTPS

确保所有流量都通过 HTTPS，禁用 HTTP。

---

## 性能优化

### 1. Node.js 优化

```bash
# 增加内存限制
NODE_OPTIONS="--max-old-space-size=2048" pm2 restart myapp-backend
```

### 2. MongoDB 优化

```javascript
// 创建索引
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ referralCode: 1 })
db.searchHistory.createIndex({ userId: 1, createdAt: -1 })
```

### 3. Nginx 缓存

```nginx
# 在 http 块中添加
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

# 在 location /api/ 中添加
proxy_cache api_cache;
proxy_cache_valid 200 5m;
proxy_cache_key "$scheme$request_method$host$request_uri";
```

---

## 部署检查清单

### 部署前

- [ ] 代码已提交到 Git
- [ ] 环境变量已配置
- [ ] 数据库已设置
- [ ] SSL 证书已获取
- [ ] 备份策略已制定

### 部署中

- [ ] 依赖已安装
- [ ] 前端已构建
- [ ] 应用已启动
- [ ] Nginx 已配置
- [ ] 健康检查通过

### 部署后

- [ ] 功能测试通过
- [ ] 性能测试通过
- [ ] 监控已启用
- [ ] 日志正常记录
- [ ] 备份正常运行

---

## 快速部署命令

```bash
# 一键部署脚本
#!/bin/bash

echo "开始部署..."

# 1. 拉取最新代码
git pull origin main

# 2. 安装依赖
cd server && npm install --production && cd ..
npm install

# 3. 构建前端
npm run build

# 4. 重启应用
pm2 reload myapp-backend

# 5. 验证
sleep 5
curl http://localhost:3001/health

echo "✓ 部署完成！"
```

---

## 联系支持

如有问题，请联系技术支持：
- 邮箱: support@yourdomain.com
- 文档: https://docs.yourdomain.com

---

**最后更新**: 2025-11-08  
**版本**: 1.0.0
