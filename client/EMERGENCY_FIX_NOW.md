# 紧急修复 - 立即执行

## 问题
生产服务器代码没有更新或PM2缓存了旧代码。

## 立即执行以下命令

### 方案1：强制更新并重启（推荐）

```bash
# 1. 进入项目目录
cd /var/www/html/knowledge-base-system/client

# 2. 检查当前代码版本
git log -1 --oneline

# 3. 强制拉取最新代码
git fetch origin
git reset --hard origin/main

# 4. 完全停止并删除PM2进程
pm2 stop base2
pm2 delete base2
pm2 flush

# 5. 清理node_modules缓存（可选但推荐）
cd server
rm -rf node_modules
npm install

# 6. 返回项目根目录并重新启动
cd /var/www/html/knowledge-base-system/client
pm2 start server/index.js --name base2

# 7. 查看日志
pm2 logs base2 --lines 50
```

### 方案2：如果方案1不行 - 手动修复文件

直接编辑生产服务器上的文件：

```bash
# 编辑databaseManager.js
nano /var/www/html/knowledge-base-system/client/server/config/databaseManager.js
```

找到第268行左右，将整个重新连接块注释掉：

```javascript
// 临时禁用重新连接 - 使用默认连接
/*
if (config.databases.user && config.databases.user.enabled) {
  const configuredURI = this.buildMongoURI(config.databases.user);
  if (configuredURI !== defaultURI) {
    console.log('🔄 使用配置的用户数据库重新连接...');
    // ... 所有重新连接代码
  }
}
*/
```

保存后重启：

```bash
pm2 restart base2
```

### 方案3：临时解决方案 - 清空SystemConfig

如果上面都不行，清空数据库配置让系统只使用.env：

```bash
# 连接MongoDB
mongo

# 或者使用mongosh
mongosh

# 切换到userdata数据库
use userdata

# 删除SystemConfig中的数据库配置
db.systemconfigs.updateOne(
  {},
  { $unset: { "databases": "" } }
)

# 退出
exit
```

然后重启PM2：

```bash
pm2 restart base2
```

## 验证修复

```bash
# 测试登录
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

应该返回成功。

## 如果还是不行

运行诊断：

```bash
cd /var/www/html/knowledge-base-system/client
node server/scripts/diagnoseLoginIssue.js
```

把输出发给我。
