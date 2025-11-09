# 修复 rechargeService.js 中的 BalanceLog 问题

## 问题
BalanceLog 模型要求以下字段：
- `balanceBefore` (required)
- `balanceAfter` (required)  
- `currency` (required, enum: 'points', 'balance', 'commission')

但当前的 `addBalance`, `addPoints`, `addVIP` 方法没有正确提供这些字段。

## 需要修改的三个方法

### 1. addBalance 方法 (约第278行)

**修改前**:
```javascript
// 增加余额
user.balance += amount;
await user.save();

// 记录余额日志
const balanceLog = new BalanceLog({
  userId,
  type: options.type || 'recharge_card',
  amount,
  balance: user.balance,  // ❌ 错误：应该是 balanceAfter
  description: options.description || `卡密充值 +${amount}`,
  metadata: options.metadata || {}  // ❌ BalanceLog 没有 metadata 字段
});
```

**修改后**:
```javascript
const balanceBefore = user.balance;  // ✅ 保存修改前的余额

// 增加余额
user.balance += amount;
await user.save();

// 记录余额日志
const balanceLog = new BalanceLog({
  userId,
  type: options.type || 'recharge_card',
  currency: 'balance',  // ✅ 添加 currency
  amount,
  balanceBefore,  // ✅ 添加 balanceBefore
  balanceAfter: user.balance,  // ✅ 添加 balanceAfter
  description: options.description || `卡密充值 +${amount}`
});
```

### 2. addPoints 方法 (约第312行)

**修改前**:
```javascript
// 增加积分
user.points += points;
await user.save();

// 记录余额日志
const balanceLog = new BalanceLog({
  userId,
  type: options.type || 'recharge_card',
  amount: 0,
  points,  // ❌ BalanceLog 没有 points 字段
  balance: user.balance,
  description: options.description || `卡密充值 +${points}积分`,
  metadata: options.metadata || {}
});
```

**修改后**:
```javascript
const pointsBefore = user.points;  // ✅ 保存修改前的积分

// 增加积分
user.points += points;
await user.save();

// 记录余额日志
const balanceLog = new BalanceLog({
  userId,
  type: options.type || 'recharge_card',
  currency: 'points',  // ✅ 使用 points 作为 currency
  amount: points,  // ✅ 积分数量作为 amount
  balanceBefore: pointsBefore,  // ✅ 添加 balanceBefore
  balanceAfter: user.points,  // ✅ 添加 balanceAfter
  description: options.description || `卡密充值 +${points}积分`
});
```

### 3. addVIP 方法 (约第348行)

**修改前**:
```javascript
user.isVIP = true;
user.vipExpireDate = newExpireDate;
await user.save();

// 记录余额日志
const balanceLog = new BalanceLog({
  userId,
  type: options.type || 'recharge_card',
  amount: 0,
  balance: user.balance,
  description: options.description || `卡密充值 +${days}天VIP`,
  metadata: options.metadata || {}
});
```

**修改后**:
```javascript
const balanceBefore = user.balance;  // ✅ VIP不改变余额，但需要记录

user.isVIP = true;
user.vipExpireDate = newExpireDate;
await user.save();

// 记录余额日志
const balanceLog = new BalanceLog({
  userId,
  type: 'vip',  // ✅ VIP类型使用 'vip'
  currency: 'balance',  // ✅ 添加 currency
  amount: 0,  // ✅ VIP不涉及金额变动
  balanceBefore,  // ✅ 添加 balanceBefore
  balanceAfter: user.balance,  // ✅ 添加 balanceAfter (不变)
  description: options.description || `卡密充值 +${days}天VIP`
});
```

## 手动修改步骤

1. 打开 `server/services/rechargeService.js`
2. 找到 `addBalance` 方法（约第278行）
3. 按照上面的"修改后"代码进行修改
4. 找到 `addPoints` 方法（约第312行）
5. 按照上面的"修改后"代码进行修改
6. 找到 `addVIP` 方法（约第348行）
7. 按照上面的"修改后"代码进行修改
8. 保存文件
9. 重启服务器

## 验证

修改完成后，测试卡密充值功能：
1. 生成一张余额卡密
2. 使用卡密充值
3. 检查是否成功，没有报错
4. 查看 BalanceLog 记录是否正确
