# 🚨 完整修复方案 - 立即执行

## 问题
登录失败：`MongoNotConnectedError: Client must be connected before running operations`

## 根本原因
SystemConfig 中存储的数据库配置导致运行时重新连接，模型绑定失效。

## 修复步骤

### 步骤 1: 诊断当前状态

```bash
cd /var/www/html/knowledge-base-system/client/server
node scripts/diagnoseLoginIssueNow.js
```

### 步骤 2: 清空 SystemConfig 配置

```bash
node scripts/clearDatabaseConfig.js
```

### 步骤 3: 更新代码（如果还没更新）

```bash
cd /var/www/html/knowledge-base-system/client
git pull origin main
```

### 步骤 4: 检查 .env 配置

```bash
cat server/.env | grep MONGO
```

应该看到：
```
USER_MONGO_URI=mongodb://...
QUERY_MONGO_URIS=mongodb://...
```

如果看到的是 `QUERY_MONGO_URI`（单数），需要改为 `QUERY_MONGO_URIS`（复数）。

### 步骤 5: 重启 PM2

```bash
pm2 restart base2
```

### 步骤 6: 查看日志验证

```bash
pm2 logs base2 --lines 50
```

成功的标志：
```
🚀 开始从环境变量初始化数据库连接...
✅ 用户数据库连接成功
✅ 查询数据库 1 [Basedata] 连接成功
✅ 数据库初始化完成
```

不应该看到：
```
📝 发现数据库配置，检查是否需要重新连接...
```

### 步骤 7: 测试登录

在前端页面测试登录功能。

---

## 一键修复命令

```bash
cd /var/www/html/knowledge-base-system/client/server && \
node scripts/clearDatabaseConfig.js && \
cd .. && \
pm2 restart base2 && \
sleep 5 && \
pm2 logs base2 --lines 50 --nostream
```

---

## 如果还是失败

### 检查 1: 确认代码已更新

```bash
cd /var/www/html/knowledge-base-system/client
git log --oneline -5
```

应该看到最近的提交包含数据库配置简化的改动。

### 检查 2: 确认 .env 配置正确

```bash
cat server/.env | grep -E "USER_MONGO_URI|QUERY_MONGO"
```

### 检查 3: 完全重启 PM2

```bash
pm2 stop base2
pm2 delete base2
pm2 start server/index.js --name base2
pm2 logs base2 --lines 50
```

### 检查 4: 查看完整错误日志

```bash
pm2 logs base2 --err --lines 100
```

---

**立即执行上面的一键修复命令！**
