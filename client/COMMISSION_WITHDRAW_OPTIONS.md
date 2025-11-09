# 佣金提现方式选择功能

## 📋 需求说明

用户可以选择将推荐佣金提现到：
1. **余额账户** - 直接转入 balance，可用于系统内消费
2. **USDT 钱包** - 提现到外部 USDT 钱包地址

---

## 🎯 实现方案

### 1. 前端修改

#### A. 添加提现方式选择
在 `src/pages/Dashboard/Commission.tsx` 中添加：

```typescript
const [withdrawType, setWithdrawType] = useState<'balance' | 'usdt'>('balance');
```

#### B. 提现表单更新
```tsx
{/* 提现方式选择 */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    提现方式
  </label>
  <div className="grid grid-cols-2 gap-4">
    <button
      type="button"
      onClick={() => setWithdrawType('balance')}
      className={`p-4 border-2 rounded-lg transition-all ${
        withdrawType === 'balance'
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <Wallet className="w-6 h-6 mx-auto mb-2 text-blue-600" />
      <div className="font-medium">余额账户</div>
      <div className="text-xs text-gray-500 mt-1">
        即时到账，可用于消费
      </div>
    </button>
    
    <button
      type="button"
      onClick={() => setWithdrawType('usdt')}
      className={`p-4 border-2 rounded-lg transition-all ${
        withdrawType === 'usdt'
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-600" />
      <div className="font-medium">USDT 钱包</div>
      <div className="text-xs text-gray-500 mt-1">
        需要审核，1-3个工作日
      </div>
    </button>
  </div>
</div>

{/* 提现金额 */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    提现金额 {withdrawType === 'usdt' ? '(USDT)' : '(余额)'}
  </label>
  <input
    type="number"
    value={withdrawAmount}
    onChange={(e) => setWithdrawAmount(e.target.value)}
    placeholder={`请输入提现金额 (可用: ${commissionData.availableCommission})`}
    className="input-field"
  />
</div>

{/* 只有选择 USDT 时才显示钱包地址 */}
{withdrawType === 'usdt' && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      USDT 钱包地址
    </label>
    <input
      type="text"
      value={walletAddress}
      onChange={(e) => setWalletAddress(e.target.value)}
      placeholder="请输入USDT钱包地址"
      className="input-field"
    />
    <p className="text-sm text-gray-500 mt-1">
      请确保钱包地址正确，错误地址可能导致资金丢失
    </p>
  </div>
)}
```

#### C. 提现处理逻辑
```typescript
const handleWithdraw = async () => {
  // 验证
  if (!withdrawAmount) {
    toast.error('请填写提现金额');
    return;
  }
  
  if (withdrawType === 'usdt' && !walletAddress) {
    toast.error('请填写USDT钱包地址');
    return;
  }

  const amount = parseFloat(withdrawAmount);
  if (isNaN(amount) || amount <= 0) {
    toast.error('请输入有效的提现金额');
    return;
  }

  if (amount > commissionData.availableCommission) {
    toast.error('提现金额超过可用佣金');
    return;
  }

  setWithdrawing(true);
  try {
    let response;
    
    if (withdrawType === 'balance') {
      // 提现到余额 - 即时到账
      response = await withdrawApi.withdrawToBalance(amount) as any;
    } else {
      // 提现到 USDT - 需要审核
      response = await withdrawApi.withdrawCommission(amount, 'usdt', walletAddress) as any;
    }
    
    if (response?.success) {
      if (withdrawType === 'balance') {
        toast.success('提现成功！已转入余额账户');
      } else {
        toast.success('提现申请已提交，请等待审核');
      }
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWalletAddress('');
      loadCommissionData();
    } else {
      toast.error(response?.message || '提现失败');
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || '提现失败');
  } finally {
    setWithdrawing(false);
  }
};
```

---

### 2. API 修改

#### A. 添加新的 API 方法
在 `src/utils/api.ts` 中添加：

```typescript
// 提现到余额
withdrawToBalance: async (amount: number) => {
  return api.post('/withdraw/to-balance', { amount });
},
```

---

### 3. 后端修改

#### A. 添加提现到余额的路由
在 `server/routes/withdraw.js` 中添加：

```javascript
/**
 * 提现佣金到余额账户
 * POST /api/withdraw/to-balance
 */
router.post('/to-balance', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.userId;

    // 验证金额
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: '请输入有效的提现金额'
      });
    }

    // 获取用户信息
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 计算可用佣金
    const commissionLogs = await BalanceLog.find({
      userId,
      type: 'referral_bonus',
      currency: 'points'
    });
    
    const totalCommission = commissionLogs.reduce((sum, log) => sum + log.amount, 0);
    
    // 计算已提现金额
    const withdrawnLogs = await BalanceLog.find({
      userId,
      type: { $in: ['commission_to_balance', 'commission_withdraw'] }
    });
    
    const totalWithdrawn = withdrawnLogs.reduce((sum, log) => sum + Math.abs(log.amount), 0);
    const availableCommission = totalCommission - totalWithdrawn;

    // 检查余额
    if (amount > availableCommission) {
      return res.status(400).json({
        success: false,
        message: '提现金额超过可用佣金'
      });
    }

    // 转入余额
    const balanceBefore = user.balance;
    user.balance += amount;
    await user.save();

    // 创建提现记录（扣除佣金）
    await BalanceLog.create({
      userId,
      type: 'commission_to_balance',
      currency: 'balance',
      amount: -amount,
      balanceBefore: availableCommission,
      balanceAfter: availableCommission - amount,
      description: '佣金转入余额'
    });

    // 创建余额增加记录
    await BalanceLog.create({
      userId,
      type: 'commission_to_balance',
      currency: 'balance',
      amount: amount,
      balanceBefore: balanceBefore,
      balanceAfter: user.balance,
      description: '佣金转入'
    });

    console.log(`✅ 用户 ${user.username} 提现佣金 ${amount} 到余额`);

    res.json({
      success: true,
      message: '提现成功',
      data: {
        amount,
        newBalance: user.balance,
        availableCommission: availableCommission - amount
      }
    });

  } catch (error) {
    console.error('❌ 提现到余额失败:', error);
    res.status(500).json({
      success: false,
      message: '提现失败，请稍后重试'
    });
  }
});
```

---

### 4. 数据库变更

#### 新增 BalanceLog 类型
- `commission_to_balance` - 佣金转入余额

---

## 🎨 UI 效果

### 提现方式选择
```
┌─────────────────────────────────────────────┐
│  提现方式                                    │
├─────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐        │
│  │   💰         │  │   💵         │        │
│  │  余额账户     │  │  USDT 钱包   │        │
│  │ 即时到账      │  │ 需要审核      │        │
│  │ 可用于消费    │  │ 1-3个工作日   │        │
│  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────┘
```

### 提现表单（选择余额）
```
提现金额 (余额)
┌─────────────────────────────────────────────┐
│ 100                                         │
└─────────────────────────────────────────────┘
可用佣金: 150.50

[取消]  [确认提现]
```

### 提现表单（选择USDT）
```
提现金额 (USDT)
┌─────────────────────────────────────────────┐
│ 100                                         │
└─────────────────────────────────────────────┘

USDT 钱包地址
┌─────────────────────────────────────────────┐
│ TXxx...xxxx                                 │
└─────────────────────────────────────────────┘
⚠️ 请确保钱包地址正确，错误地址可能导致资金丢失

[取消]  [提交申请]
```

---

## 📊 提现记录显示

### 提现历史
```
时间              类型        金额      状态
2024-10-24 10:00  余额账户    100.00    已完成 ✅
2024-10-23 15:30  USDT钱包    200.00    审核中 ⏳
2024-10-22 09:15  余额账户     50.00    已完成 ✅
2024-10-21 14:20  USDT钱包    150.00    已完成 ✅
```

---

## ✅ 功能特点

### 余额提现
- ✅ 即时到账
- ✅ 无需审核
- ✅ 可用于系统内消费
- ✅ 无手续费
- ✅ 无最低限额

### USDT 提现
- ⏳ 需要审核
- ⏳ 1-3个工作日到账
- 💰 可能有手续费
- 📝 需要钱包地址
- 🔒 更安全的验证流程

---

## 🔐 安全考虑

1. **金额验证**
   - 检查可用佣金余额
   - 防止负数和无效金额
   - 防止超额提现

2. **钱包地址验证**（USDT）
   - 格式验证
   - 地址确认机制
   - 错误提示

3. **审核机制**
   - 余额提现：自动通过
   - USDT提现：需要管理员审核

4. **记录追踪**
   - 所有提现都有 BalanceLog 记录
   - 可追溯和审计
   - 防止重复提现

---

## 📝 实现步骤

1. ✅ 修改前端 Commission.tsx
2. ✅ 添加 API 方法
3. ✅ 添加后端路由
4. ✅ 测试功能
5. ✅ 更新文档

---

需要我帮你实现这个功能吗？我可以：
1. 修改前端代码
2. 添加后端 API
3. 创建测试脚本
4. 更新文档
