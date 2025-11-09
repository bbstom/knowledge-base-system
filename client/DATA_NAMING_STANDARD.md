# 系统数据命名规范 (完整版)

> 本文档定义了整个系统中所有数据字段、变量、类型的统一命名规范
> 
> **重要**: 所有开发工作必须遵循此规范，确保前后端命名一致

---

## 📊 核心概念定义

### 1. 积分系统 (Points)

#### User 字段
- `points` - 用户当前积分余额

#### BalanceLog 类型 (currency: 'points')
- `register` - 注册奖励积分
- `referral_bonus` - 推荐注册奖励积分（推荐人获得）
- `referral_reward` - 被推荐奖励积分（被推荐人获得）
- `daily_claim` - 每日签到积分
- `recharge` - 充值获得积分
- `consume` - 消费扣除积分
- `exchange` - 积分兑换余额（扣除）

**说明**: 积分用于系统内消费，不可提现

---

### 2. 余额系统 (Balance)

#### User 字段
- `balance` - 用户当前余额

#### BalanceLog 类型 (currency: 'balance')
- `recharge` - 充值余额
- `recharge_card` - 充值卡充值
- `exchange` - 积分兑换余额（增加）
- `balance_income` - 佣金转入余额
- `consume` - 消费扣除余额
- `refund` - 退款
- `vip` - VIP 购买扣除

**说明**: 余额可用于消费和购买 VIP

---

### 3. 佣金系统 (Commission)

#### User 字段
- `commission` - 用户当前佣金余额（仅用于显示，实际从 BalanceLog 计算）

#### BalanceLog 类型 (currency: 'commission')
- `commission` - 消费佣金收入（下级用户消费产生）
- `commission_to_balance` - 佣金转入余额（扣除）
- `commission_withdraw` - 佣金提现到 USDT（扣除）
- `withdraw` - 提现（扣除，旧类型）

#### 佣金状态分类

##### 3.1 总佣金 (Total Commission)
- **字段名**: `totalCommission`
- **说明**: 用户累计获得的所有佣金收入
- **计算**: 所有 `type: 'commission'` 且 `amount > 0` 的记录总和
- **前端显示**: "总佣金" / "累计收益"

##### 3.2 可提现佣金 (Available Commission)
- **字段名**: `availableCommission`
- **说明**: 当前可以提现的佣金金额
- **计算**: `totalCommission - totalWithdrawn - pendingCommission`
- **前端显示**: "可提现" / "可用佣金"

##### 3.3 已提现佣金 (Total Withdrawn)
- **字段名**: `totalWithdrawn`
- **说明**: 已经成功提现的佣金总额
- **计算**: 所有 `status: 'completed'` 的提现订单金额总和
- **前端显示**: "已提现" / "已结算"

##### 3.4 待结算佣金 (Pending Commission)
- **字段名**: `pendingCommission`
- **说明**: 正在处理中的提现金额（已申请但未完成）
- **计算**: 所有 `status: 'pending'` 或 `'processing'` 的提现订单金额总和
- **前端显示**: "待结算" / "处理中"

#### 佣金来源
- **下级用户消费** → 上级获得佣金
- **多级佣金**: 一级、二级、三级（根据配置）

#### 佣金用途
1. **提现到余额** - 即时到账，可用于消费
2. **提现到 USDT** - 需要审核，转到外部钱包

**说明**: 佣金是推广收益，可以提现

---

## 📋 完整的 BalanceLog 类型枚举

```javascript
type: {
  type: String,
  enum: [
    // 积分相关
    'register',              // 注册奖励
    'referral_bonus',        // 推荐注册奖励（推荐人）
    'referral_reward',       // 被推荐奖励（被推荐人）
    'daily_claim',           // 每日签到
    
    // 充值相关
    'recharge',              // 充值
    'recharge_card',         // 充值卡
    
    // 消费相关
    'consume',               // 消费
    'refund',                // 退款
    'search',                // 搜索消费
    
    // 兑换相关
    'exchange',              // 积分兑换余额
    
    // VIP相关
    'vip',                   // VIP购买
    
    // 佣金相关
    'commission',            // 佣金收入
    'commission_to_balance', // 佣金转余额
    'commission_withdraw',   // 佣金提现
    'withdraw',              // 提现（通用）
    
    // 余额相关
    'balance_income'         // 余额收入
  ],
  required: true
}
```

---

## 🎯 数据流转图

### 积分流转
```
注册 → register (积分+)
推荐注册 → referral_bonus (积分+)
被推荐 → referral_reward (积分+)
签到 → daily_claim (积分+)
充值 → recharge (积分+)
消费 → consume (积分-)
兑换余额 → exchange (积分-)
```

### 余额流转
```
充值 → recharge (余额+)
充值卡 → recharge_card (余额+)
积分兑换 → exchange (余额+)
佣金转入 → balance_income (余额+)
消费 → consume (余额-)
购买VIP → vip (余额-)
```

### 佣金流转
```
下级消费 → commission (佣金+)
提现到余额 → commission_to_balance (佣金-)
提现到USDT → commission_withdraw (佣金-)
```

---

## 📊 前后端字段对应

### User 模型字段
```javascript
{
  points: Number,        // 积分余额
  balance: Number,       // 余额
  commission: Number,    // 佣金余额（显示用，实际从 BalanceLog 计算）
  
  // 推荐相关
  referralCode: String,  // 邀请码
  referredBy: ObjectId,  // 推荐人ID
  referralStats: {       // 推荐统计
    totalReferrals: Number,   // 总推荐人数
    validReferrals: Number,   // 有效推荐人数
    totalEarnings: Number     // 总收益（积分）
  }
}
```

### 前端显示字段
```typescript
{
  // 积分
  points: number,                    // 当前积分
  
  // 余额
  balance: number,                   // 当前余额
  
  // 佣金
  totalCommission: number,           // 总佣金收入
  availableCommission: number,       // 可提现佣金
  pendingCommission: number,         // 待结算佣金
  totalWithdrawn: number,            // 已提现佣金
  
  // 推荐
  totalReferrals: number,            // 总推荐人数
  validReferrals: number,            // 有效推荐人数
  referralEarnings: number           // 推荐收益（积分）
}
```

---

## 🔑 关键区别

### 积分 vs 余额 vs 佣金

| 项目 | 积分 (Points) | 余额 (Balance) | 佣金 (Commission) |
|------|--------------|---------------|------------------|
| 获得方式 | 注册、签到、推荐、充值 | 充值、兑换、佣金转入 | 下级消费 |
| 用途 | 系统内消费 | 消费、购买VIP | 提现 |
| 可提现 | ❌ 否 | ❌ 否 | ✅ 是 |
| 货币类型 | points | balance | commission |
| 存储字段 | user.points | user.balance | user.commission |

### 积分类型详细对比

| 类型 | 字段名 | BalanceLog.type | 说明 | 前端显示 |
|------|--------|----------------|------|---------|
| 注册积分 | - | `register` | 新用户注册奖励 | "注册奖励" |
| 受邀积分 | - | `referral_reward` | 被推荐人获得的积分 | "受邀奖励" / "新人奖励" |
| 推荐积分 | - | `referral_bonus` | 推荐人获得的积分 | "推荐奖励" / "邀请奖励" |
| 签到积分 | - | `daily_claim` | 每日签到获得 | "签到奖励" / "每日签到" |
| 充值积分 | - | `recharge` | 充值赠送的积分 | "充值赠送" |
| 消费积分 | - | `consume` | 消费扣除的积分 | "消费扣除" |

### 推荐奖励 vs 消费佣金

| 项目 | 推荐注册奖励 | 消费佣金 |
|------|------------|---------|
| 触发条件 | 推荐用户注册 | 下级用户消费 |
| 奖励类型 | 积分 | 佣金 |
| BalanceLog 类型 | referral_bonus | commission |
| 货币类型 | points | commission |
| 可提现 | ❌ 否 | ✅ 是 |
| 前端显示 | "推荐奖励" | "消费佣金" |

### 佣金状态对比

| 状态 | 字段名 | 说明 | 计算方式 | 前端显示 |
|------|--------|------|---------|---------|
| 总佣金 | `totalCommission` | 累计获得的所有佣金 | 所有佣金收入记录总和 | "总佣金" / "累计收益" |
| 可提现佣金 | `availableCommission` | 当前可以提现的金额 | 总佣金 - 已提现 - 待结算 | "可提现" / "可用佣金" |
| 已提现佣金 | `totalWithdrawn` | 已成功提现的金额 | 已完成的提现订单总和 | "已提现" / "已结算" |
| 待结算佣金 | `pendingCommission` | 正在处理的提现金额 | 待审核/处理中的提现订单总和 | "待结算" / "处理中" |

---

## 📝 命名规范

### 后端 (BalanceLog.type)

#### 积分相关
- `register` - 注册奖励
- `referral_bonus` - 推荐注册奖励
- `referral_reward` - 被推荐奖励
- `daily_claim` - 签到奖励

#### 佣金相关
- `commission` - 消费佣金收入
- `commission_to_balance` - 佣金转余额
- `commission_withdraw` - 佣金提现

#### 余额相关
- `balance_income` - 余额收入（佣金转入）

### 前端显示文本

#### 中文
- 注册奖励
- 推荐奖励
- 签到奖励
- 消费佣金
- 佣金转余额
- 佣金提现

#### 英文
- Register Reward
- Referral Bonus
- Daily Claim
- Consumption Commission
- Commission to Balance
- Commission Withdrawal

---

## 🔄 数据计算逻辑

### 可提现佣金计算
```javascript
// 总佣金收入
const commissionIncome = await BalanceLog.find({
  userId,
  type: 'commission',
  currency: 'commission'
});
const totalCommission = sum(commissionIncome.amount);

// 已提现金额（负数记录）
const withdrawnLogs = await BalanceLog.find({
  userId,
  type: { $in: ['commission_to_balance', 'commission_withdraw', 'withdraw'] },
  currency: { $in: ['commission', 'points'] },
  amount: { $lt: 0 }
});
const totalWithdrawn = sum(abs(withdrawnLogs.amount));

// 可提现佣金
const availableCommission = totalCommission - totalWithdrawn;
```

### 推荐统计计算
```javascript
// 总推荐人数
const totalReferrals = await User.countDocuments({
  referredBy: userId
});

// 推荐收益（积分）
const referralEarnings = await BalanceLog.find({
  userId,
  type: 'referral_bonus',
  currency: 'points'
});
const totalEarnings = sum(referralEarnings.amount);
```

---

## ✅ 统一后的命名

### 数据库字段
- `user.points` - 积分
- `user.balance` - 余额
- `user.commission` - 佣金（显示用）

### BalanceLog 类型
- **积分**: `register`, `referral_bonus`, `referral_reward`, `daily_claim`
- **佣金**: `commission`, `commission_to_balance`, `commission_withdraw`
- **余额**: `balance_income`

### API 响应字段
- `totalCommission` - 总佣金收入
- `availableCommission` - 可提现佣金
- `totalWithdrawn` - 已提现佣金
- `pendingCommission` - 待结算佣金

### 前端显示
- 可提现佣金 - availableCommission
- 已提现 - totalWithdrawn
- 待结算 - pendingCommission

---

## 🎯 使用建议

1. **始终使用这个文档作为参考**
2. **新增类型时更新此文档**
3. **前后端保持一致**
4. **注释中说明用途**

---

## 🗂️ 完整的系统变量命名表

### User 模型字段

| 字段名 | 类型 | 说明 | 前端显示 |
|--------|------|------|---------|
| `username` | String | 用户名 | "用户名" |
| `email` | String | 邮箱 | "邮箱" |
| `points` | Number | 当前积分余额 | "积分" |
| `balance` | Number | 当前余额 | "余额" |
| `commission` | Number | 当前佣金余额（显示用） | "佣金" |
| `referralCode` | String | 邀请码 | "邀请码" / "推荐码" |
| `referredBy` | ObjectId | 推荐人ID | - |
| `referralStats.totalReferrals` | Number | 总推荐人数 | "推荐人数" |
| `referralStats.validReferrals` | Number | 有效推荐人数 | "有效推荐" |
| `referralStats.totalEarnings` | Number | 推荐总收益（积分） | "推荐收益" |
| `totalRecharged` | Number | 累计充值金额 | "累计充值" |
| `totalConsumed` | Number | 累计消费金额 | "累计消费" |
| `lastDailyClaimAt` | Date | 最后签到时间 | - |
| `isVip` | Boolean | 是否VIP | "VIP状态" |
| `vipExpireAt` | Date | VIP过期时间 | "VIP到期时间" |

### BalanceLog 字段

| 字段名 | 类型 | 说明 | 前端显示 |
|--------|------|------|---------|
| `userId` | ObjectId | 用户ID | - |
| `type` | String | 记录类型（见下表） | - |
| `currency` | String | 货币类型: points/balance/commission | - |
| `amount` | Number | 金额（正数=增加，负数=减少） | - |
| `description` | String | 描述 | 显示给用户 |
| `relatedUserId` | ObjectId | 关联用户ID（如推荐人） | - |
| `createdAt` | Date | 创建时间 | "时间" |

### BalanceLog.type 完整列表

| type 值 | currency | 说明 | 前端显示 | amount |
|---------|----------|------|---------|--------|
| `register` | points | 注册奖励积分 | "注册奖励" | + |
| `referral_bonus` | points | 推荐注册奖励（推荐人） | "推荐奖励" | + |
| `referral_reward` | points | 被推荐奖励（被推荐人） | "受邀奖励" | + |
| `daily_claim` | points | 每日签到积分 | "签到奖励" | + |
| `recharge` | points/balance | 充值 | "充值" | + |
| `recharge_card` | balance | 充值卡充值 | "充值卡" | + |
| `consume` | points/balance | 消费 | "消费" | - |
| `search` | points/balance | 搜索消费 | "搜索" | - |
| `exchange` | points/balance | 积分兑换余额 | "积分兑换" | -/+ |
| `vip` | balance | VIP购买 | "VIP购买" | - |
| `refund` | balance | 退款 | "退款" | + |
| `commission` | commission | 消费佣金收入 | "消费佣金" | + |
| `commission_to_balance` | commission | 佣金转余额 | "佣金转余额" | - |
| `commission_withdraw` | commission | 佣金提现 | "佣金提现" | - |
| `balance_income` | balance | 余额收入（佣金转入） | "佣金转入" | + |
| `withdraw` | commission | 提现（旧类型） | "提现" | - |

### WithdrawOrder 字段

| 字段名 | 类型 | 说明 | 前端显示 |
|--------|------|------|---------|
| `orderNo` | String | 订单号 | "订单号" |
| `userId` | ObjectId | 用户ID | - |
| `type` | String | 提现类型: balance/commission | - |
| `method` | String | 提现方式: usdt/alipay/wechat | "提现方式" |
| `amount` | Number | 提现金额 | "提现金额" |
| `fee` | Number | 手续费 | "手续费" |
| `actualAmount` | Number | 实际到账金额 | "实际到账" |
| `status` | String | 状态: pending/processing/completed/rejected | "状态" |
| `walletAddress` | String | 钱包地址（USDT） | "钱包地址" |
| `rejectReason` | String | 拒绝原因 | "拒绝原因" |
| `createdAt` | Date | 创建时间 | "申请时间" |
| `processedAt` | Date | 处理时间 | "处理时间" |

### WithdrawOrder.status 状态

| status 值 | 说明 | 前端显示 | 颜色 |
|-----------|------|---------|------|
| `pending` | 待审核 | "待审核" | yellow |
| `processing` | 处理中 | "处理中" | blue |
| `completed` | 已完成 | "已完成" | green |
| `rejected` | 已拒绝 | "已拒绝" | red |

### API 响应字段命名

#### 佣金相关 API
```typescript
{
  totalCommission: number,      // 总佣金收入
  availableCommission: number,  // 可提现佣金
  pendingCommission: number,    // 待结算佣金
  totalWithdrawn: number,       // 已提现佣金
  commissions: Array,           // 佣金记录列表
}
```

#### 推荐相关 API
```typescript
{
  referralCode: string,         // 邀请码
  referralLink: string,         // 邀请链接
  totalReferrals: number,       // 总推荐人数
  validReferrals: number,       // 有效推荐人数
  totalEarnings: number,        // 推荐总收益（积分）
  referredUsers: Array,         // 推荐用户列表
}
```

#### 积分相关 API
```typescript
{
  totalPoints: number,          // 总积分
  availablePoints: number,      // 可用积分
  usedPoints: number,           // 已使用积分
  pointsHistory: Array,         // 积分记录
  canClaimDaily: boolean,       // 是否可签到
  dailyReward: number,          // 签到奖励
}
```

---

## 🎨 前端显示文本规范

### 中文显示文本

| 概念 | 推荐显示文本 | 备选文本 |
|------|------------|---------|
| 积分 | "积分" | "点数" |
| 余额 | "余额" | "账户余额" |
| 佣金 | "佣金" | "推广收益" |
| 总佣金 | "总佣金" | "累计收益" |
| 可提现佣金 | "可提现" | "可用佣金" |
| 已提现佣金 | "已提现" | "已结算" |
| 待结算佣金 | "待结算" | "处理中" |
| 注册积分 | "注册奖励" | "新人奖励" |
| 受邀积分 | "受邀奖励" | "新人礼包" |
| 推荐积分 | "推荐奖励" | "邀请奖励" |
| 签到积分 | "签到奖励" | "每日签到" |
| 消费佣金 | "消费佣金" | "推广佣金" |
| 推荐人数 | "推荐人数" | "邀请人数" |
| 邀请码 | "邀请码" | "推荐码" |

### 英文显示文本

| 概念 | 英文文本 |
|------|---------|
| 积分 | Points |
| 余额 | Balance |
| 佣金 | Commission |
| 总佣金 | Total Commission |
| 可提现佣金 | Available Commission |
| 已提现佣金 | Total Withdrawn |
| 待结算佣金 | Pending Commission |
| 注册积分 | Register Reward |
| 受邀积分 | Referral Reward |
| 推荐积分 | Referral Bonus |
| 签到积分 | Daily Claim |
| 消费佣金 | Consumption Commission |

---

## 📐 命名约定规则

### 1. 字段命名规则
- 使用 **camelCase** (驼峰命名)
- 布尔值以 `is`、`has`、`can` 开头
- 时间字段以 `At` 结尾
- 数量字段以 `Count` 结尾（可选）
- 总计字段以 `total` 开头

### 2. 类型命名规则
- 使用 **snake_case** (下划线命名)
- 描述性命名，清晰表达含义
- 避免缩写，除非是通用缩写（如 vip）

### 3. API 命名规则
- RESTful 风格
- 使用复数形式表示资源集合
- 使用动词表示操作

### 4. 前端显示规则
- 使用用户友好的中文
- 保持简洁明了
- 统一术语，避免同义词混用

---

## ⚠️ 常见错误和避免方法

### ❌ 错误示例

```javascript
// 错误：命名不一致
user.referralPoints  // 应该用 referralStats.totalEarnings
user.inviteCode      // 应该用 referralCode
user.availableBalance // 应该用 balance

// 错误：类型命名不清晰
type: 'invite'       // 应该用 referral_bonus
type: 'reward'       // 太模糊，应该具体说明

// 错误：前端显示不统一
"邀请奖励" / "推荐奖励" / "推广奖励"  // 应统一使用 "推荐奖励"
```

### ✅ 正确示例

```javascript
// 正确：使用规范的字段名
user.referralStats.totalEarnings
user.referralCode
user.balance

// 正确：使用明确的类型
type: 'referral_bonus'
type: 'commission'

// 正确：统一的前端显示
"推荐奖励"  // 始终使用这个术语
```

---

## 🔄 迁移指南

如果现有代码使用了不规范的命名，按以下步骤迁移：

1. **识别不规范命名** - 对照本文档检查
2. **创建映射表** - 记录旧名称→新名称
3. **逐步替换** - 先后端，再前端
4. **测试验证** - 确保功能正常
5. **更新文档** - 同步更新相关文档

---

## � 管理示员后台命名规范

### 用户管理页面字段

| 字段名 | 类型 | 说明 | 前端显示 |
|--------|------|------|---------|
| `totalReferrals` | Number | 总推荐人数 | "推荐用户" / "推荐人数" |
| `totalCommission` | Number | 累计佣金收入 | "总佣金" / "总佣金收入" |
| `totalSearches` | Number | 累计搜索次数 | "搜索次数" |
| `vipStatus` | String | VIP状态 | "会员等级" |
| `lastLoginAt` | Date | 最后登录时间 | "最后登录" |

### 提现管理页面字段

| 字段名 | 类型 | 说明 | 前端显示 |
|--------|------|------|---------|
| `orderNo` | String | 提现订单号 | "订单号" |
| `type` | String | 提现类型: balance/commission | "提现类型" |
| `amount` | Number | 提现金额 | "提现金额" |
| `fee` | Number | 手续费 | "手续费" |
| `actualAmount` | Number | 实际到账金额 | "实际到账" |
| `status` | String | 订单状态 | "状态" |
| `walletAddress` | String | 钱包地址 | "钱包地址" |
| `txHash` | String | 区块链交易哈希 | "交易哈希" |
| `rejectReason` | String | 拒绝原因 | "拒绝原因" |
| `processedAt` | Date | 处理时间 | "处理时间" |
| `processedBy` | String | 处理人 | "处理人" |

### 提现状态 (WithdrawOrder.status)

| status 值 | 说明 | 管理员显示 | 用户显示 | 颜色 |
|-----------|------|-----------|---------|------|
| `pending` | 待审核 | "待审核" | "待审核" | yellow |
| `processing` | 处理中 | "处理中" | "处理中" | blue |
| `completed` | 已完成 | "已完成" | "已完成" | green |
| `rejected` | 已拒绝 | "已拒绝" | "已拒绝" | red |

### 积分配置字段

| 字段名 | 类型 | 说明 | 管理员显示 |
|--------|------|------|-----------|
| `searchCost` | Number | 每次查询消耗积分 | "每次查询所需积分" |
| `enableSearchCost` | Boolean | 是否启用积分消耗 | "启用积分消耗" |
| `exchangeRate` | Number | 余额兑换积分汇率 | "余额兑换积分汇率" |
| `dailyCheckIn` | Number | 每日签到积分 | "每日签到获得积分" |
| `consecutiveBonus` | Object | 连续签到奖励 | "连续签到奖励" |
| `referralReward` | Number | 推荐奖励积分 | "成功邀请一个用户获得积分" |
| `referredUserReward` | Number | 被推荐用户奖励 | "被邀请用户注册奖励" |
| `registerReward` | Number | 注册奖励积分 | "新用户注册奖励积分" |
| `commissionRate` | Number | 佣金比例(%) | "下级用户充值佣金比例" |
| `commissionSettlement` | String | 佣金结算方式 | "佣金结算方式" |
| `minWithdrawAmount` | Number | 最低提现金额 | "最低提现金额" |
| `withdrawFee` | Number | 提现手续费(%) | "提现手续费" |
| `usdtRate` | Number | USDT汇率 | "USDT汇率" |
| `withdrawApproval` | String | 提现审核方式 | "提现审核方式" |
| `autoApprovalLimit` | Number | 自动审核上限 | "自动审核金额上限" |
| `commissionLevels` | Number | 佣金层级 | "佣金层级" |
| `secondLevelCommissionRate` | Number | 二级佣金比例 | "二级佣金比例" |
| `thirdLevelCommissionRate` | Number | 三级佣金比例 | "三级佣金比例" |

### 佣金结算方式 (commissionSettlement)

| 值 | 说明 | 管理员显示 |
|----|------|-----------|
| `instant` | 即时到账 | "即时到账" |
| `daily` | 每日结算 | "每日结算" |
| `weekly` | 每周结算 | "每周结算" |
| `monthly` | 每月结算 | "每月结算" |

### 提现审核方式 (withdrawApproval)

| 值 | 说明 | 管理员显示 |
|----|------|-----------|
| `auto` | 自动审核 | "自动审核" |
| `manual` | 人工审核 | "人工审核" |

### 佣金层级 (commissionLevels)

| 值 | 说明 | 管理员显示 |
|----|------|-----------|
| `1` | 一级 | "一级（仅直接邀请）" |
| `2` | 二级 | "二级（邀请+间接邀请）" |
| `3` | 三级 | "三级（三层关系）" |

### 用户详情标签页

| Tab ID | 说明 | 显示文本 |
|--------|------|---------|
| `info` | 基本信息 | "基本信息" |
| `referrals` | 推荐用户列表 | "推荐用户" |
| `points` | 积分记录 | "积分记录" |
| `commission` | 佣金记录 | "佣金记录" |
| `searches` | 查询历史 | "查询历史" |

### 统计数据字段

| 字段名 | 说明 | 管理员显示 |
|--------|------|-----------|
| `totalUsers` | 总用户数 | "总用户数" |
| `todayNewUsers` | 今日新增用户 | "今日新增" |
| `totalPoints` | 系统总积分 | "总积分" |
| `totalCommission` | 系统总佣金 | "总佣金" |
| `pendingWithdrawals` | 待处理提现 | "待处理" |
| `totalWithdrawals` | 总提现金额 | "总提现" |

---

## �️ 考后端服务器命名规范

### 数据库模型 (Models)

#### BalanceLog 模型字段

| 字段名 | 类型 | 说明 | 索引 |
|--------|------|------|------|
| `userId` | ObjectId | 用户ID | ✅ |
| `type` | String | 记录类型（见枚举表） | ✅ |
| `currency` | String | 货币类型: points/balance/commission | ✅ |
| `amount` | Number | 金额变动（正数=增加，负数=减少） | - |
| `balanceBefore` | Number | 变动前余额 | - |
| `balanceAfter` | Number | 变动后余额 | - |
| `relatedUserId` | ObjectId | 关联用户ID（如推荐人） | ✅ |
| `orderId` | String | 关联订单ID | - |
| `description` | String | 描述 | - |
| `createdAt` | Date | 创建时间 | ✅ |

#### WithdrawOrder 模型字段

| 字段名 | 类型 | 说明 | 索引 |
|--------|------|------|------|
| `userId` | ObjectId | 用户ID | ✅ |
| `orderNo` | String | 订单号（唯一） | ✅ |
| `type` | String | 提现类型: commission/balance | - |
| `amount` | Number | 提现金额 | - |
| `fee` | Number | 手续费 | - |
| `actualAmount` | Number | 实际到账金额 | - |
| `walletAddress` | String | 钱包地址 | - |
| `status` | String | 状态: pending/processing/completed/rejected/cancelled | ✅ |
| `remark` | String | 备注/拒绝原因 | - |
| `processedBy` | ObjectId | 处理人ID | - |
| `processedAt` | Date | 处理时间 | - |
| `txHash` | String | 区块链交易哈希 | - |
| `createdAt` | Date | 创建时间 | ✅ |
| `updatedAt` | Date | 更新时间 | - |

#### RechargeCard 模型字段

| 字段名 | 类型 | 说明 | 索引 |
|--------|------|------|------|
| `code` | String | 卡密码（唯一，大写） | ✅ |
| `type` | String | 卡密类型: balance/points/vip | ✅ |
| `amount` | Number | 充值金额（余额类型） | - |
| `points` | Number | 积分数量（积分类型） | - |
| `vipDays` | Number | VIP天数（VIP类型） | - |
| `vipPackageName` | String | VIP套餐名称 | - |
| `status` | String | 状态: unused/used/expired/disabled | ✅ |
| `usedBy` | ObjectId | 使用者ID | - |
| `usedAt` | Date | 使用时间 | - |
| `expiresAt` | Date | 过期时间 | - |
| `batchNumber` | String | 批次号 | ✅ |
| `note` | String | 备注 | - |
| `createdBy` | ObjectId | 创建者ID | - |
| `createdAt` | Date | 创建时间 | ✅ |
| `updatedAt` | Date | 更新时间 | - |

#### SystemConfig 模型字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `searchTypes` | Array | 搜索类型配置 |
| `databases` | Object | 数据库配置 |
| `email` | Object | 邮件配置 |
| `points` | Object | 积分配置（见积分配置表） |
| `rechargeCard` | Object | 充值卡配置 |
| `updatedBy` | ObjectId | 更新者ID |
| `createdAt` | Date | 创建时间 |
| `updatedAt` | Date | 更新时间 |

### API 路由命名规范

#### 用户相关 API (/api/user)

| 路由 | 方法 | 说明 | 权限 |
|------|------|------|------|
| `/profile` | GET | 获取用户资料 | 用户 |
| `/profile` | PUT | 更新用户资料 | 用户 |
| `/balance-logs` | GET | 获取余额记录 | 用户 |
| `/referral-stats` | GET | 获取推荐统计 | 用户 |
| `/exchange-points` | POST | 积分兑换余额 | 用户 |
| `/search-history` | GET | 获取搜索历史 | 用户 |
| `/commissions` | GET | 获取佣金记录 | 用户 |
| `/points-history` | GET | 获取积分历史 | 用户 |

#### 提现相关 API (/api/withdraw)

| 路由 | 方法 | 说明 | 权限 |
|------|------|------|------|
| `/create` | POST | 创建提现申请（旧） | 用户 |
| `/commission` | POST | 佣金提现 | 用户 |
| `/to-balance` | POST | 佣金转余额 | 用户 |
| `/history` | GET | 获取提现历史 | 用户 |
| `/admin/list` | GET | 获取提现列表 | 管理员 |
| `/admin/approve/:orderId` | POST | 批准提现 | 管理员 |
| `/admin/reject/:orderId` | POST | 拒绝提现 | 管理员 |

#### 系统配置 API (/api/system-config)

| 路由 | 方法 | 说明 | 权限 |
|------|------|------|------|
| `/` | GET | 获取系统配置 | 管理员 |
| `/` | PUT | 更新系统配置 | 管理员 |
| `/search-types` | PUT | 更新搜索类型 | 管理员 |
| `/databases` | PUT | 更新数据库配置 | 管理员 |
| `/email` | PUT | 更新邮件配置 | 管理员 |
| `/points` | PUT | 更新积分配置 | 管理员 |
| `/points-descriptions` | GET | 获取积分说明 | 用户 |
| `/points-descriptions` | PUT | 更新积分说明 | 管理员 |
| `/smtp` | GET | 获取SMTP配置 | 管理员 |
| `/smtp` | POST | 保存SMTP配置 | 管理员 |
| `/smtp/test` | POST | 测试SMTP配置 | 管理员 |
| `/recharge-card` | GET | 获取充值卡配置 | 公开 |
| `/recharge-card` | PUT | 更新充值卡配置 | 管理员 |

#### 搜索相关 API (/api/search)

| 路由 | 方法 | 说明 | 权限 |
|------|------|------|------|
| `/` | POST | 执行搜索 | 用户 |
| `/databases` | GET | 获取数据库列表 | 公开 |
| `/advertisements` | GET | 获取广告 | 公开 |

#### 工单相关 API (/api/tickets)

| 路由 | 方法 | 说明 | 权限 |
|------|------|------|------|
| `/` | POST | 创建工单 | 用户 |
| `/` | GET | 获取我的工单 | 用户 |
| `/:id` | GET | 获取工单详情 | 用户 |
| `/:id/reply` | POST | 回复工单 | 用户 |
| `/:id/close` | PUT | 关闭工单 | 用户 |
| `/admin/all` | GET | 获取所有工单 | 管理员 |
| `/admin/:id/status` | PUT | 更新工单状态 | 管理员 |

### 后端枚举值规范

#### BalanceLog.type 枚举

```javascript
enum BalanceLogType {
  // 积分相关
  'register',              // 注册奖励
  'referral_bonus',        // 推荐注册奖励（推荐人）
  'referral_reward',       // 被推荐奖励（被推荐人）
  'daily_claim',           // 每日签到
  
  // 充值相关
  'recharge',              // 充值
  'recharge_card',         // 充值卡
  
  // 消费相关
  'consume',               // 消费
  'refund',                // 退款
  'search',                // 搜索消费
  
  // 兑换相关
  'exchange',              // 积分兑换余额
  
  // VIP相关
  'vip',                   // VIP购买
  
  // 佣金相关
  'commission',            // 佣金收入
  'commission_to_balance', // 佣金转余额
  'commission_withdraw',   // 佣金提现
  'withdraw',              // 提现（通用）
  
  // 余额相关
  'balance_income'         // 余额收入
}
```

#### BalanceLog.currency 枚举

```javascript
enum Currency {
  'points',      // 积分
  'balance',     // 余额
  'commission'   // 佣金
}
```

#### WithdrawOrder.status 枚举

```javascript
enum WithdrawStatus {
  'pending',     // 待审核
  'processing',  // 处理中
  'completed',   // 已完成
  'rejected',    // 已拒绝
  'cancelled'    // 已取消
}
```

#### WithdrawOrder.type 枚举

```javascript
enum WithdrawType {
  'commission',  // 佣金提现
  'balance'      // 余额提现
}
```

#### RechargeCard.type 枚举

```javascript
enum RechargeCardType {
  'balance',  // 余额卡
  'points',   // 积分卡
  'vip'       // VIP卡
}
```

#### RechargeCard.status 枚举

```javascript
enum RechargeCardStatus {
  'unused',    // 未使用
  'used',      // 已使用
  'expired',   // 已过期
  'disabled'   // 已禁用
}
```

### 后端服务命名规范

#### 服务文件命名

| 文件名 | 说明 | 主要功能 |
|--------|------|---------|
| `emailService.js` | 邮件服务 | 发送邮件、模板渲染 |
| `rechargeService.js` | 充值服务 | 充值处理、卡密验证 |
| `commissionService.js` | 佣金服务 | 佣金计算、分配 |
| `pointsService.js` | 积分服务 | 积分计算、奖励 |

#### 中间件命名

| 文件名 | 说明 | 功能 |
|--------|------|------|
| `authMiddleware.js` | 认证中间件 | 验证用户登录 |
| `adminMiddleware.js` | 管理员中间件 | 验证管理员权限 |
| `captchaVerify.js` | 验证码中间件 | 验证滑块验证码 |
| `rateLimit.js` | 限流中间件 | API请求限流 |

### 后端工具函数命名

| 函数名 | 说明 | 返回值 |
|--------|------|--------|
| `generateOrderNo()` | 生成订单号 | String |
| `generateReferralCode()` | 生成邀请码 | String |
| `calculateCommission(amount, rate)` | 计算佣金 | Number |
| `formatCurrency(amount)` | 格式化货币 | String |
| `validateEmail(email)` | 验证邮箱 | Boolean |
| `hashPassword(password)` | 密码加密 | String |
| `comparePassword(password, hash)` | 密码比对 | Boolean |

### 数据库连接命名

```javascript
// database.js
const userConnection = mongoose.createConnection(USER_DB_URI);  // ✅ 用户数据库
const queryConnection = mongoose.createConnection(QUERY_DB_URI); // ✅ 查询数据库
```

### 环境变量命名 (.env)

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `PORT` | 服务器端口 | 5000 |
| `MONGODB_URI` | MongoDB连接字符串 | mongodb://localhost:27017/infosearch |
| `JWT_SECRET` | JWT密钥 | your-secret-key |
| `SMTP_HOST` | SMTP服务器 | smtp.gmail.com |
| `SMTP_PORT` | SMTP端口 | 587 |
| `SMTP_USER` | SMTP用户名 | user@example.com |
| `SMTP_PASSWORD` | SMTP密码 | password |
| `FRONTEND_URL` | 前端URL | http://localhost:5173 |

---

## 📚 参考示例

### 后端 Model 示例

#### User Model
```javascript
// server/models/User.js
const userSchema = new mongoose.Schema({
  username: String,            // ✅ 用户名
  email: String,               // ✅ 邮箱
  password: String,            // ✅ 密码（加密）
  points: Number,              // ✅ 积分
  balance: Number,             // ✅ 余额
  commission: Number,          // ✅ 佣金
  referralCode: String,        // ✅ 邀请码
  referredBy: ObjectId,        // ✅ 推荐人
  referralStats: {
    totalReferrals: Number,    // ✅ 总推荐人数
    validReferrals: Number,    // ✅ 有效推荐人数
    totalEarnings: Number      // ✅ 推荐总收益
  },
  isVip: Boolean,              // ✅ 是否VIP
  vipExpireAt: Date,           // ✅ VIP过期时间
  role: String,                // ✅ 角色: user/admin
  totalRecharged: Number,      // ✅ 累计充值
  totalConsumed: Number,       // ✅ 累计消费
  lastDailyClaimAt: Date,      // ✅ 最后签到时间
  createdAt: Date,             // ✅ 创建时间
  updatedAt: Date              // ✅ 更新时间
});
```

#### BalanceLog Model
```javascript
// server/models/BalanceLog.js
const balanceLogSchema = new mongoose.Schema({
  userId: ObjectId,            // ✅ 用户ID
  type: String,                // ✅ 记录类型
  currency: String,            // ✅ 货币类型: points/balance/commission
  amount: Number,              // ✅ 金额变动
  balanceBefore: Number,       // ✅ 变动前余额
  balanceAfter: Number,        // ✅ 变动后余额
  relatedUserId: ObjectId,     // ✅ 关联用户ID
  orderId: String,             // ✅ 关联订单ID
  description: String,         // ✅ 描述
  createdAt: Date              // ✅ 创建时间
});
```

#### WithdrawOrder Model
```javascript
// server/models/WithdrawOrder.js
const withdrawOrderSchema = new mongoose.Schema({
  userId: ObjectId,            // ✅ 用户ID
  orderNo: String,             // ✅ 订单号
  type: String,                // ✅ 提现类型: commission/balance
  amount: Number,              // ✅ 提现金额
  fee: Number,                 // ✅ 手续费
  actualAmount: Number,        // ✅ 实际到账
  walletAddress: String,       // ✅ 钱包地址
  status: String,              // ✅ 状态
  remark: String,              // ✅ 备注
  processedBy: ObjectId,       // ✅ 处理人ID
  processedAt: Date,           // ✅ 处理时间
  txHash: String,              // ✅ 交易哈希
  createdAt: Date,             // ✅ 创建时间
  updatedAt: Date              // ✅ 更新时间
});
```

### 前端 TypeScript 示例

#### 用户端接口
```typescript
// types.ts - 用户端
interface CommissionData {
  totalCommission: number;      // ✅ 总佣金
  availableCommission: number;  // ✅ 可提现佣金
  pendingCommission: number;    // ✅ 待结算佣金
  totalWithdrawn: number;       // ✅ 已提现佣金
}

interface ReferralData {
  referralCode: string;         // ✅ 邀请码
  totalReferrals: number;       // ✅ 总推荐人数
  totalEarnings: number;        // ✅ 推荐收益
}
```

#### 管理员端接口
```typescript
// types.ts - 管理员端
interface AdminUser {
  id: string;
  username: string;
  email: string;
  vipStatus: string;            // ✅ VIP状态
  balance: number;              // ✅ 余额
  points: number;               // ✅ 积分
  commission: number;           // ✅ 佣金余额
  referralCode: string;         // ✅ 邀请码
  totalReferrals: number;       // ✅ 总推荐人数
  totalCommission: number;      // ✅ 累计佣金收入
  totalSearches: number;        // ✅ 累计搜索次数
  createdAt: string;
  lastLoginAt: string;          // ✅ 最后登录时间
}

interface WithdrawRequest {
  _id: string;
  orderNo: string;              // ✅ 订单号
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  type: 'balance' | 'commission'; // ✅ 提现类型
  amount: number;               // ✅ 提现金额
  fee: number;                  // ✅ 手续费
  actualAmount: number;         // ✅ 实际到账
  walletAddress: string;        // ✅ 钱包地址
  status: 'pending' | 'completed' | 'rejected'; // ✅ 状态
  txHash?: string;              // ✅ 交易哈希
  rejectReason?: string;        // ✅ 拒绝原因
  createdAt: string;
  processedAt?: string;         // ✅ 处理时间
}

interface PointsConfig {
  searchCost: number;           // ✅ 查询消耗积分
  enableSearchCost: boolean;    // ✅ 启用积分消耗
  exchangeRate: number;         // ✅ 兑换汇率
  dailyCheckIn: number;         // ✅ 签到积分
  referralReward: number;       // ✅ 推荐奖励
  registerReward: number;       // ✅ 注册奖励
  commissionRate: number;       // ✅ 佣金比例
  minWithdrawAmount: number;    // ✅ 最低提现金额
  withdrawFee: number;          // ✅ 提现手续费
  commissionLevels: number;     // ✅ 佣金层级
}
```

### 后端 API 响应示例

#### 获取佣金记录 API
```javascript
// GET /api/user/commissions
{
  success: true,
  data: {
    totalCommission: 245.80,      // ✅ 总佣金收入
    availableCommission: 120.50,  // ✅ 可提现佣金
    totalWithdrawn: 125.30,       // ✅ 已提现佣金
    commissions: [                // ✅ 佣金记录列表
      {
        _id: "...",
        userId: "...",
        type: "commission",       // ✅ 类型
        currency: "commission",   // ✅ 货币类型
        amount: 15.50,            // ✅ 金额
        description: "下级用户消费佣金", // ✅ 描述
        relatedUserId: "...",     // ✅ 关联用户
        createdAt: "2024-10-19T10:30:00Z"
      }
    ]
  }
}
```

#### 获取推荐统计 API
```javascript
// GET /api/user/referral-stats
{
  success: true,
  data: {
    totalReferrals: 5,            // ✅ 总推荐人数
    validReferrals: 3,            // ✅ 有效推荐人数
    totalEarnings: 500,           // ✅ 推荐总收益（积分）
    referredUsers: [              // ✅ 推荐用户列表
      {
        _id: "...",
        username: "user123",
        email: "user@example.com",
        createdAt: "2024-10-01T10:00:00Z",
        totalSpent: 100,          // ✅ 累计消费
        commissionEarned: 15      // ✅ 产生的佣金
      }
    ]
  }
}
```

#### 提现申请 API
```javascript
// POST /api/withdraw/commission
// Request Body
{
  amount: 100,                    // ✅ 提现金额
  walletAddress: "TXxx...xxx",    // ✅ 钱包地址
  type: "usdt"                    // ✅ 提现方式
}

// Response
{
  success: true,
  message: "提现申请已提交",
  data: {
    orderNo: "WD20241019001",     // ✅ 订单号
    amount: 100,                  // ✅ 提现金额
    fee: 5,                       // ✅ 手续费
    actualAmount: 95,             // ✅ 实际到账
    status: "pending"             // ✅ 状态
  }
}
```

### 后端服务函数示例

#### 佣金计算服务
```javascript
// server/services/commissionService.js

/**
 * 计算佣金
 * @param {Number} amount - 消费金额
 * @param {Number} rate - 佣金比例(%)
 * @returns {Number} 佣金金额
 */
function calculateCommission(amount, rate) {
  return (amount * rate) / 100;
}

/**
 * 分配佣金给推荐人
 * @param {ObjectId} userId - 用户ID
 * @param {Number} amount - 消费金额
 */
async function distributeCommission(userId, amount) {
  const user = await User.findById(userId);
  if (!user.referredBy) return;
  
  const config = await SystemConfig.getConfig();
  const commissionRate = config.points.commissionRate || 15;
  const commissionAmount = calculateCommission(amount, commissionRate);
  
  // 给推荐人增加佣金
  await User.findByIdAndUpdate(user.referredBy, {
    $inc: { commission: commissionAmount }
  });
  
  // 记录佣金日志
  await BalanceLog.create({
    userId: user.referredBy,
    type: 'commission',           // ✅ 类型：佣金收入
    currency: 'commission',       // ✅ 货币：佣金
    amount: commissionAmount,     // ✅ 金额
    description: '下级用户消费佣金',
    relatedUserId: userId
  });
}
```

#### 积分奖励服务
```javascript
// server/services/pointsService.js

/**
 * 发放注册奖励
 * @param {ObjectId} userId - 用户ID
 */
async function giveRegisterReward(userId) {
  const config = await SystemConfig.getConfig();
  const reward = config.points.registerReward || 100;
  
  if (!config.points.enableRegisterReward) return;
  
  await User.findByIdAndUpdate(userId, {
    $inc: { points: reward }
  });
  
  await BalanceLog.create({
    userId,
    type: 'register',             // ✅ 类型：注册奖励
    currency: 'points',           // ✅ 货币：积分
    amount: reward,               // ✅ 金额
    description: '注册奖励'
  });
}

/**
 * 发放推荐奖励
 * @param {ObjectId} referrerId - 推荐人ID
 * @param {ObjectId} referredId - 被推荐人ID
 */
async function giveReferralReward(referrerId, referredId) {
  const config = await SystemConfig.getConfig();
  const reward = config.points.referralReward || 100;
  
  if (!config.points.enableReferralReward) return;
  
  // 给推荐人奖励
  await User.findByIdAndUpdate(referrerId, {
    $inc: { points: reward }
  });
  
  await BalanceLog.create({
    userId: referrerId,
    type: 'referral_bonus',       // ✅ 类型：推荐奖励
    currency: 'points',           // ✅ 货币：积分
    amount: reward,               // ✅ 金额
    description: '推荐用户注册奖励',
    relatedUserId: referredId
  });
}
```

---

## ✅ 检查清单

在开发新功能或修改现有功能时，请检查：

- [ ] 所有字段名符合 camelCase 规范
- [ ] 所有类型名符合 snake_case 规范
- [ ] 前端显示文本统一使用规范术语
- [ ] API 响应字段名与文档一致
- [ ] 数据库字段名与文档一致
- [ ] 注释清晰说明字段用途
- [ ] 更新了相关文档

---

## 🎯 总结

这个规范文档定义了系统中所有数据的命名标准。遵循这个规范可以：

1. ✅ **避免命名混乱** - 前后端使用统一的命名
2. ✅ **提高代码可读性** - 清晰的命名让代码更易理解
3. ✅ **减少沟通成本** - 团队成员使用相同的术语
4. ✅ **降低维护难度** - 规范的代码更容易维护
5. ✅ **防止错误** - 统一的命名减少因混淆导致的bug

**请将此文档作为开发的必备参考！**

---

## 📖 文档使用指南

### 如何使用这个文档

1. **开发新功能前** - 先查阅相关章节，了解应该使用的字段名和类型
2. **编写代码时** - 对照文档确保命名一致
3. **Code Review时** - 检查是否符合规范
4. **遇到命名疑问时** - 在文档中搜索相关概念

### 快速查找

- **前端字段** → 查看"前端显示文本规范"和"API 响应字段命名"
- **后端字段** → 查看"数据库模型 (Models)"和"后端枚举值规范"
- **管理员后台** → 查看"管理员后台命名规范"
- **API路由** → 查看"API 路由命名规范"
- **显示文本** → 查看"前端显示文本规范"

### 文档维护

当需要添加新的字段或概念时：

1. 在相应章节添加新的条目
2. 更新相关的对比表
3. 添加代码示例（如果需要）
4. 更新"完整的系统变量命名表"

### 版本历史

- **v1.0** (2024-10-24) - 初始版本，包含完整的前后端命名规范

---

## 🎓 最佳实践建议

### 1. 命名一致性
- ✅ 前后端使用相同的字段名（camelCase）
- ✅ 数据库字段名与代码字段名一致
- ✅ API响应字段名与前端期望一致

### 2. 类型安全
- ✅ 使用 TypeScript 接口定义数据结构
- ✅ 后端使用 Mongoose Schema 验证
- ✅ 枚举值使用常量定义

### 3. 文档注释
```javascript
// ✅ 好的注释
const totalCommission = 245.80;  // 总佣金收入（累计）

// ❌ 不好的注释
const tc = 245.80;  // 佣金
```

### 4. 错误处理
```javascript
// ✅ 使用明确的错误消息
throw new Error('可提现佣金不足，当前可提现: ' + availableCommission);

// ❌ 模糊的错误消息
throw new Error('余额不足');
```

### 5. 日志记录
```javascript
// ✅ 记录关键信息
console.log('用户提现申请', {
  userId,
  orderNo,
  amount,
  type: 'commission',
  status: 'pending'
});

// ❌ 信息不足
console.log('提现申请');
```

---

## 🔗 相关文档

- [API 文档](./API_DOCUMENTATION.md) - API接口详细说明
- [数据库设计](./DATABASE_DESIGN.md) - 数据库表结构设计
- [开发规范](./DEVELOPMENT_GUIDELINES.md) - 代码开发规范

---

**最后更新**: 2024-10-24  
**维护者**: 开发团队  
**文档版本**: v1.0

---

💡 **提示**: 将此文档加入书签，开发时随时查阅！


---

## 🗄️ 数据库配置命名规范

### SystemConfig.databases 字段

| 字段名 | 类型 | 说明 | 默认值 | 前端显示 |
|--------|------|------|--------|---------|
| `name` | String | 数据库名称 | - | "数据库名称" |
| `type` | String | 数据库类型 | mongodb | "数据库类型" |
| `host` | String | 主机地址 | localhost | "主机地址" |
| `port` | Number | 端口号 | 27017 | "端口" |
| `username` | String | 用户名 | - | "用户名" |
| `password` | String | 密码（加密存储） | - | "密码" |
| `database` | String | 数据库名 | - | "数据库名" |
| `authSource` | String | 认证数据库 | admin | "认证数据库" |
| `connectionPool` | Number | 连接池大小 | 10 | "连接池大小" |
| `timeout` | Number | 超时时间（毫秒） | 30000 | "超时时间" |
| `enabled` | Boolean | 是否启用 | true | "启用状态" |
| `description` | String | 描述（仅查询数据库） | - | "描述" |

### 数据库配置类型

#### 用户数据库 (databases.user)
```javascript
{
  name: '用户数据库',           // ✅ 数据库名称
  type: 'mongodb',             // ✅ 数据库类型
  host: '172.16.254.15',       // ✅ 主机地址
  port: 27017,                 // ✅ 端口
  username: 'chroot',          // ✅ 用户名
  password: 'encrypted...',    // ✅ 密码（加密）
  database: 'userdata',        // ✅ 数据库名
  authSource: 'admin',         // ✅ 认证数据库
  connectionPool: 10,          // ✅ 连接池大小
  timeout: 30000,              // ✅ 超时时间
  enabled: true                // ✅ 是否启用
}
```

#### 查询数据库 (databases.query[])
```javascript
{
  id: 'query_1',               // ✅ 数据库ID
  name: '查询数据库1',          // ✅ 数据库名称
  type: 'mongodb',             // ✅ 数据库类型
  host: 'localhost',           // ✅ 主机地址
  port: 27017,                 // ✅ 端口
  username: '',                // ✅ 用户名（可选）
  password: '',                // ✅ 密码（可选）
  database: 'query_db',        // ✅ 数据库名
  authSource: 'admin',         // ✅ 认证数据库
  connectionPool: 5,           // ✅ 连接池大小
  timeout: 30000,              // ✅ 超时时间
  enabled: true,               // ✅ 是否启用
  description: '用于数据查询'   // ✅ 描述
}
```

### 数据库配置 API

#### 获取数据库配置
```javascript
// GET /api/system-config
{
  success: true,
  data: {
    databases: {
      user: {
        name: '用户数据库',
        host: '172.16.254.15',
        port: 27017,
        database: 'userdata',
        authSource: 'admin',      // ✅ 认证数据库
        password: '******',       // ✅ 密码已遮盖
        enabled: true
      },
      query: [
        {
          id: 'query_1',
          name: '查询数据库1',
          host: 'localhost',
          port: 27017,
          database: 'query_db',
          authSource: 'admin',    // ✅ 认证数据库
          enabled: true
        }
      ]
    }
  }
}
```

#### 测试数据库连接
```javascript
// POST /api/system-config/databases/test
// Request
{
  host: '172.16.254.15',
  port: 27017,
  username: 'chroot',
  password: 'password',
  database: 'userdata',
  authSource: 'admin'             // ✅ 认证数据库
}

// Response
{
  success: true,
  message: '连接测试成功'
}
```

#### 更新数据库配置
```javascript
// PUT /api/system-config/databases
// Request
{
  user: {
    name: '用户数据库',
    type: 'mongodb',
    host: '172.16.254.15',
    port: 27017,
    username: 'chroot',
    password: 'password',
    database: 'userdata',
    authSource: 'admin',          // ✅ 认证数据库
    connectionPool: 10,
    timeout: 30000,
    enabled: true
  },
  query: [...]
}

// Response
{
  success: true,
  message: '数据库配置已更新并重新连接'
}
```

#### 获取数据库连接状态
```javascript
// GET /api/system-config/databases/status
{
  success: true,
  data: {
    user: {
      connected: true,            // ✅ 连接状态
      readyState: 1,              // ✅ 连接状态码
      name: 'userdata',           // ✅ 数据库名
      host: '172.16.254.15',      // ✅ 主机
      port: 27017                 // ✅ 端口
    },
    query: [
      {
        id: 'query_1',
        name: '查询数据库1',
        connected: true,
        readyState: 1,
        host: 'localhost',
        port: 27017
      }
    ]
  }
}
```

### MongoDB 连接字符串格式

#### 无认证
```
mongodb://host:port/database
```

#### 有认证（需要 authSource）
```
mongodb://username:password@host:port/database?authSource=admin
```

### authSource 说明

| 值 | 说明 | 使用场景 |
|----|------|---------|
| `admin` | 在 admin 数据库中验证用户 | 最常见，用户在 admin 数据库中创建 |
| `数据库名` | 在指定数据库中验证用户 | 用户在目标数据库中创建 |
| 不指定 | 在目标数据库中验证 | 无认证或用户在目标数据库中 |

### 前端表单字段

```typescript
interface DatabaseConfig {
  name: string;                   // ✅ 数据库名称
  type: string;                   // ✅ 数据库类型
  host: string;                   // ✅ 主机地址
  port: number;                   // ✅ 端口
  username: string;               // ✅ 用户名
  password: string;               // ✅ 密码
  database: string;               // ✅ 数据库名
  authSource: string;             // ✅ 认证数据库
  connectionPool: number;         // ✅ 连接池大小
  timeout: number;                // ✅ 超时时间
  enabled: boolean;               // ✅ 是否启用
  description?: string;           // ✅ 描述（可选）
}
```

### 前端显示文本

| 字段 | 中文显示 | 英文显示 |
|------|---------|---------|
| `name` | "数据库名称" | "Database Name" |
| `type` | "数据库类型" | "Database Type" |
| `host` | "主机地址" | "Host" |
| `port` | "端口" | "Port" |
| `username` | "用户名" | "Username" |
| `password` | "密码" | "Password" |
| `database` | "数据库名" | "Database" |
| `authSource` | "认证数据库" | "Auth Source" |
| `connectionPool` | "连接池大小" | "Connection Pool" |
| `timeout` | "超时时间（毫秒）" | "Timeout (ms)" |
| `enabled` | "启用" | "Enabled" |
| `description` | "描述" | "Description" |

### 数据库管理器方法命名

```javascript
// server/config/databaseManager.js

class DatabaseManager {
  buildMongoURI(config)              // ✅ 构建 MongoDB 连接字符串
  connectUserDatabase(config)        // ✅ 连接用户数据库
  connectUserDatabaseFromURI(uri)    // ✅ 从 URI 连接用户数据库
  connectQueryDatabase(config)       // ✅ 连接查询数据库
  testConnection(config)             // ✅ 测试数据库连接
  initializeFromConfig()             // ✅ 从配置初始化
  getUserConnection()                // ✅ 获取用户数据库连接
  getQueryConnection(id)             // ✅ 获取查询数据库连接
  getAllQueryConnections()           // ✅ 获取所有查询数据库连接
  getQueryDatabasesInfo()            // ✅ 获取查询数据库信息
  closeAll()                         // ✅ 关闭所有连接
}
```

### 环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `USER_MONGO_URI` | 用户数据库连接字符串 | mongodb://user:pass@host:27017/db?authSource=admin |
| `QUERY_MONGO_URI` | 查询数据库连接字符串 | mongodb://user:pass@host:27017/db?authSource=admin |
| `ENCRYPTION_KEY` | 密码加密密钥 | your-32-character-secret-key!! |

### 密码加密格式

```
加密后格式: iv:encryptedData
示例: a1b2c3d4e5f6:g7h8i9j0k1l2
```

### 连接状态码 (readyState)

| 值 | 说明 | 前端显示 |
|----|------|---------|
| `0` | 断开连接 | "未连接" |
| `1` | 已连接 | "已连接" |
| `2` | 正在连接 | "连接中" |
| `3` | 正在断开 | "断开中" |

### 最佳实践

#### 1. authSource 配置
```javascript
// ✅ 正确：指定 authSource
{
  username: 'chroot',
  password: 'password',
  database: 'userdata',
  authSource: 'admin'  // 用户在 admin 数据库中
}

// ❌ 错误：缺少 authSource（会导致认证失败）
{
  username: 'chroot',
  password: 'password',
  database: 'userdata'
  // 缺少 authSource
}
```

#### 2. 密码处理
```javascript
// ✅ 正确：保存前加密
if (password && !isEncrypted(password)) {
  config.password = encryptPassword(password);
}

// ✅ 正确：返回时遮盖
if (config.password) {
  config.password = '******';
}
```

#### 3. 连接测试
```javascript
// ✅ 正确：保存前测试
const testResult = await dbManager.testConnection(config);
if (!testResult.success) {
  throw new Error('连接测试失败: ' + testResult.message);
}
```

---

**数据库配置部分更新**: 2024-10-24  
**新增字段**: `authSource` - MongoDB 认证数据库配置

