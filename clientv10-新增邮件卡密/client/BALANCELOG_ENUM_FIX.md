# BalanceLog枚举值修复

## 问题
注册时创建BalanceLog记录失败，错误信息：
```
BalanceLog validation failed: type: `register` is not a valid enum value for path `type`.
```

## 原因
BalanceLog模型的type字段是枚举类型，只允许特定的值。原来的枚举值中没有包含：
- `'register'` - 注册奖励
- `'referral_bonus'` - 推荐奖励
- `'daily_claim'` - 每日签到

## 修复内容

### 1. 更新BalanceLog模型
在 `server/models/BalanceLog.js` 中添加新的枚举值：

**修改前**
```javascript
enum: ['recharge', 'recharge_card', 'consume', 'refund', 'commission', 'vip', 'search', 'exchange', 'withdraw', 'commission_to_balance']
```

**修改后**
```javascript
enum: ['recharge', 'recharge_card', 'consume', 'refund', 'commission', 'vip', 'search', 'exchange', 'withdraw', 'commission_to_balance', 'register', 'referral_bonus', 'daily_claim']
```

### 2. 更新类型映射
在 `server/routes/user.js` 的积分历史API中添加新类型的映射：

**修改前**
```javascript
const typeMapping = {
  'recharge': 'recharge',
  'recharge_card': 'recharge',
  'commission': 'referral',
  'search': 'purchase',
  'exchange': 'purchase',
  'vip': 'purchase',
  'refund': 'bonus'
};
```

**修改后**
```javascript
const typeMapping = {
  'recharge': 'recharge',
  'recharge_card': 'recharge',
  'commission': 'referral',
  'search': 'purchase',
  'exchange': 'purchase',
  'vip': 'purchase',
  'refund': 'bonus',
  'register': 'bonus',           // 注册奖励
  'referral_bonus': 'bonus',     // 推荐奖励
  'daily_claim': 'bonus'         // 每日签到
};
```

## 所有type枚举值说明

| 枚举值 | 说明 | 前端显示类型 |
|--------|------|-------------|
| recharge | 充值 | recharge（充值） |
| recharge_card | 充值卡充值 | recharge（充值） |
| consume | 消费 | purchase（消费） |
| refund | 退款 | bonus（奖励） |
| commission | 佣金收入 | referral（推荐） |
| vip | VIP购买 | purchase（消费） |
| search | 搜索消费 | purchase（消费） |
| exchange | 积分兑换 | purchase（消费） |
| withdraw | 提现 | - |
| commission_to_balance | 佣金转余额 | - |
| **register** | **注册奖励** | **bonus（奖励）** |
| **referral_bonus** | **推荐奖励** | **bonus（奖励）** |
| **daily_claim** | **每日签到** | **bonus（奖励）** |

## 使用场景

### register - 注册奖励
```javascript
await BalanceLog.create({
  userId: user._id,
  type: 'register',
  currency: 'points',
  amount: 100,
  balanceBefore: 0,
  balanceAfter: 100,
  description: '注册奖励'
});
```

### referral_bonus - 推荐奖励
```javascript
await BalanceLog.create({
  userId: referrer._id,
  type: 'referral_bonus',
  currency: 'points',
  amount: 100,
  balanceBefore: pointsBefore,
  balanceAfter: pointsAfter,
  description: `推荐用户 ${username} 注册奖励`,
  relatedUserId: newUser._id
});
```

### daily_claim - 每日签到
```javascript
await BalanceLog.create({
  userId: user._id,
  type: 'daily_claim',
  currency: 'points',
  amount: 10,
  balanceBefore: pointsBefore,
  balanceAfter: pointsAfter,
  description: '每日签到奖励'
});
```

## 是否需要重启服务器？

**需要**！因为修改了模型定义（server/models/BalanceLog.js），需要重启Node.js服务器才能生效。

重启命令：
```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
npm run dev
# 或
node server/index.js
```

## 修复后的效果

重启服务器后：
- ✅ 新用户注册时可以正常创建积分记录
- ✅ 推荐人可以正常获得推荐奖励记录
- ✅ 每日签到功能可以正常创建记录
- ✅ 所有记录在积分中心正确显示

## 文件修改
- ✅ `server/models/BalanceLog.js` - 添加新的type枚举值
- ✅ `server/routes/user.js` - 更新typeMapping
- ✅ `server/routes/auth.js` - 使用新的type值创建记录

## 总结
修复了BalanceLog模型的type枚举值，添加了register、referral_bonus、daily_claim三个新类型，使注册奖励和推荐奖励可以正常记录。需要重启服务器才能生效。
