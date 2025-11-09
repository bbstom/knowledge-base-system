# Knowledge Base System

一个功能完整的知识库管理系统，支持用户管理、积分系统、推荐奖励、工单系统等功能。

## 主要功能

- 🔐 用户认证系统（注册、登录、密码重置）
- 💰 积分系统（充值、消费、兑换）
- 🎁 推荐奖励系统
- 🔍 知识库搜索
- 🎫 工单系统
- 💳 提现管理
- 📧 邮件模板系统
- 🔒 滑块验证码
- 📊 管理员后台
- 💾 数据库配置管理
- 🔄 备份与升级系统
- 🌐 时区配置

## 技术栈

### 前端
- React 18
- TypeScript
- Vite
- Ant Design
- Axios

### 后端
- Node.js
- Express
- MongoDB
- JWT 认证
- Nodemailer

## 安装部署

### 1. 克隆项目

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. 安装依赖

```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 3. 配置环境变量

```bash
# 复制配置文件模板
cd server
cp .env.example .env

# 编辑 .env 文件，填写数据库和邮件配置
nano .env
```

### 4. 构建前端

```bash
cd client
npm run build
```

### 5. 启动服务

```bash
# 开发环境
cd server
npm run dev

# 生产环境（使用 PM2）
pm2 start server/index.js --name "knowledge-base"
```

### 6. 创建管理员账号

```bash
cd server
node scripts/createAdminSimple.js
```

## 配置说明

### 数据库配置

系统支持两种配置方式：

1. **通过后台界面配置**（推荐）
   - 登录管理员后台
   - 进入"系统设置" -> "数据库配置"
   - 添加数据库连接信息

2. **通过 .env 文件配置**
   ```env
   USER_MONGO_URI=mongodb://user:pass@host:port/userdata?authSource=admin
   QUERY_MONGO_URI=mongodb://user:pass@host:port/basedata?authSource=admin
   ```

### 邮件配置

1. **通过后台界面配置**（推荐）
   - 登录管理员后台
   - 进入"系统设置" -> "邮件配置"
   - 填写 SMTP 服务器信息

2. **通过 .env 文件配置**
   ```env
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your-email@example.com
   SMTP_PASS=your-password
   ```

## Nginx 配置

参考配置文件：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    root /var/www/html/know/client/dist;
    index index.html;
    
    # API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 功能说明

### 用户功能
- 注册/登录
- 个人资料管理
- 积分充值与消费
- 推荐好友获取奖励
- 查看搜索历史
- 提交工单
- 申请提现

### 管理员功能
- 用户管理
- 内容管理
- 积分配置
- 充值卡管理
- 提现审核
- 工单管理
- 邮件模板管理
- 数据库配置
- 系统备份与恢复
- 版本升级管理
- 财务报表
- 实时监控

## 开发

### 前端开发

```bash
cd client
npm run dev
```

### 后端开发

```bash
cd server
npm run dev
```

## 测试

```bash
# 测试数据库连接
cd server
node scripts/testDatabaseConnection.js

# 测试备份功能
node scripts/testCodeBackup.js

# 测试推荐系统
node scripts/testReferralSystem.js
```

## 备份与恢复

### 创建备份

```bash
# 通过后台界面
管理员后台 -> 系统设置 -> 备份管理 -> 创建备份

# 或命令行
cd server
node -e "require('./services/backupService').createBackup('manual')"
```

备份包含：
- 数据库
- 后端代码
- 前端代码
- 配置文件
- 上传文件

### 恢复备份

参考 `CODE_BACKUP_COMPLETE.md` 文档中的恢复步骤。

## 安全建议

1. **修改默认密钥**
   - 修改 `JWT_SECRET`
   - 修改 `ENCRYPTION_KEY`

2. **使用 HTTPS**
   - 配置 SSL 证书
   - 强制 HTTPS 访问

3. **定期备份**
   - 设置自动备份计划
   - 定期下载备份文件

4. **更新依赖**
   ```bash
   npm audit
   npm update
   ```

## 许可证

MIT License

## 支持

如有问题，请提交 Issue。
