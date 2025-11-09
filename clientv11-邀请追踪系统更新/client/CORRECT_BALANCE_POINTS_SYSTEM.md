# 正确的余额和积分系统

## ✅ 正确的逻辑

### 1. 充值 → 增加积分
- 用户充值直接获得积分
- 积分是主要货币，用于搜索

### 2. 搜索 → 积分减少
- 搜索消耗积分
- 不消耗余额

### 3. 佣金提现 → 可选择提现到USDT钱包或余额
- 推荐佣金可以提现到USDT钱包
- 或者提现到余额账户

### 4. 余额兑换积分 → 余额减少，积分增加
- 余额可以兑换成积分
- 兑换汇率可在管理员界面调整
- 默认：1元余额 = 10积分

## 📊 资金流程图

```
充值 → 积分增加
  ↓
搜索 → 积分减少

推荐佣金 → 余额增加
  ↓
余额兑换 → 余额减少 + 积分增加
  ↓
搜索 → 积分减少

或

推荐佣金 → 提现到USDT钱包
```

## 🎯 核心概念

### 积分（Points）
- **定义**：主要货币，用于搜索
- **来源**：
  1. 充值获得
  2. 余额兑换
  3. 签到奖励
  4. 注册奖励
- **用途**：搜索查询
- **特点**：不能提现

### 余额（Balance）
- **定义**：佣金账户，可以提现或兑换
- **来源**：
  1. 推荐佣金
  2. 退款
- **用途**：
  1. 兑换积分
  2. 提现到USDT钱包
- **特点**：可以提现

## 🔧 已完成的修改

### 1. 充值功能 ✅
**文件**: `server/services/rechargeService.js`

```javascript
// 充值增加积分
user.points += order.points;
```

### 2. 搜索功能 ✅
**文件**: `server/routes/search.js`

```javascript
// 搜索扣除积分
if (user.points < searchCost) {
  return res.status(400).json({
    success: false,
    message: '积分不足，请先充值'
  });
}
user.points -= searchCost;
```

### 3. 余额兑换积分 ✅
**文件**: `server/routes/user.js`

**新增API**: `POST /api/user/exchange-points`

```javascript
// 获取兑换汇率
const exchangeRate = config?.points?.exchangeRate || 10;

// 计算成本
const cost = amount / exchangeRate;

// 扣除余额，增加积分
user.balance -= cost;
user.points += amount;
```

### 4. 系统配置 ✅
**文件**: `server/models/SystemConfig.js`

```javascript
points: {
  exchangeRate: { type: Number, default: 10 }, // 1元 = 10积分
  searchCost: { type: Number, default: 10 },
  // ... 其他配置
}
```

### 5. 管理员界面 ✅
**文件**: `src/pages/Admin/PointsConfig.tsx`

添加了"余额兑换积分汇率"配置项：
- 管理员可以调整兑换汇率
- 默认：1元 = 10积分

### 6. BalanceLog类型 ✅
**文件**: `server/models/BalanceLog.js`

```javascript
enum: [
  'recharge',   // 充值积分
  'search',     // 搜索消费
  'commission', // 推荐佣金（增加余额）
  'exchange',   // 余额兑换积分
  'withdraw',   // 提现
  // ... 其他类型
]
```

### 7. 前端显示 ✅
**文件**: `src/pages/Dashboard/BalanceLogs.tsx`

更新了类型标签：
- 充值积分（绿色）
- 搜索消费（红色）
- 推荐佣金（紫色）
- 余额兑换（蓝色）
- 提现（橙色）

## 📱 用户界面

### Dashboard概览
```
┌─────────────────────────────────┐
│ 积分: 1000  （用于搜索）        │
│ 余额: ¥50   （佣金，可提现）    │
└─────────────────────────────────┘
```

### 充值中心
```
选择充值套餐 → 支付 → 积分增加
例如：充值¥100 → 获得1000积分
```

### 余额兑换
```
输入兑换数量 → 计算成本 → 确认兑换
兑换汇率：1元 = 10积分（可调整）
例如：¥10余额 → 100积分
```

### 搜索页面
```
当前积分: 1000
本次搜索消耗: 10积分
积分不足？ → 去充值 或 去兑换
```

### 推荐奖励
```
推荐佣金: ¥50
可以：
1. 提现到USDT钱包
2. 兑换成积分使用
```

## 🔄 完整的用户流程

### 流程1：充值使用
```
1. 用户充值¥100
2. 获得1000积分
3. 使用积分搜索
4. 每次搜索消耗10积分
```

### 流程2：推荐赚钱
```
1. 用户推荐新用户
2. 获得佣金到余额（例如¥50）
3. 选择：
   a. 提现到USDT钱包
   b. 兑换成积分（¥50 → 500积分）
4. 使用积分搜索
```

## 🎨 管理员配置

### 积分配置
在"系统设置 → 积分配置"中可以调整：

1. **搜索成本**：每次搜索消耗的积分（默认10）
2. **兑换汇率**：1元余额可兑换的积分数（默认10）
3. **佣金比例**：推荐奖励的比例（默认15%）
4. **提现设置**：最低提现金额、手续费等

### 充值套餐
在"充值配置"中可以设置：
- 不同金额的充值套餐
- 每个套餐对应的积分数量
- 优惠活动（例如：充¥100送100积分）

## 📝 API接口

### 1. 充值
```
POST /api/recharge/create
Body: {
  type: "points",
  amount: 100,
  points: 1000
}
```

### 2. 余额兑换积分
```
POST /api/user/exchange-points
Body: {
  amount: 100  // 兑换100积分
}
Response: {
  success: true,
  data: {
    pointsAdded: 100,
    costBalance: 10,
    newBalance: 40,
    newPoints: 1100,
    exchangeRate: 10
  }
}
```

### 3. 搜索
```
POST /api/search
Body: {
  type: "phone",
  query: "13800138000"
}
// 自动扣除积分
```

### 4. 提现
```
POST /api/withdraw/create
Body: {
  amount: 50,
  type: "usdt",  // 或 "balance"
  address: "0x..."
}
```

## ✅ 修改的文件清单

1. ✅ `server/services/rechargeService.js` - 充值增加积分
2. ✅ `server/routes/search.js` - 搜索扣除积分
3. ✅ `server/routes/user.js` - 新增余额兑换积分API
4. ✅ `server/models/BalanceLog.js` - 更新类型枚举
5. ✅ `server/models/SystemConfig.js` - 添加exchangeRate配置
6. ✅ `src/pages/Admin/SystemSettings.tsx` - 添加exchangeRate初始值
7. ✅ `src/pages/Admin/PointsConfig.tsx` - 添加兑换汇率配置项
8. ✅ `src/pages/Dashboard/BalanceLogs.tsx` - 更新类型显示

## 🧪 测试步骤

### 1. 测试充值
1. 进入充值中心
2. 选择充值套餐（例如¥100 = 1000积分）
3. 完成支付
4. 检查积分增加1000
5. 检查余额没有变化

### 2. 测试搜索
1. 确保有足够积分
2. 进行搜索
3. 检查积分减少
4. 检查余额没有变化

### 3. 测试推荐佣金
1. 推荐新用户注册
2. 检查余额增加
3. 检查积分没有变化

### 4. 测试余额兑换
1. 确保有余额
2. 进入兑换页面
3. 输入兑换数量（例如100积分）
4. 确认兑换
5. 检查余额减少¥10
6. 检查积分增加100

### 5. 测试管理员配置
1. 进入"系统设置 → 积分配置"
2. 修改兑换汇率（例如改为20）
3. 保存配置
4. 前端兑换时应使用新汇率

## ✨ 总结

现在系统的逻辑是：

- ✅ **充值** → 直接获得积分
- ✅ **搜索** → 消耗积分
- ✅ **推荐佣金** → 增加余额
- ✅ **余额兑换** → 余额换积分（汇率可调）
- ✅ **提现** → 余额提现到USDT

这样的设计更加合理：
1. 积分是主要货币，用于搜索
2. 余额是佣金账户，可以提现或兑换
3. 两者分离，各司其职
4. 兑换汇率可调，灵活性高

完全符合你的需求！🎉
