# PM2 使用指南 - 知识库系统

## 🎯 快速开始

### Windows用户

双击运行：
```
start-pm2.bat
```

或在命令行中：
```bash
start-pm2.bat
```

### Linux/Mac用户

```bash
chmod +x start-pm2.sh
./start-pm2.sh
```

### 手动启动

```bash
node start-pm2-with-env.cjs
```

## 📋 前置要求

1. **Node.js** - 已安装 ✅
2. **PM2** - 脚本会自动安装
3. **环境变量** - `server/.env` 文件已配置 ✅

## 🔧 常用命令

### 查看状态
```bash
pm2 status
```

### 查看日志
```bash
# 实时日志
pm2 logs base2

# 最近50行
pm2 logs base2 --lines 50

# 只看错误
pm2 logs base2 --err

# 清空日志
pm2 flush
```

### 控制服务
```bash
# 重启
pm2 restart base2

# 停止
pm2 stop base2

# 启动
pm2 start base2

# 删除
pm2 delete base2
```

### 监控
```bash
# 实时监控（CPU、内存）
pm2 monit

# 详细信息
pm2 show base2

# 查看环境变量
pm2 env 0
```

### 开机自启
```bash
# 保存当前进程列表
pm2 save

# 生成启动脚本
pm2 startup

# 取消开机自启
pm2 unstartup
```

## 🐛 故障排查

### 问题1：服务无法启动

**症状：** PM2显示错误或服务立即退出

**解决：**
```bash
# 1. 查看详细日志
pm2 logs base2 --lines 100

# 2. 检查环境变量
node -e "require('dotenv').config({path:'./server/.env'}); console.log(process.env.USER_MONGO_URI)"

# 3. 测试数据库连接
node server/scripts/testDatabaseConnection.js

# 4. 检查端口占用
netstat -ano | findstr :3001  # Windows
lsof -i :3001                  # Linux/Mac
```

### 问题2：环境变量未加载

**症状：** 日志显示 "USER_MONGO_URI 未在 .env 中配置"

**解决：**
```bash
# 1. 停止并删除进程
pm2 stop base2
pm2 delete base2

# 2. 使用启动脚本重新启动
node start-pm2-with-env.cjs

# 3. 验证环境变量
pm2 show base2
```

### 问题3：数据库连接失败

**症状：** 日志显示 "MongoServerError" 或连接超时

**解决：**
```bash
# 1. 检查.env文件
cat server/.env | grep MONGO_URI  # Linux/Mac
type server\.env | findstr MONGO_URI  # Windows

# 2. 测试连接
node server/scripts/testDatabaseConnection.js

# 3. 检查数据库服务是否运行
# MongoDB应该在 api.anyconnects.eu.org:27017 运行
```

### 问题4：PM2命令不存在

**症状：** 'pm2' 不是内部或外部命令

**解决：**
```bash
# 全局安装PM2
npm install -g pm2

# 验证安装
pm2 --version

# 如果还是不行，重启终端
```

### 问题5：端口被占用

**症状：** Error: listen EADDRINUSE: address already in use :::3001

**解决：**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <进程ID> /F

# Linux/Mac
lsof -i :3001
kill -9 <进程ID>

# 或者修改端口
# 编辑 server/.env，修改 PORT=3002
```

## 📊 性能优化

### 集群模式（多核CPU）

编辑 `ecosystem.config.js`：
```javascript
{
  instances: 'max',  // 使用所有CPU核心
  exec_mode: 'cluster'
}
```

然后重启：
```bash
pm2 reload base2
```

### 内存限制

```bash
# 设置最大内存为2GB
pm2 start ecosystem.config.js --max-memory-restart 2G
```

### 日志轮转

```bash
# 安装日志轮转模块
pm2 install pm2-logrotate

# 配置
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 🔐 生产环境部署

### 1. 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian
sudo yum update -y                       # CentOS/RHEL

# 安装Node.js和PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### 2. 部署代码

```bash
# 克隆或上传代码
cd /var/www/html/knowledge-base-system/client

# 安装依赖
npm install
cd server && npm install && cd ..

# 配置环境变量
nano server/.env
```

### 3. 启动服务

```bash
# 使用启动脚本
node start-pm2-with-env.cjs

# 或手动启动
pm2 start ecosystem.config.js

# 保存配置
pm2 save

# 设置开机自启
pm2 startup
# 复制输出的命令并执行
```

### 4. 配置反向代理（Nginx）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 5. 配置防火墙

```bash
# Ubuntu/Debian
sudo ufw allow 3001/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

## 📈 监控和维护

### 日常检查

```bash
# 每天检查一次
pm2 status
pm2 logs base2 --lines 50 --nostream

# 查看资源使用
pm2 monit
```

### 定期维护

```bash
# 每周重启一次（可选）
pm2 restart base2

# 清理日志
pm2 flush

# 更新PM2
npm install -g pm2@latest
pm2 update
```

### 备份配置

```bash
# 备份PM2配置
pm2 save
cp ~/.pm2/dump.pm2 ~/pm2-backup-$(date +%Y%m%d).pm2

# 备份环境变量
cp server/.env server/.env.backup
```

## 🆘 紧急恢复

### 服务崩溃

```bash
# 1. 查看错误日志
pm2 logs base2 --err --lines 100

# 2. 重启服务
pm2 restart base2

# 3. 如果还是失败，完全重置
pm2 stop base2
pm2 delete base2
node start-pm2-with-env.cjs
```

### 数据库连接丢失

```bash
# 1. 检查数据库服务
ping api.anyconnects.eu.org

# 2. 测试连接
node server/scripts/testDatabaseConnection.js

# 3. 重启服务
pm2 restart base2
```

### 内存泄漏

```bash
# 1. 查看内存使用
pm2 monit

# 2. 设置自动重启
pm2 start ecosystem.config.js --max-memory-restart 1G

# 3. 手动重启
pm2 restart base2
```

## 📚 更多资源

- [PM2官方文档](https://pm2.keymetrics.io/docs/)
- [PM2 GitHub](https://github.com/Unitech/pm2)
- [Node.js最佳实践](https://github.com/goldbergyoni/nodebestpractices)

## ✅ 检查清单

部署前确认：

- [ ] Node.js已安装（v14+）
- [ ] PM2已安装
- [ ] `server/.env` 文件已配置
- [ ] 数据库连接正常
- [ ] 端口3001未被占用
- [ ] 防火墙规则已配置
- [ ] 已测试启动脚本

部署后确认：

- [ ] `pm2 status` 显示运行中
- [ ] `pm2 logs` 无错误
- [ ] API可以访问（http://localhost:3001）
- [ ] 数据库连接成功
- [ ] 已设置开机自启
- [ ] 已配置日志轮转

---

**版本：** 1.0.0  
**最后更新：** 2024-11-09  
**维护者：** 知识库系统团队
