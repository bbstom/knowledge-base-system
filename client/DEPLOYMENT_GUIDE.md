# 部署指南

## 📋 部署前准备

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0
- Web服务器（Nginx/Apache）
- 域名和SSL证书（推荐）

### 后端要求
- 数据库服务器（MySQL/PostgreSQL/MongoDB）
- SMTP邮件服务器
- USDT钱包（用于提现）

---

## 🔧 构建项目

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
创建 `.env.production` 文件：
```env
# API配置
VITE_API_URL=https://api.yourdomain.com

# USDT汇率API
VITE_USDT_RATE_API=https://api.exchangerate.com

# 其他配置
VITE_APP_NAME=InfoSearch Platform
VITE_APP_VERSION=1.0.0
```

### 3. 构建生产版本
```bash
npm run build
```

构建完成后，会在 `dist` 目录生成生产文件。

---

## 🚀 部署到服务器

### 方案一：Nginx部署

#### 1. 上传文件
将 `dist` 目录上传到服务器：
```bash
scp -r dist/* user@server:/var/www/infosearch/
```

#### 2. 配置Nginx
创建配置文件 `/etc/nginx/sites-available/infosearch`：
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL证书配置
    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;
    
    # SSL优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # 网站根目录
    root /var/www/infosearch;
    index index.html;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;
    
    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA路由配置
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API代理（如果需要）
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 3. 启用配置
```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/infosearch /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 方案二：Apache部署

#### 1. 上传文件
```bash
scp -r dist/* user@server:/var/www/html/infosearch/
```

#### 2. 配置Apache
创建配置文件 `/etc/apache2/sites-available/infosearch.conf`：
```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    
    # 重定向到HTTPS
    Redirect permanent / https://yourdomain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    
    DocumentRoot /var/www/html/infosearch
    
    # SSL配置
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/yourdomain.crt
    SSLCertificateKeyFile /etc/ssl/private/yourdomain.key
    
    # 启用压缩
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
    </IfModule>
    
    # 缓存配置
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType image/jpg "access plus 1 year"
        ExpiresByType image/jpeg "access plus 1 year"
        ExpiresByType image/gif "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
        ExpiresByType text/css "access plus 1 month"
        ExpiresByType application/javascript "access plus 1 month"
    </IfModule>
    
    # SPA路由配置
    <Directory /var/www/html/infosearch>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Rewrite规则
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

#### 3. 启用配置
```bash
# 启用必要的模块
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod expires
sudo a2enmod deflate

# 启用站点
sudo a2ensite infosearch

# 重启Apache
sudo systemctl restart apache2
```

### 方案三：Docker部署

#### 1. 创建Dockerfile
```dockerfile
# 构建阶段
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制构建文件
COPY --from=build /app/dist /usr/share/nginx/html

# 复制Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 2. 创建nginx.conf
```nginx
server {
    listen 80;
    server_name localhost;
    
    root /usr/share/nginx/html;
    index index.html;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 3. 构建和运行
```bash
# 构建镜像
docker build -t infosearch-platform .

# 运行容器
docker run -d -p 80:80 --name infosearch infosearch-platform
```

#### 4. 使用Docker Compose
创建 `docker-compose.yml`：
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "80:80"
    restart: always
    environment:
      - NODE_ENV=production
```

运行：
```bash
docker-compose up -d
```

---

## 🔒 SSL证书配置

### 使用Let's Encrypt（免费）

#### 1. 安装Certbot
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

#### 2. 获取证书
```bash
# Nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Apache
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com
```

#### 3. 自动续期
```bash
# 测试续期
sudo certbot renew --dry-run

# 添加定时任务
sudo crontab -e
# 添加以下行（每天凌晨2点检查）
0 2 * * * certbot renew --quiet
```

---

## 🗄️ 后端API部署

### Node.js后端示例

#### 1. 项目结构
```
server/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── app.js
├── package.json
└── .env
```

#### 2. 使用PM2管理
```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start src/app.js --name infosearch-api

# 设置开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs infosearch-api

# 重启应用
pm2 restart infosearch-api
```

#### 3. Nginx反向代理
```nginx
location /api {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

---

## 📊 数据库部署

### MySQL配置

#### 1. 安装MySQL
```bash
sudo apt-get install mysql-server
```

#### 2. 创建数据库
```sql
CREATE DATABASE infosearch CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'infosearch'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON infosearch.* TO 'infosearch'@'localhost';
FLUSH PRIVILEGES;
```

#### 3. 导入数据
```bash
mysql -u infosearch -p infosearch < database.sql
```

### MongoDB配置

#### 1. 安装MongoDB
```bash
sudo apt-get install mongodb
```

#### 2. 创建数据库和用户
```javascript
use infosearch
db.createUser({
  user: "infosearch",
  pwd: "your_password",
  roles: [{ role: "readWrite", db: "infosearch" }]
})
```

---

## 📧 邮件服务配置

### 使用SMTP服务

#### Gmail配置
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=InfoSearch <noreply@yourdomain.com>
```

#### 阿里云邮件推送
```env
SMTP_HOST=smtpdm.aliyun.com
SMTP_PORT=465
SMTP_USER=your-username
SMTP_PASS=your-password
SMTP_FROM=InfoSearch <noreply@yourdomain.com>
```

---

## 🔐 安全配置

### 1. 防火墙配置
```bash
# 允许HTTP和HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 允许SSH
sudo ufw allow 22/tcp

# 启用防火墙
sudo ufw enable
```

### 2. 安全头配置（Nginx）
```nginx
# 添加到server块
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### 3. 限流配置
```nginx
# 在http块中
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

# 在location块中
location /api {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://localhost:3000;
}
```

---

## 📈 性能优化

### 1. 启用HTTP/2
```nginx
listen 443 ssl http2;
```

### 2. 启用Brotli压缩
```nginx
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### 3. CDN配置
使用CDN加速静态资源：
- Cloudflare
- 阿里云CDN
- 腾讯云CDN

---

## 🔍 监控和日志

### 1. 日志配置
```nginx
# 访问日志
access_log /var/log/nginx/infosearch-access.log;

# 错误日志
error_log /var/log/nginx/infosearch-error.log;
```

### 2. 日志分析
```bash
# 查看访问量
cat /var/log/nginx/infosearch-access.log | wc -l

# 查看错误
tail -f /var/log/nginx/infosearch-error.log
```

### 3. 监控工具
- PM2监控：`pm2 monit`
- Nginx状态：`nginx -t`
- 系统资源：`htop`

---

## 🔄 更新部署

### 1. 备份当前版本
```bash
cp -r /var/www/infosearch /var/www/infosearch-backup-$(date +%Y%m%d)
```

### 2. 部署新版本
```bash
# 构建新版本
npm run build

# 上传到服务器
scp -r dist/* user@server:/var/www/infosearch/

# 重启服务（如果需要）
sudo systemctl restart nginx
```

### 3. 回滚（如果需要）
```bash
rm -rf /var/www/infosearch
mv /var/www/infosearch-backup-20241019 /var/www/infosearch
sudo systemctl restart nginx
```

---

## ✅ 部署检查清单

### 部署前
- [ ] 代码已测试
- [ ] 环境变量已配置
- [ ] 数据库已准备
- [ ] SSL证书已获取
- [ ] 域名已解析

### 部署中
- [ ] 文件已上传
- [ ] 服务器已配置
- [ ] 数据库已连接
- [ ] 邮件服务已配置
- [ ] 防火墙已设置

### 部署后
- [ ] 网站可访问
- [ ] HTTPS正常
- [ ] API正常
- [ ] 邮件发送正常
- [ ] 日志正常
- [ ] 性能正常

---

## 🚨 故障排查

### 网站无法访问
1. 检查Nginx状态：`sudo systemctl status nginx`
2. 检查端口占用：`sudo netstat -tlnp | grep :80`
3. 检查防火墙：`sudo ufw status`
4. 查看错误日志：`tail -f /var/log/nginx/error.log`

### API请求失败
1. 检查后端服务：`pm2 status`
2. 查看后端日志：`pm2 logs`
3. 检查数据库连接
4. 检查Nginx代理配置

### SSL证书问题
1. 检查证书有效期：`openssl x509 -in cert.pem -noout -dates`
2. 测试SSL配置：`openssl s_client -connect yourdomain.com:443`
3. 续期证书：`sudo certbot renew`

---

## 📞 技术支持

如遇到部署问题，请联系：
- 技术支持：tech@infosearch.com
- 文档：查看项目文档

---

**最后更新：** 2024-10-19  
**版本：** 1.0.0
