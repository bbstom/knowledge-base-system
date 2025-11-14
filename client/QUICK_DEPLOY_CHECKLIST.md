# 前后端分离部署快速清单

## 🚀 快速配置步骤

### 后端服务器（Server B）

```bash
# 1. 配置环境变量
cat > .env << EOF
PORT=3001
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/knowledge-base
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://yourdomain.com
COOKIE_DOMAIN=.yourdomain.com
EOF

# 2. 修改CORS配置
# 编辑 server/index.js
```

```javascript
// server/index.js
const corsOptions = {
  origin: 'https://yourdomain.com',
  credentials: true
};
app.use(cors(corsOptions));
```

```bash
# 3. 启动服务
npm install
pm2 start server/index.js --name api-server
pm2 save
```

### 前端服务器（Server A）

```bash
# 1. 配置API地址
echo "VITE_API_URL=https://api.yourdomain.com" > client/.env.production

# 2. 构建
cd client
npm install
npm run build

# 3. 部署
sudo cp -r dist/* /www/wwwroot/frontend/
```

### Nginx配置

**前端**:
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    root /www/wwwroot/frontend;
    
    location / {
        try_files $uri /index.html;
    }
}
```

**后端**:
```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
    }
}
```

## ✅ 验证清单

- [ ] 后端API可访问: `curl https://api.yourdomain.com/health`
- [ ] 前端页面可访问: `https://yourdomain.com`
- [ ] API请求成功（浏览器开发者工具检查）
- [ ] Cookie正常工作
- [ ] 登录功能正常

## 🔑 关键配置

1. **后端CORS**: `origin: 'https://yourdomain.com'`
2. **前端API**: `VITE_API_URL=https://api.yourdomain.com`
3. **Cookie**: `credentials: 'include'`
4. **HTTPS**: 必须使用SSL证书

完成！
