# 余额、积分、佣金系统设计文档

## 概述

本文档描述了三种货币系统的技术设计和实现方案。

## 架构设计

### 三种货币的关系

```
┌─────────────┐
│   充值      │
└──────┬──────┘
       ↓
┌─────────────┐
│   积分      │ ← 搜索消费
└─────────────┘

┌─────────────┐
│ 推荐佣金    │
└──────┬──────┘
       ↓
┌─────────────┐     ┌─────────────┐
│   佣金      │────→│ 提现USDT    │
└──────┬──────┘     └─────────────┘
       ↓
┌─────────────┐
│   余额      │
└──────┬──────┘
       ↓
┌─────────────┐
│   积分      │
└─────────────┘
```

## 数据模型设计

### User模型更新

需要添加`commission`字段：

```javascript
const userSchema = new mongoose.Schema({
  // ... 现有字段
  points: { type: Number, default: 0 },      // 积分
  balance: { type: Number, default: 0 },     // 余额
  commission: { type: Number, default: 0 },  // 佣金（新增）
  // ... 其他字段
});
```

### BalanceLog模型更新

需要支持记录三种货币的变动：

```javascript
const balanceLogSchema = new mongoose.Schema({
  userId: ObjectId,
  type: String,  // 类型
  currency: String,  // 货币类型：points/balance/commission
  amount: Number,
  balanceBefore: Number,
  balanceAfter: Number,
  description: String,
  relatedUserId: ObjectId,  // 关联用户（如推荐人）
  orderId: String,
  createdAt: Date
});
```

## 核心功能设计

### 1. 充值功能

**流程**：
1. 用户选择充值套餐（积分或VIP）
2. 创建充值订单
3. 用户完成支付
4. 系统验证支付
5. 增加积分或延长VIP
6. 触发推荐佣金计算
7. 记录日志

**关键代码**：
```javascript
// server/services/rechargeService.js
async processPointsRecharge(user, order) {
  // 增加积分
  user.points += order.points;
  await user.save();
  
  // 记录日志
  await BalanceLog.create({
    userId: user._id,
    type: 'recharge',
    currency: 'points',
    amount: order.points,
    balanceBefore: pointsBefore,
    balanceAfter: user.points
  });
  
  // 计算推荐佣金
  await this.calculateCommission(user, order);
}
```

### 2. 推荐佣金计算

**流程**：
1. 查找推荐人
2. 根据配置计算佣金比例
3. 增加推荐人的佣金
4. 记录佣金日志
5. 支持多级佣金

**关键代码**：
```javascript
// server/services/commissionService.js
async calculateCommission(user, order) {
  const config = await SystemConfig.findOne();
  const rate = config.points.commissionRate / 100;
  
  // 一级推荐人
  if (user.referredBy) {
    const referrer = await User.findById(user.referredBy);
    const commissionAmount = order.amount * rate;
    
    referrer.commission += commissionAmount;
    await referrer.save();
    
    // 记录日志
    await BalanceLog.create({
      userId: referrer._id,
      type: 'commission',
      currency: 'commission',
      amount: commissionAmount,
      relatedUserId: user._id
    });
  }
}
```

### 3. 佣金提现

**流程**：
1. 用户选择提现方式（USDT或余额）
2. 验证提现金额
3. 扣除佣金
4. 如果是USDT，创建提现订单
5. 如果是余额，直接转入余额
6. 记录日志

**关键代码**：
```javascript
// server/routes/withdraw.js
router.post('/commission', authMiddleware, async (req, res) => {
  const { amount, type, address } = req.body;
  
  if (type === 'usdt') {
    // 提现到USDT
    await createWithdrawOrder(user, amount, address);
  } else if (type === 'balance') {
    // 转入余额
    user.commission -= amount;
    user.balance += amount;
    await user.save();
    
    // 记录日志
    await BalanceLog.create({
      userId: user._id,
      type: 'commission_to_balance',
      currency: 'balance',
      amount: amount
    });
  }
});
```

### 4. 余额兑换积分

**流程**：
1. 用户输入兑换数量
2. 根据汇率计算成本
3. 验证余额是否足够
4. 扣除余额，增加积分
5. 记录日志

**关键代码**：
```javascript
// server/routes/user.js
router.post('/exchange-points', authMiddleware, async (req, res) => {
  const { amount } = req.body;
  const config = await SystemConfig.findOne();
  const rate = config.points.exchangeRate;
  
  const cost = amount / rate;
  
  if (user.balance < cost) {
    return res.status(400).json({ message: '余额不足' });
  }
  
  user.balance -= cost;
  user.points += amount;
  await user.save();
  
  // 记录日志
  await BalanceLog.create([
    {
      userId: user._id,
      type: 'exchange',
      currency: 'balance',
      amount: -cost
    },
    {
      userId: user._id,
      type: 'exchange',
      currency: 'points',
      amount: amount
    }
  ]);
});
```

### 5. 商城页面

**组件结构**：
```
Shop (商城主页)
├── ExchangePoints (余额兑换积分)
│   ├── 显示当前余额和积分
│   ├── 显示兑换汇率
│   ├── 兑换表单
│   └── 兑换历史
└── 其他商品（预留）
```

**路由**：
- `/shop` - 商城主页
- `/shop/exchange` - 余额兑换积分

## 前端设计

### 导航栏更新

在Header组件中添加"商城"菜单项：

```typescript
// src/components/Layout/Header.tsx
const menuItems = [
  { name: '首页', path: '/' },
  { name: '信息搜索', path: '/search' },
  { name: '数据清单', path: '/databases' },
  { name: '商城', path: '/shop' },  // 新增
  { name: '热门话题', path: '/hot-topics' },
  { name: '常见问题', path: '/faq' }
];
```

### Dashboard更新

显示三种货币：

```typescript
const stats = [
  {
    title: '积分',
    value: user?.points || 0,
    description: '用于搜索'
  },
  {
    title: '余额',
    value: `¥${(user?.balance || 0).toFixed(2)}`,
    description: '可兑换积分'
  },
  {
    title: '佣金',
    value: `¥${(user?.commission || 0).toFixed(2)}`,
    description: '可提现'
  }
];
```

## API设计

### 新增API

1. **POST /api/user/exchange-points** - 余额兑换积分
2. **POST /api/withdraw/commission** - 佣金提现
3. **GET /api/user/commission-logs** - 佣金记录
4. **GET /api/shop/exchange-rate** - 获取兑换汇率

### 更新API

1. **GET /api/user/profile** - 返回commission字段
2. **POST /api/recharge/create** - 触发佣金计算

## 配置管理

### SystemConfig更新

```javascript
points: {
  searchCost: Number,
  exchangeRate: Number,  // 余额兑换积分汇率
  commissionRate: Number,  // 一级佣金比例
  secondLevelCommissionRate: Number,  // 二级佣金比例
  thirdLevelCommissionRate: Number,  // 三级佣金比例
  minWithdrawAmount: Number,  // 最低提现金额
  withdrawFee: Number,  // 提现手续费
  usdtRate: Number  // USDT汇率
}
```

## 错误处理

### 常见错误

1. **积分不足** - 搜索时积分不够
2. **余额不足** - 兑换时余额不够
3. **佣金不足** - 提现时佣金不够
4. **低于最低提现额** - 提现金额太小
5. **无效的提现地址** - USDT地址格式错误

### 错误响应格式

```json
{
  "success": false,
  "message": "积分不足",
  "code": "INSUFFICIENT_POINTS",
  "data": {
    "required": 10,
    "current": 5
  }
}
```

## 安全考虑

1. **事务处理** - 所有货币操作使用数据库事务
2. **并发控制** - 使用乐观锁防止并发问题
3. **金额验证** - 严格验证所有金额输入
4. **审计日志** - 记录所有货币变动
5. **提现审核** - 大额提现需要人工审核

## 测试策略

### 单元测试

1. 充值功能测试
2. 佣金计算测试
3. 兑换功能测试
4. 提现功能测试

### 集成测试

1. 完整充值流程测试
2. 推荐佣金流程测试
3. 兑换流程测试
4. 提现流程测试

### 边界测试

1. 零金额测试
2. 负数金额测试
3. 超大金额测试
4. 并发操作测试

## 性能优化

1. **缓存配置** - 缓存SystemConfig减少数据库查询
2. **批量操作** - 批量创建日志记录
3. **异步处理** - 佣金计算异步处理
4. **索引优化** - 为常用查询添加索引

## 部署计划

### 数据库迁移

1. 添加User.commission字段
2. 更新BalanceLog.type枚举
3. 添加BalanceLog.currency字段
4. 创建必要的索引

### 配置更新

1. 添加exchangeRate配置
2. 更新佣金相关配置
3. 添加提现相关配置

### 前端部署

1. 更新Header组件
2. 创建Shop页面
3. 更新Dashboard显示
4. 更新API调用

## 监控和维护

### 关键指标

1. 充值成功率
2. 佣金发放准确率
3. 兑换成功率
4. 提现处理时间
5. 系统错误率

### 日志记录

1. 所有货币操作日志
2. 错误日志
3. 审计日志
4. 性能日志
