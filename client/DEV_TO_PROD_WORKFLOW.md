# 开发到生产完整工作流

## 📋 目录

1. [开发环境上传到 GitHub](#1-开发环境上传到-github)
2. [生产服务器从 GitHub 更新](#2-生产服务器从-github-更新)
3. [日常开发流程](#3-日常开发流程)
4. [自动化脚本](#4-自动化脚本)

---

## 1. 开发环境上传到 GitHub

### 步骤 1.1: 初始化 Git 仓库（首次）

在你的开发机器（Windows）上：

```bash
# 进入项目目录
cd E:\vscodefile\knowbase2\client

# 初始化 Git 仓库（如果还没有）
git init

# 添加远程仓库
git remote add origin https://github.com/bbstom/knowledge-base-system.git

# 查看远程仓库
git remote -v
```

### 步骤 1.2: 配置 .gitignore

确保不上传敏感文件和不必要的文件：

```bash
# 创建或编辑 .gitignore
notepad .gitignore
```

添加以下内容：

```gitignore
# 依赖
node_modules/
server/node_modules/

# 环境变量（敏感信息）
server/.env
.env
.env.local
.env.production

# 构建输出
dist/
build/
server/dist/

# 日志
logs/
*.log
server/logs/
npm-debug.log*

# 备份文件
server/backups/
*.backup
*.bak

# 上传文件
server/uploads/

# 临时文件
server/temp/
tmp/
*.tmp

# 操作系统文件
.DS_Store
Thumbs.db
desktop.ini

# IDE 文件
.vscode/
.idea/
*.swp
*.swo
*~

# 测试覆盖率
coverage/

# PM2
.pm2/
```

### 步骤 1.3: 首次提交并推送

```bash
# 添加所有文件
git add .

# 查看将要提交的文件
git status

# 提交
git commit -m "Initial commit: Knowledge Base System v1.0"

# 推送到 GitHub（首次需要设置上游分支）
git push -u origin main

# 如果分支名是 master，使用：
# git push -u origin master
```

### 步骤 1.4: 配置 GitHub 认证

如果推送时需要认证：

**方式 A: 使用 Personal Access Token（推荐）**

```bash
# 1. 在 GitHub 创建 Personal Access Token
# 访问: https://github.com/settings/tokens
# 点击 "Generate new token (classic)"
# 勾选 "repo" 权限
# 生成并复制 token

# 2. 使用 token 推送
git push -u origin main
# 用户名: 你的 GitHub 用户名
# 密码: 粘贴你的 Personal Access Token
```

**方式 B: 使用 SSH Key**

```bash
# 1. 生成 SSH Key
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. 复制公钥
cat ~/.ssh/id_ed25519.pub

# 3. 添加到 GitHub
# 访问: https://github.com/settings/keys
# 点击 "New SSH key"
# 粘贴公钥内容

# 4. 修改远程仓库 URL
git remote set-url origin git@github.com:bbstom/knowledge-base-system.git

# 5. 推送
git push -u origin main
```

### 步骤 1.5: 创建 .env.example

创建一个示例环境变量文件（不包含敏感信息）：

```bash
# 复制 .env 并移除敏感信息
cp server/.env server/.env.example
```

编辑 `server/.env.example`，替换敏感信息为占位符：

```env
# 服务器配置
PORT=3001
HOST=0.0.0.0
NODE_ENV=production
TZ=Asia/Shanghai

# 用户数据库
USER_MONGO_URI=mongodb://username:password@host:port/database?authSource=admin

# 查询数据库（可选）
#QUERY_MONGO_URI=mongodb://username:password@host:port/database?authSource=admin

# JWT密钥（请修改为随机字符串）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# BEpusdt配置
BEPUSDT_URL=https://your-bepusdt-url.com
BEPUSDT_API_KEY=your-api-key
BEPUSDT_MERCHANT_ID=your-merchant-id
BEPUSDT_SECRET_KEY=your-secret-key
BEPUSDT_TEST_MODE=false

# 前端地址
FRONTEND_URL=http://localhost:5173

# 后端地址（用于Webhook回调）
BACKEND_URL=http://your-domain.com:3001

# 邮件服务配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SITE_NAME=信息查询系统
```

提交 .env.example：

```bash
git add server/.env.example
git commit -m "Add environment variables example"
git push origin main
```

---

## 2. 生产服务器从 GitHub 更新

### 步骤 2.1: 首次部署（如果服务器上还没有代码）

在生产服务器上：

```bash
# 进入部署目录
cd /var/www/html

# 克隆仓库
git clone https://github.com/bbstom/knowledge-base-system.git

# 进入项目目录
cd knowledge-base-system

# 配置环境变量
cp server/.env.example server/.env
nano server/.env
# 填入生产环境的配置

# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ..
npm install

# 构建前端
npm run build

# 启动服务
cd server
pm2 start index.js --name knowledge-base
pm2 save
```

### 步骤 2.2: 更新现有部署

#### 方式 A: 手动更新

```bash
# 进入项目目录
cd /var/www/html/knowledge-base-system

# 备份配置文件
cp server/.env server/.env.backup

# 停止服务
pm2 stop knowledge-base

# 保存本地修改
git stash

# 拉取最新代码
git pull origin main

# 恢复本地修改
git stash pop

# 更新依赖
cd server && npm install
cd .. && npm install

# 重新构建前端
npm run build

# 重启服务
pm2 restart knowledge-base

# 查看日志
pm2 logs knowledge-base --lines 50
```

#### 方式 B: 使用自动化脚本（推荐）

创建更新脚本 `/var/www/html/knowledge-base-system/update.sh`：

```bash
#!/bin/bash
# 自动更新脚本

set -e

echo "🚀 开始更新 Knowledge Base System..."

# 进入项目目录
cd /var/www/html/knowledge-base-system

# 备份配置
echo "📦 备份配置文件..."
cp server/.env server/.env.backup.$(date +%Y%m%d_%H%M%S)

# 停止服务
echo "⏸️  停止服务..."
pm2 stop knowledge-base || true

# 保存本地修改
echo "💾 保存本地修改..."
git stash save "自动保存 $(date +%Y%m%d_%H%M%S)" || true

# 拉取最新代码
echo "⬇️  拉取最新代码..."
git pull origin main

# 恢复本地修改
echo "🔄 恢复本地配置..."
git stash pop || echo "⚠️  没有需要恢复的修改"

# 更新依赖
echo "📦 更新后端依赖..."
cd server
npm install

echo "📦 更新前端依赖..."
cd ..
npm install

# 构建前端
echo "🔨 构建前端..."
npm run build

# 重启服务
echo "▶️  重启服务..."
pm2 restart knowledge-base

# 查看状态
echo "✅ 更新完成！"
pm2 status knowledge-base

echo ""
echo "📋 查看日志："
echo "pm2 logs knowledge-base"
```

使用脚本：

```bash
# 添加执行权限
chmod +x /var/www/html/knowledge-base-system/update.sh

# 运行更新
/var/www/html/knowledge-base-system/update.sh
```

---

## 3. 日常开发流程

### 3.1 开发环境工作流

```bash
# 1. 开始新功能开发
cd E:\vscodefile\knowbase2\client

# 2. 创建新分支（可选，推荐）
git checkout -b feature/new-feature

# 3. 进行开发...
# 修改代码、测试等

# 4. 查看修改
git status
git diff

# 5. 提交修改
git add .
git commit -m "feat: 添加新功能描述"

# 6. 推送到 GitHub
git push origin feature/new-feature

# 或者直接推送到 main 分支
git checkout main
git merge feature/new-feature
git push origin main
```

### 3.2 生产环境更新流程

```bash
# 在生产服务器上
cd /var/www/html/knowledge-base-system

# 运行更新脚本
./update.sh

# 或者手动更新
git pull origin main
cd server && npm install
cd .. && npm install && npm run build
pm2 restart knowledge-base
```

### 3.3 提交信息规范（推荐）

使用语义化提交信息：

```bash
# 新功能
git commit -m "feat: 添加用户管理功能"

# 修复 Bug
git commit -m "fix: 修复登录验证问题"

# 文档更新
git commit -m "docs: 更新 README 文档"

# 代码重构
git commit -m "refactor: 重构数据库连接逻辑"

# 性能优化
git commit -m "perf: 优化搜索查询性能"

# 样式修改
git commit -m "style: 调整按钮样式"

# 测试相关
git commit -m "test: 添加用户注册测试"

# 构建相关
git commit -m "build: 更新依赖版本"

# 配置修改
git commit -m "chore: 更新 ESLint 配置"
```

---

## 4. 自动化脚本

### 4.1 开发环境快速推送脚本

创建 `push.bat`（Windows）：

```batch
@echo off
echo 🚀 快速推送到 GitHub...

REM 添加所有修改
git add .

REM 提交（使用参数作为提交信息）
if "%~1"=="" (
    set /p message="请输入提交信息: "
) else (
    set message=%*
)

git commit -m "%message%"

REM 推送
git push origin main

echo ✅ 推送完成！
pause
```

使用方法：

```bash
# 方式 1: 直接运行，会提示输入提交信息
push.bat

# 方式 2: 带参数运行
push.bat "feat: 添加新功能"
```

### 4.2 生产环境自动更新脚本

已在步骤 2.2 中提供。

### 4.3 定时自动更新（可选）

在生产服务器上设置定时任务：

```bash
# 编辑 crontab
crontab -e

# 添加以下行（每天凌晨 3 点自动更新）
0 3 * * * /var/www/html/knowledge-base-system/update.sh >> /var/log/kb-update.log 2>&1
```

---

## 5. 常见问题处理

### 问题 1: 推送被拒绝

```bash
# 原因：远程有新提交，本地没有
# 解决：先拉取再推送
git pull origin main --rebase
git push origin main
```

### 问题 2: 合并冲突

```bash
# 拉取时出现冲突
git pull origin main

# 手动解决冲突文件
# 编辑文件，删除冲突标记

# 标记为已解决
git add <冲突文件>
git commit -m "解决合并冲突"
git push origin main
```

### 问题 3: 误提交敏感文件

```bash
# 从 Git 历史中删除文件
git rm --cached server/.env
git commit -m "Remove sensitive file"
git push origin main

# 如果已经推送，需要清理历史
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch server/.env" \
  --prune-empty --tag-name-filter cat -- --all

git push origin --force --all
```

### 问题 4: 回滚到之前的版本

```bash
# 查看提交历史
git log --oneline -10

# 回滚到指定版本
git reset --hard <commit-hash>

# 强制推送（谨慎使用）
git push origin main --force
```

---

## 6. 最佳实践

### 6.1 分支策略

```bash
# main 分支：生产环境代码
# develop 分支：开发环境代码
# feature/* 分支：新功能开发

# 创建开发分支
git checkout -b develop

# 创建功能分支
git checkout -b feature/user-management

# 完成后合并到 develop
git checkout develop
git merge feature/user-management

# 测试通过后合并到 main
git checkout main
git merge develop
git push origin main
```

### 6.2 版本标签

```bash
# 创建版本标签
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# 查看所有标签
git tag

# 检出特定版本
git checkout v1.0.0
```

### 6.3 保护敏感信息

1. 永远不要提交 `.env` 文件
2. 使用 `.env.example` 作为模板
3. 在 `.gitignore` 中排除敏感文件
4. 定期检查提交历史

---

## 7. 快速参考

### 开发环境（Windows）

```bash
# 提交并推送
git add .
git commit -m "你的提交信息"
git push origin main
```

### 生产环境（Linux）

```bash
# 更新代码
cd /var/www/html/knowledge-base-system
./update.sh
```

---

## ✅ 总结

现在你有了一个完整的开发到生产的工作流：

1. **开发环境**: 修改代码 → 提交 → 推送到 GitHub
2. **生产环境**: 运行更新脚本 → 自动拉取 → 自动部署

这个流程安全、高效，并且可以保留你的本地配置！
