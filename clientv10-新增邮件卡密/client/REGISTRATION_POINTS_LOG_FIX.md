# 注册奖励积分记录修复

## 问题描述
新用户注册时获取的注册奖励积分，在用户中心-积分中心不显示记录。

## 问题原因
注册时虽然给用户设置了积分（`user.points = registerReward`），但是**没有创建BalanceLog记录**。

积分历史API从BalanceLog表中查询 `currency='points'` 的记录，如果没有创建记录，就无法显示在积分中心。

## 修复内容

### 1. 添加BalanceLog导入
```javascript
const BalanceLog = require('../models/BalanceLog');
```

### 2. 创建注册奖励积分记录
在用户注册成功后，创建BalanceLog记录：

```javascript
// 创建注册奖励积分记录
await BalanceLog.create({
  userId: user._id,
  type: 'register',
  currency: 'points',
  amount: registerReward,
  balanceBefore: 0,
  balanceAfter: registerReward,
  description: '注册奖励'
});
```

### 3. 创建推荐奖励积分记录
如果有推荐人，也为推荐人创建积分记录：

```javascript
// 创建推荐奖励积分记录
await BalanceLog.create({
  userId: referrer._id,
  type: 'referral_bonus',
  currency: 'points',
  amount: referralReward,
  balanceBefore: pointsBefore,
  balanceAfter: referrer.points,
  description: `推荐用户 ${username} 注册奖励`,
  relatedUserId: user._id
});
```

## BalanceLog记录结构

```javascript
{
  userId: ObjectId,           // 用户ID
  type: 'register',           // 类型：register（注册）或 referral_bonus（推荐奖励）
  currency: 'points',         // 货币类型：points（积分）
  amount: 100,                // 金额（正数表示增加）
  balanceBefore: 0,           // 变动前余额
  balanceAfter: 100,          // 变动后余额
  description: '注册奖励',     // 描述
  relatedUserId: ObjectId,    // 关联用户ID（推荐奖励时使用）
  createdAt: Date             // 创建时间
}
```

## 积分历史API

`GET /api/user/points-history` 查询条件：
```javascript
{
  userId: req.user._id,
  currency: 'points'
}
```

返回的记录会显示在积分中心的"积分历史"列表中。

## 类型映射

在积分历史中，type字段会被映射为前端显示的类型：

```javascript
const typeMapping = {
  'register': 'bonus',          // 注册奖励 → 奖励
  'referral_bonus': 'bonus',    // 推荐奖励 → 奖励
  'recharge': 'recharge',       // 充值 → 充值
  'recharge_card': 'recharge',  // 充值卡 → 充值
  'commission': 'referral',     // 佣金 → 推荐
  'search': 'purchase',         // 搜索 → 消费
  'exchange': 'purchase',       // 兑换 → 消费
  'vip': 'purchase',            // VIP → 消费
  'refund': 'bonus'             // 退款 → 奖励
};
```

## 修复后的效果

### 新用户注册
1. 用户注册成功
2. 获得注册奖励积分（默认100积分）
3. 创建BalanceLog记录
4. 在积分中心可以看到"注册奖励"记录

### 推荐人奖励
1. 新用户通过推荐码注册
2. 推荐人获得推荐奖励积分（默认100积分）
3. 创建BalanceLog记录
4. 推荐人在积分中心可以看到"推荐用户 XXX 注册奖励"记录

## 是否需要重启服务器？

**需要**！因为修改了后端代码（server/routes/auth.js），需要重启Node.js服务器才能生效。

重启命令：
```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
npm run dev
# 或
node server/index.js
```

## 验证步骤

### 测试新用户注册
1. 重启服务器
2. 注册一个新用户
3. 登录新用户账号
4. 进入"积分中心"
5. 查看"积分历史"
6. 应该能看到"注册奖励"记录，金额为+100积分

### 测试推荐奖励
1. 获取推荐链接
2. 使用推荐链接注册新用户
3. 登录推荐人账号
4. 进入"积分中心"
5. 查看"积分历史"
6. 应该能看到"推荐用户 XXX 注册奖励"记录，金额为+100积分

## 历史数据处理

### 已注册用户的积分
对于已经注册但没有积分记录的用户，他们的积分余额仍然存在（user.points），只是没有历史记录。

如果需要为历史用户补充记录，可以运行以下脚本：
```javascript
// 为所有有积分但没有记录的用户创建初始记录
const users = await User.find({ points: { $gt: 0 } });
for (const user of users) {
  const hasLog = await BalanceLog.findOne({ 
    userId: user._id, 
    currency: 'points' 
  });
  
  if (!hasLog) {
    await BalanceLog.create({
      userId: user._id,
      type: 'register',
      currency: 'points',
      amount: user.points,
      balanceBefore: 0,
      balanceAfter: user.points,
      description: '注册奖励（补录）',
      createdAt: user.createdAt
    });
  }
}
```

## 文件修改
- ✅ `server/routes/auth.js`
  - 添加BalanceLog导入
  - 创建注册奖励积分记录
  - 创建推荐奖励积分记录

## 总结
修复后，新用户注册时的积分奖励将正确记录在BalanceLog中，可以在积分中心的积分历史中查看。需要重启服务器才能生效。
