# 前后端分离部署指南

## 架构概述

```
┌─────────────────┐         ┌─────────────────┐
│  前端服务器      │         │  后端服务器      │
│  (Server A)     │ ◄─────► │  (Server B)     │
│                 │  HTTPS  │                 │
│  Nginx          │         │  Node.js        │
│  React Build    │         │  Express API    │
│  Port: 80/443   │         │  Port: 3001     │
└─────────────────┘         └─────────────────┘
     ↓                            ↓
  用户访问                    MongoDB
```

## 一、后端服务器配置（Server B）

### 1. 环境准备

```bash
# 安装Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装MongoDB
# 参考MongoDB官方文档

# 安装PM2
sudo npm install -g pm2
```

### 2. 部署后端代码

```bash
# 创建项目目录
mkdir -p /www/wwwroot/api
cd /www/wwwroot/api

# 上传或克隆代码
git clone <your-repo> .
# 或使用scp上传

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
nano .env
```

### 3. 配置环境变量 (.env)

```env
# 服务器配置
PORT=3001
NODE_ENV=production

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/knowledge-base
MONGODB_QUERY_URI=mongodb://localhost:27017/query-database

# JWT密钥
JWT_SECRET=your-super-secret-key-change-this

# CORS配置（重要！）
CORS_ORIGIN=https://your-frontend-domain.com

# 其他配置...
```

### 4. 配置CORS

编辑 `server/index.js`：

```javascript
const cors = require('cors');

// CORS配置
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'https://your-frontend-domain.com',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 5. 启动后端服务

```bash
# 使用PM2启动
pm2 start server/index.js --name "api-server"

# 设置开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs api-server
```

### 6. 配置防火墙

```bash
# 开放API端口（如果需要外部访问）
sudo ufw allow 3001/tcp

# 或者只允许前端服务器IP访问
sudo ufw allow from <frontend-server-ip> to any port 3001
```

### 7. 配置Nginx反向代理（可选但推荐）

```nginx
# /etc/nginx/sites-available/api
server {
    listen 80;
    server_name api.yourdomain.com;

    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL证书配置
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 反向代理到Node.js
    location / {
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
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 二、前端服务器配置（Server A）

### 1. 环境准备

```bash
# 安装Nginx
sudo apt-get update
sudo apt-get install -y nginx

# 安装Node.js（用于构建）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. 构建前端代码

#### 方式1：在本地构建后上传

```bash
# 在本地开发机器上
cd client

# 配置API地址
echo "VITE_API_URL=https://api.yourdomain.com" > .env.production

# 构建
npm run build

# 上传dist目录到服务器
scp -r dist/* user@frontend-server:/www/wwwroot/frontend/
```

#### 方式2：在服务器上构建

```bash
# 在前端服务器上
mkdir -p /www/wwwroot/frontend
cd /www/wwwroot/frontend

# 上传源代码
git clone <your-repo> .

# 配置环境变量
echo "VITE_API_URL=https://api.yourdomain.com" > .env.production

# 安装依赖并构建
cd client
npm install
npm run build

# 移动构建文件
mv dist/* /www/wwwroot/frontend/
```

### 3. 配置前端环境变量

创建 `client/.env.production`：

```env
# API地址（重要！）
VITE_API_URL=https://api.yourdomain.com

# 或者使用IP地址
# VITE_API_URL=http://backend-server-ip:3001
```

### 4. 修改API请求配置

编辑 `client/src/utils/api.ts` 或相关文件：

```typescript
// 使用环境变量
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// 或者直接配置
const API_BASE_URL = 'https://api.yourdomain.com';

// API请求函数
const api = {
  get: async (url: string) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      credentials: 'include', // 重要：发送cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
  // ... 其他方法
};
```

### 5. 配置Nginx

```nginx
# /etc/nginx/sites-available/frontend
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
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 网站根目录
    root /www/wwwroot/frontend;
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

    # API代理（可选，如果不想暴露后端地址）
    location /api {
        proxy_pass https://api.yourdomain.com;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 三、关键配置点

### 1. CORS配置（后端）

```javascript
// server/index.js
const cors = require('cors');

const corsOptions = {
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    // 开发环境
    'http://localhost:5173',
  ],
  credentials: true, // 允许发送cookies
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 2. Cookie配置（后端）

```javascript
// 设置cookie时
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS环境
  sameSite: 'none', // 跨域时必须设置
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
  domain: '.yourdomain.com' // 允许子域名访问
});
```

### 3. API请求配置（前端）

```typescript
// 所有API请求都要包含credentials
fetch(url, {
  credentials: 'include', // 重要！
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 4. 环境变量配置

**后端 (.env)**:
```env
CORS_ORIGIN=https://yourdomain.com
COOKIE_DOMAIN=.yourdomain.com
NODE_ENV=production
```

**前端 (.env.production)**:
```env
VITE_API_URL=https://api.yourdomain.com
```

## 四、SSL证书配置

### 使用Let's Encrypt（免费）

```bash
# 安装certbot
sudo apt-get install certbot python3-certbot-nginx

# 为前端域名申请证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 为后端API域名申请证书
sudo certbot --nginx -d api.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

## 五、部署流程

### 完整部署步骤

```bash
# ===== 后端服务器 =====
# 1. 部署后端代码
cd /www/wwwroot/api
git pull origin main
npm install
pm2 restart api-server

# ===== 前端服务器 =====
# 2. 构建前端（在本地或前端服务器）
cd client
npm install
npm run build

# 3. 上传到前端服务器
scp -r dist/* user@frontend-server:/www/wwwroot/frontend/

# 4. 重启Nginx
sudo systemctl reload nginx
```

## 六、测试验证

### 1. 测试后端API

```bash
# 测试健康检查
curl https://api.yourdomain.com/health

# 测试CORS
curl -H "Origin: https://yourdomain.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.yourdomain.com/api/auth/login
```

### 2. 测试前端

```bash
# 访问前端
curl https://yourdomain.com

# 检查API请求
# 在浏览器开发者工具中查看Network标签
```

### 3. 检查Cookie

在浏览器开发者工具 → Application → Cookies 中检查：
- Cookie是否正确设置
- Domain是否正确
- Secure和SameSite属性是否正确

## 七、常见问题

### 1. CORS错误

**问题**: `Access-Control-Allow-Origin` 错误

**解决**:
```javascript
// 后端确保CORS配置正确
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

### 2. Cookie不发送

**问题**: 请求不携带Cookie

**解决**:
```typescript
// 前端所有请求添加credentials
fetch(url, {
  credentials: 'include'
});
```

### 3. 跨域Cookie问题

**问题**: Cookie在跨域时不工作

**解决**:
```javascript
// 后端设置Cookie时
res.cookie('token', token, {
  sameSite: 'none',
  secure: true,
  domain: '.yourdomain.com'
});
```

### 4. API请求404

**问题**: 前端请求API返回404

**解决**:
- 检查 `VITE_API_URL` 配置
- 检查后端服务是否运行
- 检查防火墙规则

## 八、监控和日志

### 后端日志

```bash
# PM2日志
pm2 logs api-server

# Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 前端日志

```bash
# Nginx访问日志
sudo tail -f /var/log/nginx/access.log
```

## 九、安全建议

1. **使用HTTPS**: 所有生产环境必须使用HTTPS
2. **配置防火墙**: 只开放必要的端口
3. **定期更新**: 及时更新依赖和系统
4. **备份数据**: 定期备份数据库
5. **监控服务**: 使用监控工具（如PM2、Prometheus）
6. **限流保护**: 配置Nginx限流
7. **隐藏版本**: 隐藏服务器和框架版本信息

## 十、快速配置清单

### 后端服务器
- [ ] 安装Node.js 20+
- [ ] 安装MongoDB
- [ ] 配置.env文件
- [ ] 配置CORS
- [ ] 启动PM2服务
- [ ] 配置Nginx反向代理
- [ ] 申请SSL证书
- [ ] 配置防火墙

### 前端服务器
- [ ] 安装Nginx
- [ ] 配置.env.production
- [ ] 构建前端代码
- [ ] 配置Nginx
- [ ] 申请SSL证书
- [ ] 测试API连接

### 验证
- [ ] 前端可以访问
- [ ] API请求成功
- [ ] Cookie正常工作
- [ ] HTTPS正常
- [ ] 跨域请求正常

## 总结

前后端分离部署的关键点：
1. **CORS配置**：后端正确配置允许的源
2. **Cookie配置**：设置正确的domain和sameSite
3. **API地址**：前端正确配置后端API地址
4. **HTTPS**：生产环境必须使用HTTPS
5. **credentials**：前端请求必须包含credentials: 'include'

按照以上步骤配置，前后端即可正常通信！
