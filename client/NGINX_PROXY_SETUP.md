# 🚀 Nginx反向代理配置 - 隐藏后端地址

## 📋 架构说明

```
用户浏览器
    ↓
https://www.13140.sbs (前端域名)
    ↓
Nginx (前端服务器)
    ├─ / → 静态文件 (前端)
    └─ /api/* → 反向代理到后端
           ↓
    https://api.anyconnects.eu.org (后端 - 用户看不到)
```

**优势**：
- ✅ 用户只看到前端域名
- ✅ 后端地址完全隐藏
- ✅ 自动处理CORS问题
- ✅ 统一域名，Cookie自动工作

---

## 🔧 配置步骤

### 1️⃣ 前端Nginx配置

SSH到前端服务器：
```bash
ssh root@www.13140.sbs
```

编辑Nginx配置：
```bash
nano /etc/nginx/sites-available/frontend
# 或
nano /etc/nginx/conf.d/frontend.conf
```

**完整配置**：
```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name www.13140.sbs;

    # SSL证书配置
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    # 前端静态文件
    root /www/wwwroot/frontend;
    index index.html;

    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 前端路由 - 所有非API请求返回index.html
    location / {
        try_files $uri $uri/ /index.html;
        
        # 缓存控制
        add_header Cache-Control "no-cache, must-revalidate";
    }

    # API反向代理 - 关键配置！
    location /api/ {
        # 代理到后端服务器
        proxy_pass https://api.anyconnects.eu.org/api/;
        
        # 保持原始请求头
        proxy_set_header Host api.anyconnects.eu.org;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cookie支持
        proxy_set_header Cookie $http_cookie;
        proxy_pass_header Set-Cookie;
        
        # WebSocket支持（如果需要）
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 禁用缓存
        proxy_buffering off;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name www.13140.sbs;
    return 301 https://$server_name$request_uri;
}
```

**测试并重载Nginx**：
```bash
# 测试配置
nginx -t

# 重载配置
systemctl reload nginx
# 或
nginx -s reload
```

---

### 2️⃣ 后端服务器配置（保持不变）

后端服务器 `api.anyconnects.eu.org` 保持现有配置，**不需要修改**。

确保后端CORS配置允许前端域名：
```javascript
// server/index.js 或类似文件
app.use(cors({
  origin: [
    'https://www.13140.sbs',
    'http://localhost:5173'  // 开发环境
  ],
  credentials: true
}));
```

---

### 3️⃣ 前端代码（已配置完成）

当前配置已经正确：
```typescript
// src/utils/realApi.ts 和 adminApi.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

**开发环境配置**（可选）：

创建 `.env.development`：
```env
# 开发环境直接访问后端
VITE_API_URL=https://api.anyconnects.eu.org/api
```

创建 `.env.production`：
```env
# 生产环境使用相对路径（通过Nginx代理）
VITE_API_URL=/api
```

---

### 4️⃣ 重新构建前端

```bash
# 在本地开发机器上
npm run build

# 验证构建文件
grep -r "api.anyconnects.eu.org" dist/
# 应该没有输出（生产环境不应包含后端地址）

# 打包上传
tar -czf frontend-proxy.tar.gz dist/
scp frontend-proxy.tar.gz root@www.13140.sbs:/tmp/
```

---

### 5️⃣ 部署到前端服务器

```bash
# SSH到前端服务器
ssh root@www.13140.sbs

# 解压并部署
cd /tmp
tar -xzf frontend-proxy.tar.gz
rm -rf /www/wwwroot/frontend/*
cp -r dist/* /www/wwwroot/frontend/
rm -rf dist frontend-proxy.tar.gz

# 重载Nginx
systemctl reload nginx
```

---

## ✅ 验证部署

### 1. 清除浏览器缓存
- 按 `Ctrl + Shift + Delete`
- 或使用无痕模式

### 2. 访问网站
打开 `https://www.13140.sbs`

### 3. 检查网络请求（F12 → Network）
✅ **正确的请求**：
```
https://www.13140.sbs/api/auth/login
https://www.13140.sbs/api/user/profile
https://www.13140.sbs/api/search
```

❌ **错误的请求**（不应该出现）：
```
https://api.anyconnects.eu.org/api/...
```

### 4. 测试功能
- 登录/注册
- 搜索功能
- 用户资料
- 充值记录

---

## 🔍 故障排查

### 问题1：API请求404
**原因**：Nginx代理配置错误

**检查**：
```bash
# 查看Nginx错误日志
tail -f /var/log/nginx/error.log

# 测试代理
curl -I https://www.13140.sbs/api/auth/me
```

**解决**：确保 `proxy_pass` 末尾有 `/api/`

### 问题2：CORS错误
**原因**：后端未允许前端域名

**解决**：在后端添加CORS配置
```javascript
origin: ['https://www.13140.sbs']
```

### 问题3：Cookie不工作
**原因**：Cookie域名不匹配

**检查**：
```bash
# 查看响应头
curl -I https://www.13140.sbs/api/auth/login
```

**解决**：确保Nginx配置包含：
```nginx
proxy_set_header Cookie $http_cookie;
proxy_pass_header Set-Cookie;
```

### 问题4：请求超时
**原因**：后端响应慢或网络问题

**解决**：增加超时时间
```nginx
proxy_connect_timeout 120s;
proxy_read_timeout 120s;
```

---

## 📊 性能优化（可选）

### 1. 启用缓存
```nginx
# 在 location /api/ 外添加
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    add_header X-Cache-Status $upstream_cache_status;
    # ... 其他配置
}
```

### 2. 限流保护
```nginx
# 在 http 块中
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# 在 location /api/ 中
limit_req zone=api_limit burst=20 nodelay;
```

---

## 🎯 总结

配置完成后：
1. ✅ 用户只看到 `www.13140.sbs`
2. ✅ 后端地址 `api.anyconnects.eu.org` 完全隐藏
3. ✅ 所有API请求通过Nginx代理
4. ✅ 无CORS问题
5. ✅ Cookie自动工作

**下一步**：按照上述步骤配置Nginx并重新部署前端！
