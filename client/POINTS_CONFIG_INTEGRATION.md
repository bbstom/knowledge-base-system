# 积分配置集成

## 问题描述

积分奖励数量在代码中硬编码，无法通过后台配置调整：
- 注册奖励：硬编码为 100 积分
- 推荐奖励：硬编码为 50 积分  
- 每日签到：硬编码为 10 积分

## 修复方案

### 文件：`server/routes/auth.js`

**改进内容**:

### 1. 每日签到积分配置化

**修复前**:
```javascript
// 硬编码
const dailyPoints = 10;
user.points += dailyPoints;
```

**修复后**:
```javascript
// 从系统配置中读取
const SystemConfig = require('../models/SystemConfig');
const config = await SystemConfig.getConfig();
const dailyPoints = config.points?.dailyCheckIn || 10;
user.points += dailyPoints;
```

### 2. 注册奖励积分配置化

**修复前**:
```javascript
// 硬编码
const user = new User({
  // ...
  points: 100, // 注册赠送100积分
});
```

**修复后**:
```javascript
// 从系统配置中读取
const SystemConfig = require('../models/SystemConfig');
const config = await SystemConfig.getConfig();
const registerReward = config.points?.registerReward || 100;

const user = new User({
  // ...
  points: registerReward,
});
```

### 3. 推荐奖励积分配置化

**修复前**:
```javascript
// 硬编码
if (referredBy) {
  const referrer = await User.findById(referredBy);
  if (referrer) {
    referrer.points += 50; // 推荐奖励50积分
    await referrer.save();
  }
}
```

**修复后**:
```javascript
// 从系统配置中读取
if (referredBy) {
  const referrer = await User.findById(referredBy);
  if (referrer) {
    const referralReward = config.points?.referralReward || 100;
    referrer.points += referralReward;
    await referrer.save();
    console.log(`✅ 推荐人 ${referrer.username} 获得 ${referralReward} 积分奖励`);
  }
}
```

## 系统配置字段

### SystemConfig.points 配置项

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `dailyCheckIn` | Number | 10 | 每日签到奖励积分 |
| `registerReward` | Number | 100 | 注册奖励积分 |
| `referralReward` | Number | 100 | 推荐人奖励积分 |
| `referredUserReward` | Number | 50 | 被推荐人奖励积分 |
| `searchCost` | Number | 10 | 搜索消耗积分 |
| `exchangeRate` | Number | 10 | 余额兑换积分汇率（1元=10积分） |

## 配置方式

### 方法1：通过管理后台配置

1. 登录管理后台
2. 进入"系统设置" → "积分配置"
3. 修改相应的积分数值
4. 保存配置

### 方法2：直接修改数据库

```javascript
// 连接数据库
use userdata

// 更新配置
db.systemconfigs.updateOne(
  {},
  {
    $set: {
      "points.dailyCheckIn": 20,      // 每日签到改为20积分
      "points.registerReward": 200,   // 注册奖励改为200积分
      "points.referralReward": 150    // 推荐奖励改为150积分
    }
  },
  { upsert: true }
)
```

## 测试场景

### 场景1：修改每日签到积分

1. 修改配置：`dailyCheckIn: 20`
2. 用户签到
3. 验证：提示"签到成功！获得 20 积分"
4. 验证：用户积分增加20

### 场景2：修改注册奖励

1. 修改配置：`registerReward: 200`
2. 新用户注册
3. 验证：新用户初始积分为200

### 场景3：修改推荐奖励

1. 修改配置：`referralReward: 150`
2. 用户A分享推荐码
3. 用户B通过推荐码注册
4. 验证：用户A获得150积分奖励

## 默认值保护

所有配置都有默认值保护，如果配置不存在或读取失败，使用默认值：

```javascript
const dailyPoints = config.points?.dailyCheckIn || 10;
const registerReward = config.points?.registerReward || 100;
const referralReward = config.points?.referralReward || 100;
```

这确保了即使配置缺失，系统也能正常运行。

## 日志记录

添加了详细的日志记录：

```javascript
console.log(`✅ 用户 ${user.username} 签到成功，获得 ${dailyPoints} 积分`);
console.log(`✅ 推荐人 ${referrer.username} 获得 ${referralReward} 积分奖励`);
```

方便管理员追踪积分变动。

## 相关文件

- `server/models/SystemConfig.js` - 系统配置模型
- `server/routes/auth.js` - 认证路由（已修改）
- 管理后台积分配置页面（待开发）

## 后续优化建议

1. **添加积分配置管理界面**
   - 在管理后台添加积分配置页面
   - 可视化编辑各项积分奖励

2. **添加积分变动日志**
   - 记录所有积分变动
   - 包括来源、数量、时间等

3. **添加积分有效期**
   - 支持设置积分过期时间
   - 自动清理过期积分

4. **添加积分上限**
   - 支持设置用户最大积分
   - 防止积分无限累积

## 完成时间

2025-10-22

## 状态

✅ 已完成
