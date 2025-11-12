# 数据库配置简化 - 统一使用环境变量

## 改动说明

### 问题
之前的数据库配置支持两种方式：
1. 环境变量（.env文件）
2. 管理后台动态配置（SystemConfig）

这导致了严重的连接时序问题：
- 服务器启动时使用环境变量连接
- 读取SystemConfig发现有配置，重新连接
- 已加载的模型还绑定在旧连接上
- 登录时查询失败：`MongoNotConnectedError`

### 解决方案
**移除管理后台的数据库配置功能，统一使用 `.env` 文件配置**

### 优势
1. ✅ 避免运行时重新连接导致的问题
2. ✅ 配置更安全（不存储在数据库中）
3. ✅ 符合12-Factor App原则
4. ✅ 更容易管理和部署
5. ✅ 减少代码复杂度

---

## 代码改动

### 1. `server/config/database.js`
- 移除 `initializeFromConfig()` 调用
- 改为调用 `initializeFromEnv()`
- 更新注释说明

### 2. `server/config/databaseManager.js`
- 新增 `initializeFromEnv()` 方法
- 从环境变量读取配置
- 移除SystemConfig读取逻辑
- 简化连接流程

### 3. `server/.env`
- 更新注释说明
- 将 `QUERY_MONGO_URI` 改为 `QUERY_MONGO_URIS`（支持多个）
- 添加配置示例

---

## 配置说明

### 环境变量

#### USER_MONGO_URI（必填）
用户数据库连接字符串

```bash
USER_MONGO_URI=mongodb://username:password@host:port/database?authSource=admin
```

#### QUERY_MONGO_URIS（可选）
查询数据库连接字符串，多个数据库用逗号分隔

```bash
# 单个数据库
QUERY_MONGO_URIS=mongodb://host:27017/database1

# 多个数据库
QUERY_MONGO_URIS=mongodb://host1:27017/db1,mongodb://host2:27017/db2,mongodb://host3:27017/db3
```

### 示例配置

```bash
# 用户数据库
USER_MONGO_URI=mongodb://admin:password@localhost:27017/userdata?authSource=admin

# 查询数据库（多个）
QUERY_MONGO_URIS=mongodb://admin:password@localhost:27017/basedata?authSource=admin,mongodb://admin:password@localhost:27017/querydata?authSource=admin
```

---

## 迁移步骤

### 1. 清空SystemConfig中的数据库配置

在生产服务器上执行：

```bash
cd /var/www/html/knowledge-base-system/client/server
node scripts/clearDatabaseConfig.js
```

### 2. 更新代码

```bash
cd /var/www/html/knowledge-base-system/client
git pull origin main
```

### 3. 更新 .env 文件

确保 `.env` 文件中有正确的配置：

```bash
# 检查配置
cat server/.env | grep MONGO
```

应该看到：
```
USER_MONGO_URI=mongodb://...
QUERY_MONGO_URIS=mongodb://...
```

### 4. 重启服务

```bash
pm2 restart base2
```

### 5. 验证

查看日志：
```bash
pm2 logs base2 --lines 50
```

应该看到：
```
🚀 开始从环境变量初始化数据库连接...
✅ 用户数据库连接成功
✅ 查询数据库 1 [Basedata] 连接成功
✅ 数据库初始化完成
```

测试登录功能，应该正常工作。

---

## 移除的功能

### 管理后台数据库配置页面

以下功能已移除：
- ❌ 数据库配置页面（`src/pages/Admin/DatabaseConfig.tsx`）
- ❌ 数据库配置API（`server/routes/database.js`）
- ❌ 动态数据库连接功能

**注意：** 这些文件暂时保留，但不再使用。可以在确认系统稳定后删除。

---

## 常见问题

### Q: 如何添加新的查询数据库？

A: 在 `.env` 文件中的 `QUERY_MONGO_URIS` 添加新的连接字符串，用逗号分隔，然后重启服务。

```bash
QUERY_MONGO_URIS=mongodb://host1:27017/db1,mongodb://host2:27017/db2,mongodb://host3:27017/db3
```

### Q: 如何修改数据库密码？

A: 修改 `.env` 文件中的连接字符串，然后重启服务。

### Q: 为什么不支持动态配置？

A: 动态配置会导致运行时重新连接，引发连接时序问题。使用环境变量配置更安全、更稳定。

### Q: 如何在不同环境使用不同配置？

A: 为每个环境准备不同的 `.env` 文件：
- `.env.development` - 开发环境
- `.env.production` - 生产环境
- `.env.test` - 测试环境

部署时使用对应的文件。

---

## 技术细节

### 连接池配置

```javascript
connectionOptions: {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 2,
  retryWrites: true,
  retryReads: true,
  bufferCommands: false,
}
```

### 连接状态监听

系统会自动监听连接状态：
- `connected` - 连接成功
- `error` - 连接错误
- `disconnected` - 连接断开

### 优雅关闭

服务器关闭时会自动关闭所有数据库连接：

```javascript
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
```

---

## 相关文档

- `PRODUCTION_LOGIN_FIX_FINAL.md` - 登录问题修复
- `DATABASE_CONNECTION_DISCONNECT_FIX.md` - 连接断开问题
- `DATABASE_CONNECTION_TIMING_FIX.md` - 连接时序问题
- `server/config/database.js` - 数据库配置模块
- `server/config/databaseManager.js` - 数据库管理器

---

**状态：** ✅ 已完成  
**版本：** 2.0  
**日期：** 2024-11-09  
**影响：** 所有环境
