# 🚀 生产服务器部署 - 快速参考

## ⚡ 方式 1: 自动化脚本（最快）

```bash
# 1. 上传脚本到服务器
scp quick-deploy.sh root@your-server-ip:/root/

# 2. 连接到服务器
ssh root@your-server-ip

# 3. 运行脚本
chmod +x quick-deploy.sh
./quick-deploy.sh
```

脚本会自动完成所有安装和配置！

---

## 📝 方式 2: 手动部署（完全控制）

### 快速命令

```bash
# 1. 安装依赖
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs mongodb-org git nginx
sudo npm install -g pm2

# 2. 克隆项目
cd /var/www
git clone https://github.com/YOUR_USERNAME/knowledge-base-system.git
cd knowledge-base-system

# 3. 配置环境
cp server/.env.example server/.env
nano server/.env  # 编辑配置

# 4. 安装和构建
cd server && npm install
cd .. && npm install
npm run build

# 5. 启动应用
pm2 start server/index.js --name "knowledge-base"
pm2 startup
pm2 save
```

---

## 🔧 关键配置

### MongoDB 连接

```env
MONGO_URI=mongodb://username:password@localhost:27017/knowledge-base?authSource=knowledge-base
```

### 生产环境

```env
NODE_ENV=production
PORT=3001
SITE_URL=https://yourdomain.com
```

### JWT 密钥

```env
JWT_SECRET=your-super-secret-key-change-this
```

---

## 🌐 Nginx 配置（简化版）

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        root /var/www/knowledge-base-system/dist;
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
    }
}
```

---

## 🔒 SSL 证书（Let's Encrypt）

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 📊 常用命令

### PM2 管理

```bash
pm2 status                    # 查看状态
pm2 logs knowledge-base       # 查看日志
pm2 restart knowledge-base    # 重启应用
pm2 stop knowledge-base       # 停止应用
pm2 monit                     # 监控资源
```

### 更新应用

```bash
cd /var/www/knowledge-base-system
git pull origin main
npm install
npm run build
pm2 restart knowledge-base
```

### 备份数据库

```bash
mongodump --uri="mongodb://user:pass@localhost:27017/knowledge-base" --out=/backup/$(date +%Y%m%d)
```

---

## ✅ 部署检查清单

- [ ] Node.js >= 16.0.0 已安装
- [ ] MongoDB >= 4.4 已安装并运行
- [ ] 项目已从 GitHub 克隆
- [ ] server/.env 已配置
- [ ] 依赖已安装
- [ ] 前端已构建
- [ ] PM2 进程正在运行
- [ ] Nginx 已配置（如使用）
- [ ] SSL 证书已安装（如使用 HTTPS）
- [ ] 防火墙已配置
- [ ] 管理员账号已创建

---

## 🆘 快速故障排除

### 应用无法启动

```bash
pm2 logs knowledge-base --err
```

### 数据库连接失败

```bash
sudo systemctl status mongod
sudo tail -f /var/log/mongodb/mongod.log
```

### Nginx 错误

```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

---

## 📚 详细文档

- **完整部署指南**: `DEPLOY_FROM_GITHUB.md`
- **生产环境指南**: `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **项目说明**: `README.md`

---

**需要帮助？** 查看详细文档或在 GitHub Issues 中提问。
