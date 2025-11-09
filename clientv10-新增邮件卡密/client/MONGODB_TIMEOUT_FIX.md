# MongoDB 连接超时问题修复

## 🐛 问题描述

服务器日志显示 MongoDB 操作超时错误：

```
Operation `ratelimits.findOne()` buffering timed out after 10000ms
Operation `verificationcodes.deleteMany()` buffering timed out after 10000ms
```

## 🔍 根本原因

1. **数据库连接配置不完善**
   - 缺少 `bufferCommands: false` 配置
   - 超时时间设置过短（5秒）
   - 缺少 `connectTimeoutMS` 配置

2. **模型使用错误的连接**
   - `RateLimit` 和 `VerificationCode` 模型使用默认的 `mongoose` 连接
   - 应该使用 `userConnection` 连接

## ✅ 解决方案

### 1. 优化数据库连接配置

**文件：** `server/config/database.js`

**修改前：**
```javascript
const connectionOptions = {
  serverSelectionTimeoutMS: 5000,  // 5秒太短
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 2,
  retryWrites: true,
  retryReads: true,
  // 缺少 bufferCommands 和 connectTimeoutMS
};
```

**修改后：**
```javascript
const connectionOptions = {
  serverSelectionTimeoutMS: 30000, // 增加到30秒
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,         // 新增：连接超时30秒
  maxPoolSize: 10,
  minPoolSize: 2,
  retryWrites: true,
  retryReads: true,
  bufferCommands: false,           // 新增：禁用命令缓冲
};
```

### 2. 修复 RateLimit 模型

**文件：** `server/models/RateLimit.js`

**修改前：**
```javascript
const mongoose = require('mongoose');
const rateLimitSchema = new mongoose.Schema({...});
const RateLimit = mongoose.model('RateLimit', rateLimitSchema);
```

**修改后：**
```javascript
const mongoose = require('mongoose');
const { userConnection } = require('../config/database');
const rateLimitSchema = new mongoose.Schema({...});
const RateLimit = userConnection.model('RateLimit', rateLimitSchema);
```

**注意：** Schema 仍然使用 `mongoose.Schema`，只有 model 使用 `userConnection.model`

### 3. 修复 VerificationCode 模型

**文件：** `server/models/VerificationCode.js`

**修改前：**
```javascript
const mongoose = require('mongoose');
const verificationCodeSchema = new mongoose.Schema({...});
const VerificationCode = mongoose.model('VerificationCode', verificationCodeSchema);
```

**修改后：**
```javascript
const mongoose = require('mongoose');
const { userConnection } = require('../config/database');
const verificationCodeSchema = new mongoose.Schema({...});
const VerificationCode = userConnection.model('VerificationCode', verificationCodeSchema);
```

**注意：** Schema 仍然使用 `mongoose.Schema`，只有 model 使用 `userConnection.model`

## 📋 配置说明

### bufferCommands: false

**作用：** 禁用 Mongoose 的命令缓冲机制

**为什么需要：**
- 默认情况下，Mongoose 会缓冲命令直到连接建立
- 如果连接失败，命令会一直缓冲直到超时（默认10秒）
- 设置为 `false` 后，连接失败会立即返回错误，而不是等待超时

### serverSelectionTimeoutMS: 30000

**作用：** 服务器选择超时时间

**为什么增加：**
- 原来的5秒对于网络不稳定的环境太短
- 30秒给予足够的时间建立连接
- 特别是在远程数据库或网络延迟较高的情况下

### connectTimeoutMS: 30000

**作用：** 初始连接超时时间

**为什么需要：**
- 控制建立新连接的最大等待时间
- 防止连接请求无限期挂起
- 与 `serverSelectionTimeoutMS` 配合使用

## 🎯 影响范围

### 修复的功能

1. ✅ 邮件验证码发送
2. ✅ 密码重置功能
3. ✅ 登录验证码
4. ✅ 频率限制检查
5. ✅ 所有需要验证码的操作

### 不受影响的功能

- 用户登录/注册（使用 User 模型）
- 充值/提现（使用其他模型）
- 搜索功能（使用 queryConnection）
- 其他业务功能

## 🔧 验证步骤

### 1. 重启服务器

```bash
# Windows
cd server
npm start

# Linux/Mac
cd server
npm start
```

### 2. 测试验证码功能

访问忘记密码页面，尝试发送验证码：
- 应该能成功发送
- 不应该出现超时错误
- 日志中应该显示数据库连接成功

### 3. 检查日志

正常的日志应该显示：
```
✅ 用户数据库连接成功
✅ 查询数据库连接成功
```

不应该再出现：
```
❌ Operation buffering timed out
```

## 📊 性能影响

### 优化前
- 连接失败：等待10秒超时
- 用户体验：长时间无响应
- 错误提示：延迟显示

### 优化后
- 连接失败：立即返回错误（bufferCommands: false）
- 用户体验：快速反馈
- 错误提示：及时显示
- 成功连接：有足够时间建立连接（30秒）

## 🚨 注意事项

### 1. 数据库连接字符串

确保 `.env` 文件中的数据库连接字符串正确：

```env
USER_MONGO_URI=mongodb://username:password@host:port/database?authSource=admin
```

### 2. 网络连接

- 确保服务器能访问 MongoDB 服务器
- 检查防火墙设置
- 验证 MongoDB 服务是否运行

### 3. 认证信息

- 用户名和密码正确
- 用户有足够的权限
- authSource 设置正确

## 🔄 回滚方案

如果修复后出现问题，可以回滚：

### 1. 恢复 database.js

```javascript
const connectionOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 2,
  retryWrites: true,
  retryReads: true,
};
```

### 2. 恢复模型文件

```javascript
const mongoose = require('mongoose');
const RateLimit = mongoose.model('RateLimit', rateLimitSchema);
```

## 📝 总结

### 修复的文件
1. ✅ `server/config/database.js` - 优化连接配置
2. ✅ `server/models/RateLimit.js` - 使用正确的连接
3. ✅ `server/models/VerificationCode.js` - 使用正确的连接
4. ✅ `server/models/EmailTemplate.js` - 使用正确的连接

### 解决的问题
1. ✅ MongoDB 操作超时
2. ✅ 验证码功能失败
3. ✅ 频率限制检查失败
4. ✅ 连接错误处理不及时

### 改进的体验
1. ✅ 更快的错误反馈
2. ✅ 更稳定的数据库连接
3. ✅ 更好的用户体验
4. ✅ 更清晰的错误信息

---

**修复完成！** 重启服务器后，MongoDB 超时问题应该已经解决。
