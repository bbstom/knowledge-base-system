# ✅ 部署检查清单 - Nginx反向代理模式

## 📋 部署前检查

### 1. 后端配置 ✅
- [x] CORS配置已添加前端域名 `https://www.13140.sbs`
- [ ] 后端服务正常运行
- [ ] 后端API可访问（测试 `https://api.anyconnects.eu.org/health`）
- [ ] 数据库连接正常

### 2. 前端配置 ✅
- [x] API配置使用相对路径 `/api`
- [ ] 环境变量配置正确（`.env.production`）
- [ ] 构建成功（`npm run build`）
- [ ] 构建文件不包含后端域名

### 3. 前端服务器Nginx配置 ⚠️
- [ ] 已添加 `/api/` 反向代理配置
- [ ] 代理目标正确：`https://api.anyconnects.eu.org/api/`
- [ ] 已配置必要的代理头（Host, X-Real-IP等）
- [ ] 已配置Cookie支持
- [ ] Nginx配置测试通过（`nginx -t`）
- [ ] Nginx已重载（`systemctl reload nginx`）

---

## 🚀 部署步骤

### 方式1：使用自动脚本（推荐）

```bash
# 给脚本执行权限
chmod +x deploy-with-proxy.sh

# 运行部署脚本
./deploy-with-proxy.sh
```

### 方式2：手动部署

#### 步骤1：构建前端
```bash
# 创建生产环境配置
cat > .env.production << EOF
VITE_API_URL=/api
NODE_ENV=production
EOF

# 构建
npm run build

# 验证（不应该有输出）
grep -r "api.anyconnects.eu.org" dist/
```

#### 步骤2：上传前端
```bash
# 打包
tar -czf frontend-proxy.tar.gz dist/

# 上传
scp frontend-proxy.tar.gz root@www.13140.sbs:/tmp/
```

#### 步骤3：部署前端
```bash
# SSH到前端服务器
ssh root@www.13140.sbs

# 解压
cd /tmp
tar -xzf frontend-proxy.tar.gz

# 备份旧文件
mv /www/wwwroot/frontend /www/wwwroot/frontend.backup.$(date +%Y%m%d_%H%M%S)

# 部署
mkdir -p /www/wwwroot/frontend
cp -r dist/* /www/wwwroot/frontend/

# 设置权限
chown -R www-data:www-data /www/wwwroot/frontend
chmod -R 755 /www/wwwroot/frontend

# 清理
rm -rf dist frontend-proxy.tar.gz
```

#### 步骤4：配置Nginx
```bash
# 编辑Nginx配置
nano /etc/nginx/sites-available/frontend
# 或
nano /etc/nginx/conf.d/frontend.conf
```

添加以下配置：
```nginx
server {
    listen 443 ssl http2;
    server_name www.13140.sbs;

    # SSL配置
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 前端静态文件
    root /www/wwwroot/frontend;
    index index.html;

    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API反向代理 - 关键配置！
    location /api/ {
        proxy_pass https://api.anyconnects.eu.org/api/;
        proxy_set_header Host api.anyconnects.eu.org;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Cookie $http_cookie;
        proxy_pass_header Set-Cookie;
        proxy_http_version 1.1;
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

测试并重载：
```bash
# 测试配置
nginx -t

# 重载
systemctl reload nginx
```

#### 步骤5：更新后端（如果需要）
```bash
# 在本地
tar -czf backend-update.tar.gz \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    server/ package.json

scp backend-update.tar.gz root@api.anyconnects.eu.org:/tmp/

# SSH到后端服务器
ssh root@api.anyconnects.eu.org

cd /tmp
tar -xzf backend-update.tar.gz

# 更新代码
cp -r server/* /www/wwwroot/backend/server/
cp package*.json /www/wwwroot/backend/

# 安装依赖
cd /www/wwwroot/backend
npm install --production

# 重启服务
pm2 restart backend
# 或
systemctl restart backend
```

---

## ✅ 部署后验证

### 1. 清除浏览器缓存
- 按 `Ctrl + Shift + Delete`
- 或使用无痕模式（Ctrl + Shift + N）

### 2. 访问网站
打开 `https://www.13140.sbs`

### 3. 检查网络请求（F12 → Network）

**✅ 正确的请求**：
```
https://www.13140.sbs/api/auth/login
https://www.13140.sbs/api/user/profile
https://www.13140.sbs/api/search
```

**❌ 错误的请求**（不应该出现）：
```
https://api.anyconnects.eu.org/api/...
```

### 4. 测试功能
- [ ] 登录功能正常
- [ ] 注册功能正常
- [ ] 搜索功能正常
- [ ] 用户资料加载正常
- [ ] 充值记录显示正常
- [ ] Cookie/Session正常工作

### 5. 检查响应头
```bash
# 测试API代理
curl -I https://www.13140.sbs/api/auth/me

# 应该返回200或401（未登录）
# 不应该返回404或502
```

---

## 🔍 故障排查

### 问题1：API请求404
**症状**：所有API请求返回404

**原因**：Nginx代理配置错误

**解决**：
```bash
# 检查Nginx配置
nginx -t

# 查看错误日志
tail -f /var/log/nginx/error.log

# 确保proxy_pass末尾有 /api/
location /api/ {
    proxy_pass https://api.anyconnects.eu.org/api/;  # 注意末尾的 /api/
}
```

### 问题2：API请求502 Bad Gateway
**症状**：API请求返回502

**原因**：后端服务未运行或无法访问

**解决**：
```bash
# 检查后端服务
ssh root@api.anyconnects.eu.org
pm2 status
# 或
systemctl status backend

# 测试后端直接访问
curl https://api.anyconnects.eu.org/health

# 检查防火墙
ufw status
```

### 问题3：CORS错误
**症状**：浏览器控制台显示CORS错误

**原因**：后端CORS配置未包含前端域名

**解决**：
确保后端 `server/index.js` 包含：
```javascript
const allowedOrigins = [
  'https://www.13140.sbs',
  // ... 其他域名
];
```

重启后端服务：
```bash
pm2 restart backend
```

### 问题4：Cookie不工作
**症状**：登录后刷新页面又退出

**原因**：Cookie配置问题

**解决**：
确保Nginx配置包含：
```nginx
proxy_set_header Cookie $http_cookie;
proxy_pass_header Set-Cookie;
```

### 问题5：静态资源404
**症状**：页面加载但样式丢失

**原因**：静态文件路径错误

**解决**：
```bash
# 检查文件权限
ls -la /www/wwwroot/frontend/

# 确保Nginx配置正确
location / {
    try_files $uri $uri/ /index.html;
}
```

### 问题6：仍然看到旧域名
**症状**：Network标签显示旧的后端域名

**原因**：浏览器缓存或构建文件未更新

**解决**：
```bash
# 1. 清除浏览器缓存（硬刷新）
Ctrl + Shift + R

# 2. 检查服务器文件
ssh root@www.13140.sbs
grep -r "api.anyconnects.eu.org" /www/wwwroot/frontend/assets/*.js

# 如果有输出，说明文件未更新，重新部署
```

---

## 📊 性能检查

### 1. 响应时间
```bash
# 测试前端
curl -w "@curl-format.txt" -o /dev/null -s https://www.13140.sbs

# 测试API代理
curl -w "@curl-format.txt" -o /dev/null -s https://www.13140.sbs/api/health
```

### 2. 并发测试
```bash
# 使用ab工具
ab -n 1000 -c 10 https://www.13140.sbs/api/health
```

### 3. 监控日志
```bash
# 前端服务器
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# 后端服务器
pm2 logs backend
```

---

## 🎯 最终确认

部署成功的标志：
- ✅ 用户只看到 `www.13140.sbs` 域名
- ✅ 所有API请求都是 `https://www.13140.sbs/api/*`
- ✅ 后端域名 `api.anyconnects.eu.org` 完全不可见
- ✅ 所有功能正常工作
- ✅ Cookie/Session正常
- ✅ 无CORS错误
- ✅ 无404/502错误

---

## 📚 相关文档

- [NGINX_PROXY_SETUP.md](./NGINX_PROXY_SETUP.md) - 详细配置说明
- [TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md) - 故障排查指南

---

**最后更新**: 2024-11-15
