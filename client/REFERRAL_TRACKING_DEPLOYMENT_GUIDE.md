# 邀请追踪系统 - 部署指南

## 📋 部署前检查清单

### 1. 环境要求

- ✅ Node.js >= 14.x
- ✅ MongoDB >= 4.4
- ✅ 足够的磁盘空间（建议至少 1GB）

### 2. 依赖包

所有必需的依赖已包含在 `package.json` 中，无需额外安装。

### 3. 数据库配置

确保 MongoDB 连接字符串正确配置在 `.env` 文件中：

```env
MONGODB_URI=mongodb://localhost:27017/yourdb
```

---

## 🚀 部署步骤

### 步骤 1: 验证数据库索引

运行索引验证脚本：

```bash
cd server
node scripts/verifyReferralIndexes.js
```

**预期输出：**
```
✅ 数据库连接成功

📊 当前索引列表:
============================================================

1. _id_
   键: {"_id":1}

2. referralCode_1
   键: {"referralCode":1}

3. fingerprint_1
   键: {"fingerprint":1}

... (更多索引)

✅ 所有必需索引都已创建
✅ 数据库查询性能已优化
```

**如果索引缺失：**

在 MongoDB shell 或通过代码同步索引：

```javascript
// 方法 1: 使用 MongoDB shell
use yourdb
db.referralvisits.getIndexes()

// 方法 2: 使用 Node.js
const ReferralVisit = require('./models/ReferralVisit');
await ReferralVisit.syncIndexes();
```

### 步骤 2: 测试邀请追踪功能

#### 2.1 测试追踪 API

```bash
# 测试追踪邀请访问
curl -X POST http://localhost:3001/api/referral/track \
  -H "Content-Type: application/json" \
  -d '{
    "referralCode": "TEST123",
    "fingerprint": "test_fp_123456"
  }'
```

**预期响应：**
```json
{
  "success": true,
  "message": "访问记录已保存"
}
```

#### 2.2 测试查询 API

```bash
# 测试获取邀请码
curl -X POST http://localhost:3001/api/referral/get-code \
  -H "Content-Type: application/json" \
  -d '{
    "fingerprint": "test_fp_123456"
  }'
```

**预期响应：**
```json
{
  "success": true,
  "referralCode": "TEST123"
}
```

### 步骤 3: 测试注册转化

1. 访问邀请链接：`http://localhost:5173?ref=TEST123`
2. 检查浏览器控制台，应该看到：
   ```
   [Referral] Visit tracked successfully: TEST123
   [Referral] Cookie set successfully
   [Referral] LocalStorage set successfully
   ```
3. 注册新用户
4. 检查服务器日志，应该看到：
   ```
   ✅ 标记 1 条邀请访问记录为已转化
   ```

### 步骤 4: 验证速率限制

快速连续发送多个请求：

```bash
# 发送 15 个请求（超过限制的 10 次）
for i in {1..15}; do
  curl -X POST http://localhost:3001/api/referral/track \
    -H "Content-Type: application/json" \
    -d '{"referralCode":"TEST","fingerprint":"fp"}' &
done
wait
```

**预期结果：**
- 前 10 个请求成功
- 后 5 个请求返回 429 Too Many Requests

### 步骤 5: 运行性能监控

```bash
node scripts/monitorReferralPerformance.js
```

**检查输出：**
- 转化率是否合理
- 是否有无效邀请码
- 是否有异常的设备指纹

---

## 🔧 配置选项

### 1. Cookie 有效期

在 `src/utils/referralTracking.ts` 中修改：

```typescript
const COOKIE_DAYS = 30; // 修改为所需天数
```

### 2. 数据过期时间

在 `server/models/ReferralVisit.js` 中修改：

```javascript
expiresAt: {
  type: Date,
  default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 修改天数
  index: true
}
```

### 3. 速率限制

在 `server/routes/referral.js` 中修改：

```javascript
// 追踪 API：每分钟10次
router.post('/track', rateLimit('referral_track', 60, 10), ...);

// 查询 API：每分钟20次
router.post('/get-code', rateLimit('referral_get_code', 60, 20), ...);
```

### 4. 超时时间

在 `src/utils/referralTracking.ts` 中修改：

```typescript
// 追踪请求超时：10秒
const timeoutId = setTimeout(() => controller.abort(), 10000);

// 查询请求超时：5秒
const timeoutId = setTimeout(() => controller.abort(), 5000);
```

---

## 📊 监控和维护

### 1. 日常监控

**每天运行一次性能监控：**

```bash
# 添加到 crontab
0 2 * * * cd /path/to/server && node scripts/monitorReferralPerformance.js >> logs/referral-monitor.log 2>&1
```

**关键指标：**
- 转化率（建议 > 5%）
- 活跃记录数（建议 < 10000）
- 无效邀请码数量（建议 = 0）

### 2. 数据清理

TTL 索引会自动清理过期数据，但如果需要手动清理：

```javascript
// 清理已过期的记录
db.referralvisits.deleteMany({
  converted: false,
  expiresAt: { $lte: new Date() }
});

// 清理无效邀请码的记录
const invalidCodes = await ReferralVisit.aggregate([
  {
    $lookup: {
      from: 'users',
      localField: 'referralCode',
      foreignField: 'referralCode',
      as: 'user'
    }
  },
  {
    $match: { user: { $size: 0 } }
  }
]);

await ReferralVisit.deleteMany({
  referralCode: { $in: invalidCodes.map(c => c._id) }
});
```

### 3. 日志监控

**关键日志关键词：**
- `[Referral]` - 所有邀请追踪相关日志
- `Visit tracked` - 追踪成功
- `Code retrieved` - 邀请码获取
- `标记.*条邀请访问记录为已转化` - 转化成功

**使用 grep 过滤日志：**

```bash
# 查看所有邀请追踪日志
tail -f logs/app.log | grep "\[Referral\]"

# 查看转化记录
tail -f logs/app.log | grep "标记.*转化"

# 查看错误
tail -f logs/app.log | grep -i "referral.*error"
```

---

## 🐛 故障排查

### 问题 1: 邀请码无法追踪

**症状：** 访问邀请链接后，Cookie 和 LocalStorage 中没有邀请码

**排查步骤：**

1. 检查浏览器控制台是否有错误
2. 检查 URL 参数是否正确：`?ref=CODE`
3. 检查 Cookie 是否被浏览器禁用
4. 检查 LocalStorage 是否可用

**解决方案：**

```javascript
// 在浏览器控制台测试
document.cookie = "test=1";
console.log(document.cookie); // 应该显示 "test=1"

localStorage.setItem('test', '1');
console.log(localStorage.getItem('test')); // 应该显示 "1"
```

### 问题 2: 注册时无法获取邀请码

**症状：** 注册页面的邀请码字段为空

**排查步骤：**

1. 检查 Cookie 和 LocalStorage
2. 检查服务器 API 是否正常
3. 检查设备指纹是否生成

**解决方案：**

```javascript
// 在浏览器控制台测试
import { getReferralCode, getCachedFingerprint } from './utils/referralTracking';

// 测试设备指纹
const fp = getCachedFingerprint();
console.log('Fingerprint:', fp);

// 测试获取邀请码
const code = await getReferralCode();
console.log('Referral code:', code);
```

### 问题 3: 转化未标记

**症状：** 用户注册成功，但访问记录未标记为已转化

**排查步骤：**

1. 检查服务器日志
2. 检查数据库中的访问记录
3. 检查设备指纹和 IP 是否匹配

**解决方案：**

```javascript
// 在 MongoDB shell 中查询
db.referralvisits.find({
  referralCode: "CODE",
  converted: false
}).pretty();

// 检查是否有匹配的记录
db.referralvisits.find({
  referralCode: "CODE",
  $or: [
    { fingerprint: "FP" },
    { ip: "IP" }
  ]
}).pretty();
```

### 问题 4: 性能问题

**症状：** API 响应缓慢

**排查步骤：**

1. 运行索引验证脚本
2. 检查数据库查询性能
3. 检查活跃记录数量

**解决方案：**

```bash
# 验证索引
node scripts/verifyReferralIndexes.js

# 运行性能监控
node scripts/monitorReferralPerformance.js

# 如果活跃记录过多，调整过期时间
# 或手动清理过期记录
```

### 问题 5: 速率限制过于严格

**症状：** 正常用户被限制

**排查步骤：**

1. 检查速率限制配置
2. 检查 IP 地址是否正确
3. 检查是否有代理或负载均衡

**解决方案：**

```javascript
// 调整速率限制
router.post('/track', rateLimit('referral_track', 60, 20), ...); // 增加到20次

// 或者使用更长的时间窗口
router.post('/track', rateLimit('referral_track', 300, 50), ...); // 5分钟50次
```

---

## 🔒 安全建议

### 1. 数据验证

- ✅ 已实现邀请码格式验证
- ✅ 已实现设备指纹长度限制
- ✅ 已实现参数类型检查

### 2. 速率限制

- ✅ 追踪 API：每分钟 10 次
- ✅ 查询 API：每分钟 20 次
- 💡 建议：根据实际流量调整

### 3. 数据隐私

- ✅ 30 天自动过期
- ✅ 不收集敏感信息
- ✅ 设备指纹匿名化
- 💡 建议：添加隐私政策说明

### 4. 防止滥用

- ✅ 防抖机制
- ✅ 重复追踪检测
- ✅ 无效邀请码验证
- 💡 建议：添加 IP 黑名单

---

## 📈 性能优化建议

### 1. 数据库优化

- ✅ 已创建所有必需索引
- ✅ 使用 lean() 查询
- ✅ 使用 select() 投影
- 💡 建议：定期分析慢查询

### 2. 缓存策略

- ✅ 设备指纹缓存
- 💡 建议：添加 Redis 缓存热门邀请码
- 💡 建议：缓存用户邀请码映射

### 3. 前端优化

- ✅ 异步非阻塞
- ✅ 超时控制
- ✅ 防抖处理
- 💡 建议：使用 Service Worker 离线缓存

---

## 🎯 验收标准

部署完成后，系统应该满足：

- ✅ 用户访问邀请链接，系统自动追踪
- ✅ 邀请码保存到 Cookie、LocalStorage 和服务器
- ✅ 用户注册时自动获取邀请码
- ✅ 注册成功后标记转化
- ✅ 30 天后自动清理过期数据
- ✅ 在各种异常情况下都能正常工作
- ✅ 性能良好，不影响页面加载
- ✅ 安全可靠，保护用户隐私
- ✅ 通过所有测试场景

---

## 📞 技术支持

如果遇到问题，请：

1. 查看本文档的故障排查部分
2. 运行性能监控脚本诊断
3. 检查服务器日志
4. 查看浏览器控制台

---

**部署指南版本**: 1.0  
**最后更新**: 2024-10-24  
**状态**: ✅ 生产就绪
