# 🚨 生产环境PM2紧急修复

## 问题
生产服务器PM2日志显示：`USER_MONGO_URI 未在 .env 中配置`

## 根本原因
`server/index.js` 使用 `require('dotenv').config()` 时没有指定.env文件的绝对路径，导致在生产环境中找不到.env文件。

## ✅ 已修复
已更新 `server/index.js` 第一行，使用绝对路径加载.env文件。

---

## 🎯 立即部署修复（3步）

### 第1步：在生产服务器上更新代码

```bash
# SSH登录到生产服务器
ssh root@your-server

# 进入项目目录
cd /var/www/html/knowledge-base-system/client

# 拉取最新代码（如果使用Git）
git pull origin main

# 或者手动更新server/index.js文件
nano server/index.js
```

### 第2步：确认server/index.js第一行

确保第一行是：
```javascript
// 加载环境变量 - 使用绝对路径确保在任何工作目录下都能找到.env文件
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
```

### 第3步：重启PM2服务

```bash
# 方法1：使用智能启动脚本（推荐）
node start-pm2-with-env.cjs

# 方法2：手动重启
pm2 restart base2

# 查看日志确认
pm2 logs base2 --lines 50
```

---

## ✅ 验证修复

成功的日志应该显示：

```
✓ 用户数据库连接成功
✓ 查询数据库连接成功
服务器运行在 http://0.0.0.0:3001
```

如果看到这些日志，说明修复成功！

---

## 🔍 如果还是失败

### 检查1：确认.env文件存在

```bash
ls -la /var/www/html/knowledge-base-system/client/server/.env
```

应该看到文件存在。

### 检查2：查看.env文件内容

```bash
cat /var/www/html/knowledge-base-system/client/server/.env | grep USER_MONGO_URI
```

应该看到：
```
USER_MONGO_URI=mongodb://...
```

### 检查3：测试环境变量加载

```bash
cd /var/www/html/knowledge-base-system/client
node -e "require('dotenv').config({path:require('path').join(__dirname,'server','.env')}); console.log('USER_MONGO_URI:', process.env.USER_MONGO_URI ? '已加载' : '未加载')"
```

应该显示：`USER_MONGO_URI: 已加载`

### 检查4：完全重启PM2

```bash
# 停止并删除进程
pm2 stop base2
pm2 delete base2

# 使用智能启动脚本
node start-pm2-with-env.cjs

# 或者手动启动
pm2 start server/index.js --name base2

# 查看日志
pm2 logs base2 --lines 50
```

---

## 📋 手动修复步骤（如果无法拉取代码）

### 1. 编辑server/index.js

```bash
cd /var/www/html/knowledge-base-system/client
nano server/index.js
```

### 2. 修改第一行

将：
```javascript
require('dotenv').config();
```

改为：
```javascript
// 加载环境变量 - 使用绝对路径确保在任何工作目录下都能找到.env文件
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
```

### 3. 保存并退出

按 `Ctrl+X`，然后按 `Y`，最后按 `Enter`

### 4. 重启服务

```bash
pm2 restart base2
pm2 logs base2 --lines 50
```

---

## 🔧 技术说明

### 问题原因

当PM2启动应用时：
- 工作目录可能是 `/var/www/html/knowledge-base-system/client`
- 但 `require('dotenv').config()` 会在当前工作目录查找.env
- .env文件实际在 `server/.env`
- 所以找不到文件

### 解决方案

使用 `__dirname` 获取 `server/index.js` 所在目录的绝对路径：
```javascript
require('dotenv').config({ 
  path: require('path').join(__dirname, '.env') 
});
```

这样无论工作目录在哪里，都能正确找到.env文件。

---

## 🚀 快速命令参考

```bash
# 查看PM2状态
pm2 status

# 查看实时日志
pm2 logs base2

# 重启服务
pm2 restart base2

# 完全重启
pm2 stop base2 && pm2 delete base2 && node start-pm2-with-env.cjs

# 查看环境变量
pm2 show base2 | grep env

# 测试数据库连接
node server/scripts/testDatabaseConnection.js
```

---

## ✨ 预防措施

为了避免将来出现类似问题：

1. **始终使用绝对路径加载.env**
   ```javascript
   require('dotenv').config({ path: require('path').join(__dirname, '.env') });
   ```

2. **使用智能启动脚本**
   ```bash
   node start-pm2-with-env.cjs
   ```

3. **定期检查日志**
   ```bash
   pm2 logs base2 --lines 50
   ```

4. **设置监控告警**
   ```bash
   pm2 install pm2-server-monit
   ```

---

**状态：** ✅ 已修复  
**优先级：** 🚨 紧急  
**影响：** 生产环境  
**日期：** 2024-11-09

**下一步：** 在生产服务器上执行第1-3步，然后验证修复！
