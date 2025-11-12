# PM2生产环境快速修复 🚨

## 问题1: dotenv模块缺失
```
❌ Error: Cannot find module 'dotenv'
```

## 问题2: 环境变量未加载
```
❌ 数据库初始化失败: USER_MONGO_URI 未在 .env 中配置
```

## 解决方案（4步）

### 1️⃣ 登录生产服务器
```bash
ssh root@your-server
cd /var/www/html/knowledge-base-system/client
```

### 2️⃣ 安装依赖（重要！）
```bash
cd server
npm install
cd ..
```

### 3️⃣ 更新代码（如果需要）
```bash
# 如果使用Git
git pull origin main

# 或手动编辑server/index.js第一行为：
# require('dotenv').config({ path: require('path').join(__dirname, '.env') });
```

### 4️⃣ 重启服务
```bash
pm2 restart base2
pm2 logs base2 --lines 50
```

## 成功标志
```
✓ 用户数据库连接成功
✓ 查询数据库连接成功
服务器运行在 http://0.0.0.0:3001
```

---

## 自动部署脚本

**Linux/Mac:**
```bash
chmod +x deploy-fix-to-production.sh
./deploy-fix-to-production.sh
```

**Windows:**
```bash
deploy-fix-to-production.bat
```

---

## 故障排查

### 还是报错？
```bash
# 检查.env文件
ls -la server/.env
cat server/.env | grep USER_MONGO_URI

# 完全重启
pm2 stop base2
pm2 delete base2
node start-pm2-with-env.cjs
```

### 查看详细日志
```bash
pm2 logs base2 --err --lines 100
```

---

## 详细文档
- **PRODUCTION_PM2_FIX_NOW.md** - 详细修复指南
- **PM2_PRODUCTION_FIX_SUMMARY.md** - 完整总结
- **PM2_使用指南.md** - 使用手册

---

**紧急程度：** 🚨 高  
**预计时间：** 5分钟  
**影响范围：** 生产环境
