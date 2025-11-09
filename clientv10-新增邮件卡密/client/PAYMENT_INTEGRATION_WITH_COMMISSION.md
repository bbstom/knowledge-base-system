# 支付系统与余额积分佣金系统集成方案

## 概述

系统已经集成了BEpusdt支付网关，现在需要将支付系统与余额积分佣金系统完整集成，实现以下流程：

```
用户充值 → 支付成功 → 增加积分/VIP → 计算推荐佣金 → 发放佣金
```

## 当前状态

### ✅ 已实现
1. **BEpusdt支付集成** - 支持USDT/TRX充值
2. **充值订单管理** - RechargeOrder模型
3. **充值服务** - rechargeService.js
4. **佣金系统** - 佣金提现、转余额
5. **余额兑换** - 余额兑换积分

### 🔄 需要集成
1. **充值成功后自动计算佣金**
2. **佣金发放到推荐人账户**
3. **多级佣金计算**
4. **佣金日志记录**

## 集成方案

### 方案1：在充值回调中集成佣金计算（推荐）

**优势**：
- 实时发放佣金
- 逻辑集中，易于维护
- 用户体验好

**实现位置**：`server/services/rechargeService.js`

#### 实现步骤

**1. 更新rechargeService.js**

在充值成功处理函数中添加佣金计算：

```javascript
// server/services/rechargeService.js

const commissionService = require('./commissionService');

async function processPointsRecharge(user, order) {
  // 1. 增加积分
  const pointsBefore = user.points;
  user.points += order.points;
  user.totalRecharged += order.amount;
  await user.save();
  
  // 2. 记录积分日志
  await BalanceLog.create({
    userId: user._id,
    type: 'recharge',
    currency: 'points',
    amount: order.points,
    balanceBefore: pointsBefore,
    balanceAfter: user.points,
    orderId: order.orderNo,
    description: `充值${order.points}积分`
  });
  
  // 3. 计算并发放推荐佣金 ⭐ 新增
  await commissionService.calculateAndDistributeCommission(user, order);
  
  return { success: true };
}

async function processVipRecharge(user, order) {
  // 1. 延长VIP
  user.extendVip(order.vipDays);
  user.totalRecharged += order.amount;
  await user.save();
  
  // 2. 记录VIP日志
  await BalanceLog.create({
    userId: user._id,
    type: 'vip',
    currency: 'balance',
    amount: order.amount,
    balanceBefore: 0,
    balanceAfter: 0,
    orderId: order.orderNo,
    description: `开通VIP ${order.vipDays}天`
  });
  
  // 3. 计算并发放推荐佣金 ⭐ 新增
  await commissionService.calculateAndDistributeCommission(user, order);
  
  return { success: true };
}
```

**2. 创建/更新commissionService.js**

```javascript
// server/services/commissionService.js

const User = require('../models/User');
const BalanceLog = require('../models/BalanceLog');
const SystemConfig = require('../models/SystemConfig');

class CommissionService {
  /**
   * 计算并发放推荐佣金
   * @param {Object} user - 充值用户
   * @param {Object} order - 充值订单
   */
  async calculateAndDistributeCommission(user, order) {
    try {
      // 获取系统配置
      const config = await SystemConfig.getConfig();
      
      // 检查是否启用佣金
      if (!config.points.enableCommission) {
        console.log('佣金系统未启用');
        return;
      }
      
      // 检查用户是否有推荐人
      if (!user.referredBy) {
        console.log('用户没有推荐人');
        return;
      }
      
      // 计算佣金金额
      const commissionAmount = this.calculateCommissionAmount(
        order.amount, 
        config.points.commissionRate
      );
      
      if (commissionAmount <= 0) {
        console.log('佣金金额为0');
        return;
      }
      
      // 发放一级佣金
      await this.distributeCommission(
        user.referredBy,
        user._id,
        commissionAmount,
        order.orderNo,
        1
      );
      
      // 如果启用多级佣金
      if (config.points.commissionLevels > 1) {
        await this.distributeMultiLevelCommission(
          user,
          order,
          config
        );
      }
      
      console.log(`✅ 佣金发放成功: ¥${commissionAmount}`);
    } catch (error) {
      console.error('佣金计算失败:', error);
      // 不影响充值流程，只记录错误
    }
  }
  
  /**
   * 计算佣金金额
   * @param {Number} amount - 充值金额
   * @param {Number} rate - 佣金比例
   * @returns {Number} 佣金金额
   */
  calculateCommissionAmount(amount, rate) {
    return Number((amount * rate / 100).toFixed(2));
  }
  
  /**
   * 发放佣金
   * @param {String} referrerId - 推荐人ID
   * @param {String} userId - 充值用户ID
   * @param {Number} amount - 佣金金额
   * @param {String} orderNo - 订单号
   * @param {Number} level - 佣金层级
   */
  async distributeCommission(referrerId, userId, amount, orderNo, level) {
    // 查找推荐人
    const referrer = await User.findById(referrerId);
    if (!referrer) {
      console.log('推荐人不存在');
      return;
    }
    
    // 增加推荐人佣金
    const commissionBefore = referrer.commission;
    referrer.commission += amount;
    await referrer.save();
    
    // 记录佣金日志
    await BalanceLog.create({
      userId: referrer._id,
      type: 'commission',
      currency: 'commission',
      amount: amount,
      balanceBefore: commissionBefore,
      balanceAfter: referrer.commission,
      relatedUserId: userId,
      orderId: orderNo,
      description: `${level}级推荐佣金：¥${amount.toFixed(2)}`
    });
    
    console.log(`✅ ${level}级佣金发放: ${referrer.username} 获得 ¥${amount}`);
  }
  
  /**
   * 发放多级佣金
   * @param {Object} user - 充值用户
   * @param {Object} order - 充值订单
   * @param {Object} config - 系统配置
   */
  async distributeMultiLevelCommission(user, order, config) {
    let currentUser = user;
    
    // 二级佣金
    if (config.points.commissionLevels >= 2 && currentUser.referredBy) {
      const firstLevelReferrer = await User.findById(currentUser.referredBy);
      if (firstLevelReferrer && firstLevelReferrer.referredBy) {
        const secondCommission = this.calculateCommissionAmount(
          order.amount,
          config.points.secondLevelCommissionRate
        );
        
        if (secondCommission > 0) {
          await this.distributeCommission(
            firstLevelReferrer.referredBy,
            user._id,
            secondCommission,
            order.orderNo,
            2
          );
        }
      }
    }
    
    // 三级佣金
    if (config.points.commissionLevels >= 3 && currentUser.referredBy) {
      const firstLevelReferrer = await User.findById(currentUser.referredBy);
      if (firstLevelReferrer && firstLevelReferrer.referredBy) {
        const secondLevelReferrer = await User.findById(firstLevelReferrer.referredBy);
        if (secondLevelReferrer && secondLevelReferrer.referredBy) {
          const thirdCommission = this.calculateCommissionAmount(
            order.amount,
            config.points.thirdLevelCommissionRate
          );
          
          if (thirdCommission > 0) {
            await this.distributeCommission(
              secondLevelReferrer.referredBy,
              user._id,
              thirdCommission,
              order.orderNo,
              3
            );
          }
        }
      }
    }
  }
}

module.exports = new CommissionService();
```

**3. 更新充值回调处理**

```javascript
// server/routes/recharge.js

router.post('/webhook', async (req, res) => {
  try {
    const { order_id, status, amount } = req.body;
    
    // 验证签名...
    
    if (status === 'paid') {
      const order = await RechargeOrder.findOne({ orderNo: order_id });
      
      if (order && order.status === 'pending') {
        // 更新订单状态
        order.status = 'completed';
        order.paidAt = new Date();
        await order.save();
        
        // 查找用户
        const user = await User.findById(order.userId);
        
        // 处理充值（会自动计算佣金）
        if (order.type === 'points') {
          await rechargeService.processPointsRecharge(user, order);
        } else if (order.type === 'vip') {
          await rechargeService.processVipRecharge(user, order);
        }
        
        console.log(`✅ 充值成功: ${user.username} - ¥${order.amount}`);
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook处理失败:', error);
    res.status(500).json({ success: false });
  }
});
```

## 完整流程图

```
用户充值
    ↓
创建充值订单
    ↓
用户支付（BEpusdt）
    ↓
支付成功回调
    ↓
更新订单状态
    ↓
增加用户积分/VIP
    ↓
记录充值日志
    ↓
查找推荐人
    ↓
计算佣金金额
    ↓
发放一级佣金
    ↓
发放二级佣金（如果启用）
    ↓
发放三级佣金（如果启用）
    ↓
记录佣金日志
    ↓
完成
```

## 佣金计算示例

### 示例1：一级佣金
```
充值金额: ¥100
佣金比例: 15%
一级佣金: ¥15

用户A充值¥100 → 推荐人B获得¥15佣金
```

### 示例2：三级佣金
```
充值金额: ¥100
一级佣金: 15% = ¥15
二级佣金: 5% = ¥5
三级佣金: 2% = ¥2

用户A充值¥100
→ 推荐人B（一级）获得¥15
→ 推荐人C（二级）获得¥5
→ 推荐人D（三级）获得¥2
```

## 配置说明

### SystemConfig配置项

```javascript
points: {
  // 佣金配置
  enableCommission: true,           // 是否启用佣金
  commissionRate: 15,               // 一级佣金比例（%）
  secondLevelCommissionRate: 5,     // 二级佣金比例（%）
  thirdLevelCommissionRate: 2,      // 三级佣金比例（%）
  commissionLevels: 3,              // 佣金层级（1-3）
  commissionSettlement: 'instant',  // 结算方式（instant/monthly）
}
```

## 测试流程

### 1. 测试一级佣金
```
1. 用户A注册（推荐码：B的推荐码）
2. 用户A充值¥100
3. 验证：用户A获得积分
4. 验证：用户B获得¥15佣金
5. 验证：佣金日志正确记录
```

### 2. 测试多级佣金
```
1. 用户D注册（无推荐人）
2. 用户C注册（推荐人：D）
3. 用户B注册（推荐人：C）
4. 用户A注册（推荐人：B）
5. 用户A充值¥100
6. 验证：B获得¥15，C获得¥5，D获得¥2
```

### 3. 测试佣金提现
```
1. 用户B查看佣金余额
2. 用户B申请提现到USDT
3. 验证：佣金扣除正确
4. 验证：提现订单创建
```

### 4. 测试佣金转余额
```
1. 用户B查看佣金余额
2. 用户B将佣金转入余额
3. 验证：佣金减少，余额增加
4. 验证：日志记录正确
```

### 5. 测试余额兑换
```
1. 用户B查看余额
2. 用户B兑换积分
3. 验证：余额减少，积分增加
4. 验证：兑换汇率正确
```

## 监控和日志

### 关键日志
```javascript
// 充值成功
console.log(`✅ 充值成功: ${user.username} - ¥${order.amount}`);

// 佣金发放
console.log(`✅ 佣金发放: ${referrer.username} 获得 ¥${amount}`);

// 佣金计算失败
console.error('❌ 佣金计算失败:', error);
```

### 监控指标
1. 充值成功率
2. 佣金发放成功率
3. 佣金发放金额统计
4. 推荐关系链深度
5. 平均佣金金额

## 安全考虑

### 1. 防止重复发放
```javascript
// 检查订单状态
if (order.status !== 'pending') {
  console.log('订单已处理');
  return;
}
```

### 2. 事务处理
```javascript
// 使用数据库事务
const session = await mongoose.startSession();
session.startTransaction();

try {
  // 更新用户积分
  // 发放佣金
  // 记录日志
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### 3. 金额验证
```javascript
// 验证金额合理性
if (amount <= 0 || amount > 100000) {
  throw new Error('金额异常');
}
```

## 优化建议

### 1. 异步处理
```javascript
// 使用消息队列异步处理佣金
await queue.add('calculate-commission', {
  userId: user._id,
  orderId: order._id
});
```

### 2. 缓存配置
```javascript
// 缓存SystemConfig减少数据库查询
const config = await cache.get('system-config') || 
               await SystemConfig.getConfig();
```

### 3. 批量操作
```javascript
// 批量创建日志
await BalanceLog.insertMany([log1, log2, log3]);
```

## 总结

支付系统与余额积分佣金系统的集成方案：

✅ **已有基础**：
- BEpusdt支付集成
- 充值订单管理
- 佣金提现功能
- 余额兑换功能

🔄 **需要实现**：
- 在充值回调中集成佣金计算
- 实现多级佣金发放
- 完善佣金日志记录

📝 **实施步骤**：
1. 更新rechargeService.js添加佣金计算调用
2. 完善commissionService.js实现佣金发放逻辑
3. 测试充值→佣金发放完整流程
4. 监控和优化

这样就能实现完整的"充值→积分→佣金→提现→兑换"闭环！
