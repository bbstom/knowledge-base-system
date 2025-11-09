# Git 更新部署指南

## 🎯 推荐方式：使用 Git Pull 更新

这是最安全、最专业的更新方式，可以保留你的本地配置。

## 📋 完整更新流程

### 步骤 1: 检查当前状态

```bash
cd /var/www/html/knowledge-base-system

# 检查是否是 Git 仓库
git status

# 查看当前分支
git branch

# 查看远程仓库
git remote -v
```

### 步骤 2: 初始化 Git 仓库（如果需要）

如果目录不是 Git 仓库，需要先初始化：

```bash
cd /var/www/html/knowledge-base-system

# 初始化 Git 仓库
git init

# 添加远程仓库
git remote add origin https://github.com/bbstom/knowledge-base-system.git

# 拉取远程代码
git fetch origin

# 设置跟踪分支
git branch --set-upstream-to=origin/main main

# 或者直接切换到 main 分支
git checkout -b main origin/main
```

### 步骤 3: 保存本地修改

```bash
# 查看本地修改
git status

# 方式 A: 暂存本地修改（推荐）
git stash save "保存本地配置 $(date +%Y%m%d_%H%M%S)"

# 方式 B: 提交本地修改
git add .
git commit -m "保存本地配置"
```

### 步骤 4: 拉取最新代码

```bash
# 拉取最新代码
git pull origin main

# 如果有冲突，Git 会提示你
```

### 步骤 5: 恢复本地配置

```bash
# 如果使用了 stash，恢复本地修改
git stash pop

# 如果有冲突，手动解决冲突
# 编辑冲突文件，然后：
git add .
git stash drop
```

### 步骤 6: 更新依赖和重启服务

```bash
# 停止服务
pm2 stop knowledge-base

# 更新后端依赖
cd /var/www/html/knowledge-base-system/server
npm install

# 更新前端依赖
cd /var/www/html/knowledge-base-system
npm install

# 重新构建前端
npm run build

# 重启服务
pm2 restart knowledge-base

# 查看日志
pm2 logs knowledge-base --lines 50
```

## 🚀 一键更新脚本

创建一个自动化更新脚本：

```bash
#!/bin/bash
# 文件名: update.sh

set -e  # 遇到错误立即退出

echo "🚀 开始更新 Knowledge Base System..."

# 进入项目目录
cd /var/www/html/knowledge-base-system

# 1. 备份 .env 文件
echo "📦 备份配置文件..."
cp server/.env server/.env.backup.$(date +%Y%m%d_%H%M%S)

# 2. 停止服务
echo "⏸️  停止服务..."
pm2 stop knowledge-base || true

# 3. 保存本地修改
echo "💾 保存本地修改..."
git stash save "自动保存 $(date +%Y%m%d_%H%M%S)"

# 4. 拉取最新代码
echo "⬇️  拉取最新代码..."
git pull origin main

# 5. 恢复本地修改
echo "🔄 恢复本地配置..."
git stash pop || echo "⚠️  没有需要恢复的修改"

# 6. 更新依赖
echo "📦 更新后端依赖..."
cd server
npm install

echo "📦 更新前端依赖..."
cd ..
npm install

# 7. 构建前端
echo "🔨 构建前端..."
npm run build

# 8. 重启服务
echo "▶️  重启服务..."
pm2 restart knowledge-base

# 9. 查看状态
echo "✅ 更新完成！"
pm2 status knowledge-base

echo ""
echo "📋 查看日志："
echo "pm2 logs knowledge-base"
```

保存并使用：

```bash
# 创建脚本
nano /var/www/html/knowledge-base-system/update.sh

# 粘贴上面的脚本内容，保存退出

# 添加执行权限
chmod +x /var/www/html/knowledge-base-system/update.sh

# 运行更新
./update.sh
```

## 🔧 处理常见问题

### 问题 1: 本地有未提交的修改

```bash
# 查看修改
git status

# 选项 A: 暂存修改
git stash

# 选项 B: 放弃修改
git reset --hard HEAD

# 选项 C: 提交修改
git add .
git commit -m "本地修改"
```

### 问题 2: 拉取时出现冲突

```bash
# 拉取代码
git pull origin main

# 如果有冲突，会显示冲突文件
# 手动编辑冲突文件，解决冲突标记：
# <<<<<<< HEAD
# 你的修改
# =======
# 远程修改
# >>>>>>> origin/main

# 解决后标记为已解决
git add <冲突文件>
git commit -m "解决冲突"
```

### 问题 3: 强制使用远程版本

```bash
# 完全放弃本地修改，使用远程版本
git fetch origin
git reset --hard origin/main

# ⚠️ 注意：这会丢失所有本地修改！
# 建议先备份 .env 文件
```

### 问题 4: .env 文件被覆盖

```bash
# 恢复 .env 文件
cp server/.env.backup.YYYYMMDD_HHMMSS server/.env

# 或者从 stash 中恢复
git checkout stash@{0} -- server/.env
```

## 📝 保护重要文件

创建 `.gitignore` 确保重要文件不被覆盖：

```bash
# 编辑 .gitignore
nano /var/www/html/knowledge-base-system/.gitignore

# 添加以下内容：
server/.env
server/backups/
server/uploads/
server/logs/
node_modules/
dist/
.DS_Store
```

## 🔄 定期更新建议

### 每周更新流程

```bash
# 1. 进入项目目录
cd /var/www/html/knowledge-base-system

# 2. 查看远程更新
git fetch origin
git log HEAD..origin/main --oneline

# 3. 如果有更新，执行更新脚本
./update.sh
```

### 自动化定时更新（可选）

```bash
# 创建定时任务
crontab -e

# 添加以下行（每天凌晨 3 点自动更新）
0 3 * * * cd /var/www/html/knowledge-base-system && ./update.sh >> /var/log/kb-update.log 2>&1
```

## ✅ 验证更新

更新完成后，验证系统是否正常：

```bash
# 1. 检查服务状态
pm2 status

# 2. 查看日志
pm2 logs knowledge-base --lines 50

# 3. 测试 API
curl http://localhost:3001/api/health

# 4. 测试前端
curl http://localhost:3001/

# 5. 检查版本
git log -1 --oneline
```

## 🎯 快速命令参考

```bash
# 快速更新（保留本地修改）
cd /var/www/html/knowledge-base-system && \
git stash && \
git pull origin main && \
git stash pop && \
cd server && npm install && \
cd .. && npm install && npm run build && \
pm2 restart knowledge-base

# 快速更新（强制使用远程版本）
cd /var/www/html/knowledge-base-system && \
cp server/.env /tmp/.env.backup && \
git fetch origin && \
git reset --hard origin/main && \
cp /tmp/.env.backup server/.env && \
cd server && npm install && \
cd .. && npm install && npm run build && \
pm2 restart knowledge-base

# 查看更新日志
cd /var/www/html/knowledge-base-system && \
git log --oneline -10

# 回滚到上一个版本
cd /var/www/html/knowledge-base-system && \
git reset --hard HEAD~1 && \
pm2 restart knowledge-base
```

## 🆘 紧急回滚

如果更新后出现问题：

```bash
# 1. 查看提交历史
git log --oneline -10

# 2. 回滚到指定版本
git reset --hard <commit-hash>

# 3. 重启服务
pm2 restart knowledge-base

# 4. 或者回滚到上一个版本
git reset --hard HEAD~1
pm2 restart knowledge-base
```

使用 Git 更新的方式更加专业和安全，强烈推荐！
