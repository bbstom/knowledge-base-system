# 支付系统与佣金系统集成完成

## 系统概述

支付系统已经完整集成了佣金计算功能，用户充值时会自动触发推荐佣金的计算和发放。

## 核心流程

### 1. 充值流程

```
用户发起充值
    ↓
创建充值订单 (RechargeService.createRechargeOrder)
    ↓
调用BEpusdt创建支付订单
    ↓
用户完成支付
    ↓
查询订单状态 (RechargeService.queryOrderStatus)
    ↓
处理支付成功 (RechargeService.processPayment)
    ↓
├─ 积分充值 (processPointsRecharge)
│   ├─ 增加用户积分
│   ├─ 记录积分日志
│   └─ 触发佣金计算 ✅
│
└─ VIP充值 (processVipRecharge)
    ├─ 延长VIP时间
    ├─ 记录VIP日志
    └─ 触发佣金计算 ✅
```

### 2. 佣金计算流程

```
触发佣金计算 (CommissionService.calculateCommission)
    ↓
检查系统配置（是否启用佣金）
    ↓
检查用户是否有推荐人
    ↓
根据配置的佣金层级发放佣金
    ↓
├─ 一级推荐人 (commissionRate: 15%)
│   ├─ 计算佣金金额
│   ├─ 增加推荐人commission字段
│   └─ 记录佣金日志
│
├─ 二级推荐人 (secondLevelCommissionRate: 5%)
│   └─ 同上
│
└─ 三级推荐人 (thirdLevelCommissionRate: 2%)
    └─ 同上
```

## 已实现的功能

### ✅ 充值服务 (server/services/rechargeService.js)

1. **创建充值订单**
   - 生成唯一订单ID
   - 调用BEpusdt创建支付订单
   - 保存订单到数据库

2. **查询订单状态**
   - 从数据库查询订单
   - 查询BEpusdt订单状态
   - 自动处理支付成功

3. **处理积分充值**
   - 增加用户积分
   - 记录积分变动日志
   - **触发佣金计算** ✅

4. **处理VIP充值**
   - 延长VIP时间
   - 记录VIP充值日志
   - **触发佣金计算** ✅

### ✅ 佣金服务 (server/services/commissionService.js)

1. **计算推荐佣金**
   - 检查系统配置
   - 检查用户推荐关系
   - 支持多级佣金（1-3级）

2. **处理单级佣金**
   - 计算佣金金额
   - 增加推荐人佣金余额
   - 记录佣金日志

3. **获取佣金统计**
   - 当前可用佣金
   - 累计获得佣金
   - 已提现金额
   - 推荐用户数量

## 数据模型

### User模型扩展
```javascript
{
  points: Number,           // 积分
  balance: Number,          // 余额
  commission: Number,       // 佣金（新增）✅
  referredBy: ObjectId,     // 推荐人ID
  referralCode: String,     // 推荐码
  totalRecharged: Number,   // 累计充值金额
  vipExpireAt: Date,        // VIP过期时间
  // ...
}
```

### BalanceLog模型
```javascript
{
  userId: ObjectId,
  type: String,             // recharge, commission, withdraw, etc.
  currency: String,         // points, balance, commission
  amount: Number,
  balanceBefore: Number,
  balanceAfter: Number,
  relatedUserId: ObjectId,  // 关联用户（如推荐人）
  orderId: String,
  description: String,
  createdAt: Date
}
```

## 佣金配置

在SystemConfig中配置：

```javascript
points: {
  enableCommission: true,           // 启用佣金系统
  commissionRate: 15,               // 一级佣金比例 15%
  secondLevelCommissionRate: 5,     // 二级佣金比例 5%
  thirdLevelCommissionRate: 2,      // 三级佣金比例 2%
  commissionLevels: 1,              // 佣金层级 (1-3)
  commissionSettlement: 'instant',  // 结算方式：即时
  minWithdrawAmount: 50,            // 最低提现金额
  withdrawFee: 5,                   // 提现手续费 5%
  usdtRate: 0.14                    // USDT汇率
}
```

## 佣金计算示例

### 场景1：一级佣金
```
用户A推荐用户B
用户B充值100元
一级佣金 = 100 * 15% = 15元
用户A获得15元佣金
```

### 场景2：三级佣金
```
用户A推荐用户B
用户B推荐用户C
用户C推荐用户D
用户D充值100元

一级佣金（用户C）= 100 * 15% = 15元
二级佣金（用户B）= 100 * 5% = 5元
三级佣金（用户A）= 100 * 2% = 2元

总佣金支出 = 22元
```

## 错误处理

### 佣金计算失败不影响充值
```javascript
// 在rechargeService中
try {
  await commissionService.calculateCommission(user, order, 'points');
} catch (error) {
  console.error('计算佣金失败:', error);
  // 佣金计算失败不影响充值流程
}
```

### 日志记录
- 所有佣金发放都会记录到BalanceLog
- 包含推荐级别、订单类型、金额等信息
- 便于追踪和审计

## API端点

### 用户端
- `GET /api/user/commissions` - 获取佣金记录
- `GET /api/user/profile` - 获取用户信息（包含commission字段）
- `POST /api/withdraw/commission` - 佣金提现

### 充值相关
- `POST /api/recharge/create` - 创建充值订单（自动触发佣金）
- `GET /api/recharge/query/:orderId` - 查询订单状态
- `GET /api/recharge/history` - 充值历史

## 测试验证

### 测试步骤

1. **创建测试用户**
   ```bash
   用户A（推荐人）
   用户B（被推荐人，使用A的推荐码注册）
   ```

2. **用户B充值**
   ```bash
   充值金额：100元
   充值类型：积分充值
   ```

3. **验证佣金发放**
   ```bash
   检查用户A的commission字段是否增加
   检查BalanceLog中是否有佣金记录
   验证佣金金额 = 100 * 15% = 15元
   ```

4. **验证多级佣金**
   ```bash
   创建用户C（使用B的推荐码注册）
   用户C充值100元
   验证用户B获得15元（一级）
   验证用户A获得5元（二级）
   ```

## 监控和维护

### 关键指标
- 佣金发放成功率
- 佣金计算准确性
- 推荐关系完整性
- 佣金提现处理时间

### 日志监控
```javascript
✅ 佣金计算完成 - 用户: xxx, 订单金额: ¥100
✅ 1级佣金发放成功 - 推荐人: xxx, 金额: ¥15.00
✅ 2级佣金发放成功 - 推荐人: xxx, 金额: ¥5.00
```

## 安全考虑

1. **防止重复发放**
   - 订单状态检查
   - 事务处理

2. **推荐关系验证**
   - 检查推荐人是否存在
   - 防止循环推荐

3. **金额计算精度**
   - 使用Number类型
   - 保留两位小数

4. **审计日志**
   - 所有佣金操作都有日志
   - 包含完整的关联信息

## 下一步优化

1. **佣金结算方式**
   - 当前：即时到账
   - 可选：每日/每周/每月结算

2. **佣金冻结期**
   - 防止恶意刷单
   - 订单完成后N天才能提现

3. **佣金上限**
   - 单笔订单佣金上限
   - 每日/每月佣金上限

4. **佣金统计报表**
   - 推荐人收益排行
   - 佣金发放趋势
   - 推荐转化率

## 总结

✅ 支付系统已完整集成佣金功能
✅ 充值时自动触发佣金计算
✅ 支持多级佣金（1-3级）
✅ 完整的日志记录和错误处理
✅ 灵活的配置系统
✅ 安全可靠的实现

系统已经可以正常运行，用户充值时会自动计算并发放推荐佣金！
