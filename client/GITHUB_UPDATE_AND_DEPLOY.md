# GitHub更新和生产服务器部署完整指南

## 本次更新内容

### 修复的问题
1. **数据库连接断开问题** - 修复了 `databaseManager.js` 中的重新连接逻辑
2. **登录API 500错误** - 解决了数据库连接导致的登录失败
3. **搜索功能503错误** - 修复了查询数据库连接问题

### 修改的文件
- `server/config/databaseManager.js` - 数据库连接管理器
- `server/.env` - 环境变量配置（需要手动配置）

---

## 第一步：提交代码到GitHub

### 1. 检查Git状态

```bash
git status
```

### 2. 添加修改的文件

```bash
# 添加所有修改
git add .

# 或者只添加特定文件
git add server/config/databaseManager.js
```

### 3. 提交更改

```bash
git commit -m "fix: 修复数据库连接断开导致的登录和搜索失败问题

- 修复databaseManager重新连接逻辑
- 确保新连接成功后才关闭旧连接
- 添加连接失败时的回退机制"
```

### 4. 推送到GitHub

```bash
git push origin main
```

如果是第一次推送或遇到问题：

```bash
# 设置远程仓库（如果还没设置）
git remote add origin https://github.com/your-username/your-repo.git

# 推送并设置上游分支
git push -u origin main
```

---

## 第二步：在生产服务器上更新代码

### 1. SSH连接到生产服务器

```bash
ssh root@your-server-ip
```

### 2. 进入项目目录

```bash
cd /var/www/html/knowledge-base-system/client
```

### 3. 备份当前代码（重要！）

```bash
# 创建备份
cp -r /var/www/html/knowledge-base-system/client /var/www/html/knowledge-base-system/client-backup-$(date +%Y%m%d-%H%M%S)
```

### 4. 拉取最新代码

```bash
# 保存本地修改（如果有）
git stash

# 拉取最新代码
git pull origin main

# 如果有本地修改需要恢复
git stash pop
```

### 5. 安装依赖（如果有新依赖）

```bash
# 后端依赖
cd server
npm install

# 前端依赖
cd ..
npm install
```

### 6. 构建前端（如果需要）

```bash
npm run build
```

---

## 第三步：重启生产服务器

### 1. 重启PM2服务

```bash
# 方法1：简单重启
pm2 restart base2

# 方法2：完全重新加载（推荐）
pm2 stop base2
pm2 delete base2
pm2 start server/index.js --name base2

# 查看日志
pm2 logs base2 --lines 50
```

### 2. 验证服务状态

```bash
# 检查PM2状态
pm2 list

# 测试登录API
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

应该返回成功响应：
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "...",
    "user": {...}
  }
}
```

### 3. 检查日志

```bash
# 查看实时日志
pm2 logs base2

# 查看错误日志
pm2 logs base2 --err

# 查看最近100行日志
pm2 logs base2 --lines 100
```

---

## 第四步：验证功能

### 1. 测试登录功能

浏览器访问：`http://your-domain.com`

使用测试账号登录：
- 邮箱：`admin@example.com`
- 密码：`admin123`

### 2. 测试搜索功能

登录后，尝试使用搜索功能。

### 3. 检查数据库连接

```bash
# 在服务器上运行诊断脚本
node server/scripts/diagnoseLoginIssue.js
```

应该看到：
- ✅ 数据库连接成功
- ✅ 找到测试用户
- ✅ 密码验证正确

---

## 故障排除

### 问题1：Git拉取失败

```bash
# 查看冲突文件
git status

# 放弃本地修改
git reset --hard origin/main

# 或者解决冲突后
git add .
git commit -m "resolve conflicts"
```

### 问题2：PM2重启后仍然报错

```bash
# 查看详细错误
pm2 logs base2 --err --lines 100

# 完全清理并重启
pm2 stop base2
pm2 delete base2
pm2 flush  # 清理日志
pm2 start server/index.js --name base2
```

### 问题3：数据库连接仍然失败

检查 `server/.env` 文件：

```bash
cat server/.env | grep MONGO_URI
```

确保密码中的特殊字符已URL编码：
- `!` → `%21`
- `@` → `%40`
- `#` → `%23`
- `&` → `%26`

### 问题4：前端无法访问

```bash
# 检查Nginx配置
nginx -t

# 重启Nginx
systemctl restart nginx

# 查看Nginx日志
tail -f /var/log/nginx/error.log
```

---

## 回滚方案

如果更新后出现问题，可以快速回滚：

```bash
# 1. 停止当前服务
pm2 stop base2

# 2. 恢复备份
rm -rf /var/www/html/knowledge-base-system/client
cp -r /var/www/html/knowledge-base-system/client-backup-YYYYMMDD-HHMMSS /var/www/html/knowledge-base-system/client

# 3. 重启服务
cd /var/www/html/knowledge-base-system/client
pm2 start server/index.js --name base2
```

---

## 完成检查清单

- [ ] 代码已提交到GitHub
- [ ] 生产服务器已拉取最新代码
- [ ] PM2服务已重启
- [ ] 登录功能正常
- [ ] 搜索功能正常
- [ ] 数据库连接稳定
- [ ] 没有错误日志
- [ ] 前端可以正常访问

---

## 后续监控

### 持续监控日志

```bash
# 实时查看日志
pm2 logs base2

# 或者使用PM2 Plus（可选）
pm2 plus
```

### 设置日志轮转

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 需要帮助？

如果遇到问题：
1. 查看 `pm2 logs base2 --lines 100`
2. 运行诊断脚本 `node server/scripts/diagnoseLoginIssue.js`
3. 检查数据库连接 `mongo` 或 `mongosh`
4. 联系技术支持并提供日志信息
