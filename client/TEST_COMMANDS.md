# 邀请追踪系统 - 测试命令速查

## 🚀 快速测试（3步）

```bash
# 步骤1: 初始化（首次运行）
cd server
npm run test:referral:init

# 步骤2: 启动服务器
npm start

# 步骤3: 运行完整测试（新终端）
npm run test:referral
```

---

## 📋 所有可用命令

### NPM 脚本

```bash
# 初始化系统和基本测试
npm run test:referral:init

# 快速检查系统状态
npm run test:referral:quick

# 完整功能测试（需要服务器运行）
npm run test:referral
```

### 直接运行脚本

```bash
# 初始化
node server/scripts/initAndTestReferral.js

# 快速检查
node server/scripts/quickTestReferral.js

# 完整测试
node server/scripts/testReferralSystem.js

# 性能监控
node server/scripts/monitorReferralPerformance.js

# 索引验证
node server/scripts/verifyReferralIndexes.js
```

---

## 🧪 手动测试命令

### 使用 curl

```bash
# 1. 追踪访问
curl -X POST http://localhost:3001/api/referral/track \
  -H "Content-Type: application/json" \
  -d '{"referralCode":"2D371H","fingerprint":"test_fp_001"}'

# 2. 获取邀请码
curl -X POST http://localhost:3001/api/referral/get-code \
  -H "Content-Type: application/json" \
  -d '{"fingerprint":"test_fp_001"}'

# 3. 注册新用户（带邀请码）
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"testuser123",
    "email":"test123@example.com",
    "password":"Test123456",
    "referralCode":"2D371H"
  }'
```

### 使用 PowerShell

```powershell
# 1. 追踪访问
Invoke-RestMethod -Uri "http://localhost:3001/api/referral/track" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"referralCode":"2D371H","fingerprint":"test_fp_001"}'

# 2. 获取邀请码
Invoke-RestMethod -Uri "http://localhost:3001/api/referral/get-code" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"fingerprint":"test_fp_001"}'

# 3. 注册新用户
Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"username":"testuser123","email":"test123@example.com","password":"Test123456","referralCode":"2D371H"}'
```

---

## 🔍 数据库查询命令

### MongoDB Shell

```javascript
// 连接数据库
use userdata

// 查看访问记录
db.referralvisits.find().pretty()

// 查看有邀请码的用户
db.users.find({ referralCode: { $exists: true } }).pretty()

// 查看推荐统计
db.users.find({ 
  "referralStats.totalReferrals": { $gt: 0 } 
}).pretty()

// 查看佣金记录
db.balancelogs.find({ type: "referral_reward" }).pretty()

// 统计数据
db.referralvisits.countDocuments()
db.referralvisits.countDocuments({ converted: true })
```

---

## 📊 监控命令

```bash
# 查看服务器日志
tail -f logs/app.log

# 查看邀请相关日志
grep "Referral" logs/app.log

# 统计今天的转化数
grep "Referral conversion" logs/app.log | grep "$(date +%Y-%m-%d)" | wc -l

# 查看错误
grep "ERROR" logs/app.log | grep "referral"
```

---

## 🎯 测试场景

### 场景1: 完整邀请流程

```bash
# 1. 追踪访问
curl -X POST http://localhost:3001/api/referral/track \
  -H "Content-Type: application/json" \
  -d '{"referralCode":"2D371H","fingerprint":"scenario1_fp"}'

# 2. 获取邀请码（验证）
curl -X POST http://localhost:3001/api/referral/get-code \
  -H "Content-Type: application/json" \
  -d '{"fingerprint":"scenario1_fp"}'

# 3. 注册（转化）
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"scenario1_user",
    "email":"scenario1@test.com",
    "password":"Test123456",
    "referralCode":"2D371H"
  }'
```

### 场景2: 重复访问测试

```bash
# 多次追踪同一个 fingerprint
for i in {1..5}; do
  curl -X POST http://localhost:3001/api/referral/track \
    -H "Content-Type: application/json" \
    -d '{"referralCode":"2D371H","fingerprint":"repeat_test_fp"}'
  sleep 1
done
```

### 场景3: 并发测试

```bash
# 使用 Apache Bench
ab -n 100 -c 10 -p track.json -T application/json \
   http://localhost:3001/api/referral/track

# track.json 内容:
# {"referralCode":"2D371H","fingerprint":"ab_test"}
```

---

## ✅ 验证命令

### 检查服务器状态

```bash
# 检查服务器是否运行
curl http://localhost:3001/health

# 检查 API 响应
curl http://localhost:3001/api/referral/track -I
```

### 检查数据库连接

```bash
# 运行快速检查
npm run test:referral:quick
```

### 检查日志

```bash
# Windows
type logs\app.log | findstr "Referral"

# Linux/Mac
grep "Referral" logs/app.log
```

---

## 🐛 调试命令

### 查看详细错误

```bash
# 启动服务器（详细模式）
NODE_ENV=development npm start

# 查看最近的错误
tail -n 50 logs/error.log
```

### 测试数据库连接

```bash
node server/scripts/testDatabaseConnection.js
```

### 检查用户数据

```bash
node server/scripts/checkReferralData.js
```

---

## 📝 常用组合

### 完整测试流程

```bash
# 1. 初始化
npm run test:referral:init

# 2. 启动服务器（终端1）
npm start

# 3. 运行测试（终端2）
npm run test:referral

# 4. 检查结果
npm run test:referral:quick
```

### 快速验证

```bash
# 一键检查系统状态
npm run test:referral:quick
```

### 性能测试

```bash
# 1. 启动服务器
npm start

# 2. 运行性能监控
node server/scripts/monitorReferralPerformance.js
```

---

## 🎨 可用的测试邀请码

根据初始化脚本的输出，当前可用的邀请码：

```
1. 2D371H (用户: kailsay)
2. 4W3H0B (用户: aabbp)
3. 4ZSQON (用户: abblkd)
```

使用这些邀请码进行测试。

---

## 📞 需要帮助？

- 详细文档: `REFERRAL_TESTING_GUIDE.md`
- 快速开始: `REFERRAL_QUICK_START.md`
- 系统说明: `REFERRAL_TRACKING_SYSTEM_COMPLETE.md`
