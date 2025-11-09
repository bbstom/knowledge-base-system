# 修复余额和积分系统

## 🎯 问题说明

当前系统混淆了**余额（balance）**和**积分（points）**的概念。

### 当前错误的逻辑
- 充值直接增加积分
- 搜索扣除余额（balance）
- 没有"购买积分"的功能

### 正确的逻辑应该是
1. **充值** → 增加余额（balance）- 可以提现的真实货币
2. **购买积分** → 余额减少，积分增加 - 用余额购买积分
3. **搜索** → 积分减少 - 只消耗积分
4. **提现** → 余额减少 - 只能提现余额

## 📋 需要修改的地方

### 1. 充值功能 (server/services/rechargeService.js)

#### 当前代码（错误）
```javascript
async processPointsRecharge(user, order) {
  const balanceBefore = user.balance;
  
  // 增加积分 ❌ 错误：应该增加余额
  user.points += order.points;
  user.totalRecharged += order.amount;
  await user.save();

  // 记录余额变动
  await new BalanceLog({
    userId: user._id,
    type: 'recharge',
    amount: order.points,
    balanceBefore: balanceBefore,
    balanceAfter: user.balance, // ❌ 错误：balance没有变化
    orderId: order.orderId,
    description: `充值${order.points}积分`
  }).save();
}
```

#### 修改后（正确）
```javascript
async processPointsRecharge(user, order) {
  const balanceBefore = user.balance;
  
  // 增加余额 ✅ 正确
  user.balance += order.amount;
  user.totalRecharged += order.amount;
  await user.save();

  // 记录余额变动
  await new BalanceLog({
    userId: user._id,
    type: 'recharge',
    amount: order.amount,
    balanceBefore: balanceBefore,
    balanceAfter: user.balance,
    orderId: order.orderId,
    description: `充值 ¥${order.amount}`
  }).save();
}
```

### 2. 搜索功能 (server/routes/search.js)

#### 已修复 ✅
```javascript
// 需要扣除积分
if (user.points < searchCost) {
  return res.status(400).json({
    success: false,
    message: '积分不足，请先充值'
  });
}

const pointsBefore = user.points;
user.points -= searchCost;
await user.save();
```

### 3. 新增：购买积分功能

需要创建一个新的API，让用户用余额购买积分。

#### 路由 (server/routes/user.js)
```javascript
/**
 * 购买积分
 * POST /api/user/buy-points
 */
router.post('/buy-points', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body; // 要购买的积分数量
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: '请输入有效的积分数量'
      });
    }
    
    // 获取积分价格配置（例如：1元 = 10积分）
    const SystemConfig = require('../models/SystemConfig');
    const config = await SystemConfig.findOne();
    const pointsPerYuan = config?.points?.pointsPerYuan || 10;
    
    // 计算需要的余额
    const cost = amount / pointsPerYuan;
    
    // 检查余额是否足够
    if (req.user.balance < cost) {
      return res.status(400).json({
        success: false,
        message: '余额不足，请先充值'
      });
    }
    
    // 扣除余额
    const balanceBefore = req.user.balance;
    req.user.balance -= cost;
    
    // 增加积分
    const pointsBefore = req.user.points;
    req.user.points += amount;
    
    await req.user.save();
    
    // 记录余额变动
    await new BalanceLog({
      userId: req.user._id,
      type: 'consume',
      amount: -cost,
      balanceBefore: balanceBefore,
      balanceAfter: req.user.balance,
      description: `购买${amount}积分`
    }).save();
    
    // 记录积分变动（可选，如果需要单独的积分日志）
    await new BalanceLog({
      userId: req.user._id,
      type: 'points_purchase',
      amount: amount,
      balanceBefore: pointsBefore,
      balanceAfter: req.user.points,
      description: `购买积分：花费¥${cost.toFixed(2)}`
    }).save();
    
    res.json({
      success: true,
      message: `成功购买${amount}积分`,
      data: {
        pointsAdded: amount,
        costBalance: cost,
        newBalance: req.user.balance,
        newPoints: req.user.points
      }
    });
  } catch (error) {
    console.error('Buy points error:', error);
    res.status(500).json({
      success: false,
      message: '购买积分失败'
    });
  }
});
```

### 4. 前端：购买积分页面

创建一个新页面 `src/pages/Dashboard/BuyPoints.tsx`

```typescript
import React, { useState } from 'react';
import { Layout } from '../../components/Layout/Layout';
import { Coins, Wallet } from 'lucide-react';
import { userApi } from '../../utils/api';
import toast from 'react-hot-toast';

export const BuyPoints: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  const pointsPerYuan = 10; // 从配置获取
  const cost = amount ? (parseInt(amount) / pointsPerYuan).toFixed(2) : '0.00';
  
  const handleBuy = async () => {
    if (!amount || parseInt(amount) <= 0) {
      toast.error('请输入有效的积分数量');
      return;
    }
    
    setLoading(true);
    try {
      const response = await userApi.buyPoints(parseInt(amount));
      if (response.success) {
        toast.success(`成功购买${amount}积分`);
        setAmount('');
        // 刷新用户数据
      }
    } catch (error: any) {
      toast.error(error.message || '购买失败');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout showSidebar>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">购买积分</h1>
        
        <div className="card max-w-md">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              购买数量
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="请输入积分数量"
              className="input-field"
            />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">兑换比例:</span>
              <span className="font-medium">1元 = {pointsPerYuan}积分</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">需要余额:</span>
              <span className="font-bold text-lg">¥{cost}</span>
            </div>
          </div>
          
          <button
            onClick={handleBuy}
            disabled={loading || !amount}
            className="btn-primary w-full"
          >
            {loading ? '购买中...' : '确认购买'}
          </button>
        </div>
      </div>
    </Layout>
  );
};
```

## 🔄 完整的资金流程

### 1. 充值流程
```
用户支付 → 增加余额（balance）→ 记录充值日志
```

### 2. 购买积分流程
```
余额（balance）减少 → 积分（points）增加 → 记录消费日志
```

### 3. 搜索流程
```
积分（points）减少 → 记录搜索消费日志
```

### 4. 提现流程
```
余额（balance）减少 → 转账到USDT钱包 → 记录提现日志
```

## 📊 BalanceLog类型说明

需要更新BalanceLog的type枚举：

```javascript
type: {
  type: String,
  enum: [
    'recharge',          // 充值（增加余额）
    'consume',           // 消费（减少余额，如购买积分）
    'refund',            // 退款（增加余额）
    'commission',        // 推荐奖励（增加余额）
    'vip',              // VIP充值（减少余额）
    'search',           // 搜索消费（减少积分）
    'points_purchase',  // 购买积分（增加积分）
    'withdraw'          // 提现（减少余额）
  ],
  required: true
}
```

## 🎨 前端显示

### Dashboard概览
```
余额: ¥100.00  （可提现）
积分: 1000     （用于搜索）
```

### 充值中心
```
充值金额 → 增加余额
```

### 购买积分
```
使用余额购买积分
1元 = 10积分
```

### 搜索页面
```
当前积分: 1000
本次搜索消耗: 10积分
```

## ✅ 修改清单

- [ ] 修改 `server/services/rechargeService.js` - 充值增加余额而不是积分
- [ ] 修改 `server/routes/search.js` - 搜索扣除积分（已完成）
- [ ] 添加 `server/routes/user.js` - 购买积分API
- [ ] 更新 `server/models/BalanceLog.js` - 添加新的type类型
- [ ] 创建 `src/pages/Dashboard/BuyPoints.tsx` - 购买积分页面
- [ ] 更新 `src/utils/api.ts` - 添加buyPoints方法
- [ ] 更新 `src/App.tsx` - 添加购买积分路由
- [ ] 更新 Dashboard 显示 - 明确区分余额和积分

## 🎯 总结

修改后的系统将有清晰的资金流：
1. **充值** → 余额增加
2. **购买积分** → 余额减少，积分增加
3. **搜索** → 积分减少
4. **提现** → 余额减少

这样余额和积分的概念就完全分离了！
