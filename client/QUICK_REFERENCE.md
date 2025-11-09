# 快速参考指南

**版本**: 1.0.0  
**更新日期**: 2025-11-08

---

## 🚀 快速开始

### 开发环境

```bash
# 1. 安装依赖
npm install
cd server && npm install && cd ..

# 2. 配置环境变量
cp server/.env.example server/.env
# 编辑 server/.env 配置数据库和其他参数

# 3. 启动开发服务器
npm run dev                    # 前端 (端口 5173)
cd server && npm run dev       # 后端 (端口 3001)
```

### 生产环境

```bash
# 1. 构建前端
npm run build

# 2. 使用 PM2 启动后端
pm2 start ecosystem.config.js
pm2 save

# 3. 配置 Nginx 反向代理
# 参考 PRODUCTION_DEPLOYMENT_GUIDE.md
```

---

## 🧪 测试命令

```bash
# 完整功能测试
npm run test                   # 或 node server/scripts/testSuite.js

# 性能测试
npm run test:performance       # 或 node server/scripts/performanceTest.js

# 邀请系统测试
npm run test:referral

# 运行所有测试
npm run test:all
```

---

## 📁 项目结构

```
.
├── src/                       # 前端源码
│   ├── components/           # React 组件
│   ├── pages/               # 页面组件
│   ├── utils/               # 工具函数
│   └── contexts/            # React Context
├── server/                   # 后端源码
│   ├── models/              # 数据模型
│   ├── routes/              # API 路由
│   ├── middleware/          # 中间件
│   ├── services/            # 业务逻辑
│   ├── scripts/             # 脚本工具
│   └── config/              # 配置文件
├── dist/                     # 前端构建输出
└── docs/                     # 文档（各种 .md 文件）
```

---

## 🔑 环境变量

### 必需配置

```env
# 数据库
MONGODB_URI=mongodb://localhost:27017/yourdb

# JWT
JWT_SECRET=your_secret_key_here

# 邮件
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
```

### 可选配置

```env
# 服务器
PORT=3001
NODE_ENV=development

# 支付
BEPUSDT_URL=https://pay.vpno.eu.org
BEPUSDT_API_KEY=your_key
BEPUSDT_MERCHANT_ID=your_id

# 时区
TZ=Asia/Shanghai
```

完整说明: [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)

---

## 🛠️ 常用命令

### 开发

```bash
npm run dev                    # 启动前端开发服务器
cd server && npm run dev       # 启动后端开发服务器
npm run build                  # 构建前端生产版本
```

### 测试

```bash
npm run test                   # 功能测试
npm run test:performance       # 性能测试
npm run test:all              # 所有测试
```

### 数据库

```bash
# 创建管理员
node server/scripts/createAdminSimple.js

# 生成活动日志
node server/scripts/generateActivityLogs.js

# 验证索引
node server/scripts/verifyReferralIndexes.js
```

### PM2 管理

```bash
pm2 start ecosystem.config.js  # 启动应用
pm2 status                     # 查看状态
pm2 logs                       # 查看日志
pm2 restart all                # 重启所有
pm2 stop all                   # 停止所有
pm2 delete all                 # 删除所有
```

---

## 📡 API 端点

### 公开端点

```
GET  /health                   # 健康检查
GET  /api/faqs                 # FAQ列表
GET  /api/topics               # 热门话题
GET  /api/system-config/public-config  # 公开配置
```

### 认证端点

```
POST /api/auth/register        # 用户注册
POST /api/auth/login           # 用户登录
GET  /api/auth/me              # 获取当前用户
POST /api/auth/logout          # 退出登录
```

### 用户端点（需要认证）

```
GET  /api/user/profile         # 用户资料
PUT  /api/user/profile         # 更新资料
GET  /api/user/balance         # 余额信息
GET  /api/search/history       # 搜索历史
```

### 管理端点（需要管理员权限）

```
GET  /api/admin/stats          # 统计数据
GET  /api/admin/users          # 用户列表
GET  /api/tickets/admin/all    # 所有工单
PUT  /api/system-config/*      # 系统配置
```

完整API文档: 查看各路由文件

---

## 🔐 默认账户

### 管理员账户

创建管理员:
```bash
node server/scripts/createAdminSimple.js
```

默认信息:
- 邮箱: admin@example.com
- 密码: Admin123456!

**⚠️ 生产环境请立即修改密码！**

---

## 📊 监控和日志

### 查看日志

```bash
# PM2 日志
pm2 logs                       # 实时日志
pm2 logs --lines 100          # 最近100行

# 应用日志
tail -f /var/log/myapp/app.log
tail -f /var/log/myapp/error.log

# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 性能监控

```bash
pm2 monit                      # PM2 监控界面
node server/scripts/performanceTest.js  # 性能测试
```

---

## 🐛 故障排查

### 应用无法启动

```bash
# 1. 检查日志
pm2 logs --lines 50

# 2. 检查端口
netstat -tulpn | grep 3001

# 3. 检查环境变量
cat server/.env

# 4. 测试数据库连接
mongosh "mongodb://localhost:27017/yourdb"
```

### 数据库连接失败

```bash
# 1. 检查 MongoDB 状态
sudo systemctl status mongod

# 2. 查看 MongoDB 日志
sudo tail -f /var/log/mongodb/mongod.log

# 3. 测试连接
mongosh
```

### Nginx 502 错误

```bash
# 1. 检查后端是否运行
curl http://localhost:3001/health

# 2. 检查 Nginx 配置
sudo nginx -t

# 3. 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

---

## 📚 文档索引

### 核心文档

- [生产环境部署指南](./PRODUCTION_DEPLOYMENT_GUIDE.md) - 完整部署流程
- [代码优化总结](./CODE_OPTIMIZATION_SUMMARY.md) - 优化说明
- [环境变量说明](./ENVIRONMENT_VARIABLES.md) - 配置详解
- [项目完成报告](./PROJECT_COMPLETION_REPORT.md) - 项目状态

### 功能文档

- [邀请追踪系统](./REFERRAL_TRACKING_SYSTEM_COMPLETE.md)
- [活动日志系统](./ACTIVITY_LOG_SYSTEM.md)
- [积分说明配置](./POINTS_DESCRIPTION_CONFIG_COMPLETE.md)
- [管理菜单重构](./ADMIN_MENU_RESTRUCTURE_COMPLETE.md)
- [备份升级系统](./BACKUP_UPGRADE_SYSTEM_FINAL.md)

### 修复文档

- [硬编码修复](./ALL_HARDCODED_FIXED.md)
- [时区配置](./TIMEZONE_FINAL_SUMMARY.md)
- [搜索优化](./SEARCH_OPTIMIZATION_COMPLETE.md)

---

## 🔧 开发技巧

### 热重载

前端和后端都支持热重载，修改代码后自动刷新。

### 调试

```bash
# 后端调试
NODE_ENV=development LOG_LEVEL=debug npm run dev

# 前端调试
# 使用浏览器开发者工具
```

### 数据库管理

```bash
# 连接数据库
mongosh "mongodb://localhost:27017/yourdb"

# 常用命令
show dbs                       # 显示所有数据库
use yourdb                     # 切换数据库
show collections               # 显示所有集合
db.users.find()               # 查询用户
db.users.countDocuments()     # 统计数量
```

---

## 🎯 性能基准

### 目标指标

- API 响应时间: < 100ms
- 数据库查询: < 50ms
- 页面加载时间: < 2s
- 并发用户: 100+

### 测试方法

```bash
# 运行性能测试
npm run test:performance

# 查看结果
# 平均响应时间应 < 100ms
# 性能评级应为"优秀"或"良好"
```

---

## 🔄 更新流程

### 开发环境

```bash
git pull origin main
npm install
cd server && npm install && cd ..
npm run dev
```

### 生产环境

```bash
# 1. 备份
pm2 save
mongodump --out /backup/$(date +%Y%m%d)

# 2. 更新代码
git pull origin main
npm install --production
cd server && npm install --production && cd ..

# 3. 构建
npm run build

# 4. 重启
pm2 reload all

# 5. 验证
curl http://localhost:3001/health
npm run test
```

---

## 📞 获取帮助

### 文档

- 查看项目根目录的 .md 文件
- 每个功能都有对应的文档

### 日志

- 应用日志: `/var/log/myapp/`
- PM2 日志: `pm2 logs`
- Nginx 日志: `/var/log/nginx/`

### 测试

- 运行测试脚本定位问题
- 查看测试输出的错误信息

---

## ✅ 检查清单

### 开发前

- [ ] 环境变量已配置
- [ ] 数据库已启动
- [ ] 依赖已安装

### 开发中

- [ ] 代码符合规范
- [ ] 功能测试通过
- [ ] 无明显错误

### 部署前

- [ ] 代码已提交
- [ ] 测试全部通过
- [ ] 文档已更新
- [ ] 备份已完成

---

**最后更新**: 2025-11-08  
**版本**: 1.0.0  
**状态**: ✅ 可用
