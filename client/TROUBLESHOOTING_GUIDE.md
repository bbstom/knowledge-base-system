# 前后端分离部署故障排查指南

## 🔍 问题诊断步骤

### 第一步：检查后端服务

```bash
# 1. 检查后端是否运行
pm2 status

# 2. 查看后端日志
pm2 logs api-server

# 3. 测试后端健康检查
curl http://localhost:3001/health
# 或
curl http://localhost:3001/api/health

# 4. 检查端口是否监听
netstat -tlnp | grep 3001
# 或
lsof -i :3001
```

### 第二步：检查前端配置

```bash
# 1. 检查前端构建配置
cat client/.env.production

# 应该包含：
# VITE_API_URL=https://api.yourdomain.com
# 或
# VITE_API_URL=http://backend-server-ip:3001

# 2. 检查构建后的文件
ls -la client/dist/

# 3. 检查Nginx配置
sudo nginx -t
sudo cat /etc/nginx/sites-available/frontend
```

### 第三步：检查网络连接

```bash
# 从前端服务器测试后端
curl -v http://backend-server-ip:3001/health

# 从本地浏览器测试
# 打开浏览器开发者工具 → Network 标签
# 访问前端网站，查看API请求
```

## 🐛 常见问题和解决方案

### 问题1：CORS错误

**症状**：
```
Access to fetch at 'http://backend-server:3001/api/...' 
from origin 'https://frontend-domain.com' has been blocked by CORS policy
```

**检查清单**：

1. **后端.env配置**：
```bash
# 检查后端配置
cat /www/wwwroot/api/.env | grep CORS

# 应该显示：
CORS_ORIGIN=https://www.13140.sbs
```

2. **后端代码配置**：
```bash
# 检查server/index.js
grep -A 10 "cors" server/index.js
```

应该包含：
```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'https://www.13140.sbs',
  credentials: true
};
app.use(cors(corsOptions));
```

**解决方案**：
```bash
# 1. 修改后端.env
nano /www/wwwroot/api/.env

# 添加或修改：
CORS_ORIGIN=https://www.13140.sbs
COOKIE_DOMAIN=.13140.sbs

# 2. 重启后端
pm2 restart api-server

# 3. 查看日志
pm2 logs api-server
```

### 问题2：API请求404

**症状**：
```
GET https://api.yourdomain.com/api/user/profile 404 Not Found
```

**检查清单**：

1. **前端API地址配置**：
```bash
# 检查前端环境变量
cat client/.env.production

# 应该是：
VITE_API_URL=https://api.13140.sbs
# 或
VITE_API_URL=http://backend-ip:3001
```

2. **检查API路由**：
```bash
# 后端路由是否正确
curl http://localhost:3001/api/user/profile
```

3. **检查Nginx代理**（如果使用）：
```nginx
# 检查Nginx配置
sudo cat /etc/nginx/sites-available/api

# 应该包含：
location / {
    proxy_pass http://localhost:3001;
}
```

**解决方案**：
```bash
# 1. 重新构建前端（确保环境变量生效）
cd /www/wwwroot/frontend/client
echo "VITE_API_URL=https://api.13140.sbs" > .env.production
npm run build

# 2. 部署
sudo cp -r dist/* /www/wwwroot/frontend/

# 3. 清除浏览器缓存
# Ctrl+Shift+Delete
```

### 问题3：Cookie不发送

**症状**：
- 登录成功但刷新后退出
- API请求返回401未授权
- 浏览器Cookie中没有token

**检查清单**：

1. **检查Cookie设置**：
```javascript
// 后端设置Cookie时
res.cookie('token', token, {
  httpOnly: true,
  secure: true,  // 生产环境必须true
  sameSite: 'none',  // 跨域必须none
  domain: '.13140.sbs'  // 注意点号
});
```

2. **检查前端请求**：
```typescript
// 所有请求必须包含
fetch(url, {
  credentials: 'include'  // 必须！
});

// 或Axios
axios.create({
  withCredentials: true  // 必须！
});
```

3. **检查HTTPS**：
```bash
# 生产环境必须使用HTTPS
# 检查SSL证书
sudo certbot certificates
```

**解决方案**：
```bash
# 1. 确保使用HTTPS
# 2. 检查后端Cookie配置
nano server/routes/auth.js

# 确保包含：
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'none',
  domain: process.env.COOKIE_DOMAIN || '.13140.sbs',
  maxAge: 7 * 24 * 60 * 60 * 1000
});

# 3. 重启后端
pm2 restart api-server
```

### 问题4：防火墙阻止

**症状**：
- 从前端服务器无法访问后端
- curl超时

**检查清单**：
```bash
# 1. 检查防火墙规则
sudo ufw status

# 2. 检查端口是否开放
sudo ufw allow 3001/tcp

# 3. 或只允许前端服务器IP
sudo ufw allow from <frontend-server-ip> to any port 3001

# 4. 检查云服务器安全组
# 在云服务商控制台检查安全组规则
```

### 问题5：环境变量未生效

**症状**：
- API请求到错误的地址
- 配置没有生效

**检查清单**：
```bash
# 1. 检查前端环境变量
cat client/.env.production

# 2. 检查构建时是否使用了正确的环境变量
# 在构建输出中查找
npm run build 2>&1 | grep VITE_API_URL

# 3. 检查构建后的文件
# 在dist/assets/*.js中搜索API地址
grep -r "api.13140.sbs" client/dist/
```

**解决方案**：
```bash
# 1. 确保.env.production存在
cd client
echo "VITE_API_URL=https://api.13140.sbs" > .env.production

# 2. 清理并重新构建
rm -rf dist node_modules/.vite
npm run build

# 3. 验证构建结果
grep -r "13140.sbs" dist/assets/*.js
```

## 🔧 完整的配置检查

### 后端配置检查

```bash
# 1. 检查.env文件
cat /www/wwwroot/api/.env

# 应该包含：
PORT=3001
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/knowledge-base
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://www.13140.sbs
COOKIE_DOMAIN=.13140.sbs

# 2. 检查server/index.js
grep -A 20 "cors" /www/wwwroot/api/server/index.js

# 3. 检查服务状态
pm2 status
pm2 logs api-server --lines 50
```

### 前端配置检查

```bash
# 1. 检查环境变量
cat /www/wwwroot/frontend/client/.env.production

# 应该包含：
VITE_API_URL=https://api.13140.sbs

# 2. 检查Nginx配置
sudo cat /etc/nginx/sites-available/frontend

# 3. 检查构建文件
ls -la /www/wwwroot/frontend/
```

### Nginx配置检查

```bash
# 1. 测试配置
sudo nginx -t

# 2. 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 3. 查看访问日志
sudo tail -f /var/log/nginx/access.log
```

## 🧪 测试步骤

### 1. 测试后端API

```bash
# 健康检查
curl http://localhost:3001/health

# 测试登录API
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# 测试CORS
curl -H "Origin: https://www.13140.sbs" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:3001/api/auth/login
```

### 2. 测试前端

```bash
# 访问前端
curl https://www.13140.sbs

# 检查是否返回HTML
curl -I https://www.13140.sbs
```

### 3. 浏览器测试

1. 打开浏览器开发者工具（F12）
2. 切换到Network标签
3. 访问前端网站
4. 尝试登录
5. 检查：
   - API请求地址是否正确
   - 请求头是否包含Cookie
   - 响应头是否包含Set-Cookie
   - 是否有CORS错误

## 📋 配置模板

### 后端.env模板

```env
# 服务器配置
PORT=3001
NODE_ENV=production

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/knowledge-base
MONGODB_QUERY_URI=mongodb://localhost:27017/query-database

# JWT密钥
JWT_SECRET=your-super-secret-key-change-this-in-production

# CORS配置（重要！）
CORS_ORIGIN=https://www.13140.sbs
COOKIE_DOMAIN=.13140.sbs

# 邮件配置（可选）
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
```

### 前端.env.production模板

```env
# API地址（重要！）
VITE_API_URL=https://api.13140.sbs
```

### 后端CORS配置模板

```javascript
// server/index.js
const cors = require('cors');

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'https://www.13140.sbs',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 前端API配置模板

```typescript
// src/utils/realApi.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const request = async (url: string, options: RequestInit = {}) => {
  const config: RequestInit = {
    credentials: 'include', // 重要！
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);
  return response.json();
};
```

## 🚨 紧急修复脚本

```bash
#!/bin/bash
# fix-deployment.sh

echo "=== 前后端分离部署修复脚本 ==="

# 后端修复
echo "1. 修复后端配置..."
cd /www/wwwroot/api

# 确保.env配置正确
cat > .env << EOF
PORT=3001
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/knowledge-base
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://www.13140.sbs
COOKIE_DOMAIN=.13140.sbs
EOF

# 重启后端
pm2 restart api-server
echo "✓ 后端已重启"

# 前端修复
echo "2. 修复前端配置..."
cd /www/wwwroot/frontend/client

# 确保环境变量正确
echo "VITE_API_URL=https://api.13140.sbs" > .env.production

# 重新构建
npm run build

# 部署
sudo cp -r dist/* /www/wwwroot/frontend/
echo "✓ 前端已重新部署"

# 重启Nginx
echo "3. 重启Nginx..."
sudo systemctl reload nginx
echo "✓ Nginx已重启"

echo "=== 修复完成 ==="
echo "请在浏览器中测试："
echo "1. 访问 https://www.13140.sbs"
echo "2. 打开开发者工具查看Network"
echo "3. 尝试登录"
```

## 📞 获取帮助

如果以上方法都无法解决，请提供以下信息：

1. **后端日志**：
```bash
pm2 logs api-server --lines 100
```

2. **Nginx错误日志**：
```bash
sudo tail -100 /var/log/nginx/error.log
```

3. **浏览器控制台错误**：
- 打开F12开发者工具
- 截图Console和Network标签的错误

4. **配置文件**：
- 后端.env内容（隐藏敏感信息）
- 前端.env.production内容
- Nginx配置文件

5. **测试结果**：
```bash
# 从前端服务器测试后端
curl -v http://backend-ip:3001/health
```

提供这些信息可以帮助快速定位问题！
