# 佣金管理最终修复

## 问题历程

### 问题1：显示负数
- **原因**：计算逻辑错误，已提现 = 记录总额 - 当前佣金
- **结果**：0.45 - 100 = -99.55

### 问题2：未提现却显示已提现
- **原因**：使用 `>=` 判断，导致记录总额等于当前佣金时也计算已提现
- **结果**：用户获得佣金后立即显示"已提现"

### 问题3：加载失败
- **原因**：API方法名错误，使用了`getHistory`而不是`getWithdrawHistory`
- **结果**：前端显示"加载佣金数据失败"

## 最终解决方案

### 正确的业务流程
1. **获得佣金** → 显示在"可提现"
2. **申请提现** → 转入"待结算"，"可提现"减少
3. **审批通过** → 转入"已提现"，"待结算"减少
4. **审批拒绝** → 退回"可提现"

### 数据来源
```javascript
// 从提现订单状态计算
const withdrawOrders = await withdrawApi.getWithdrawHistory(1, 100, 'commission');

// 待结算：pending和processing状态
const pendingAmount = withdrawOrders
  .filter(order => ['pending', 'processing'].includes(order.status))
  .reduce((sum, order) => sum + order.amount, 0);

// 已提现：completed状态
const withdrawnAmount = withdrawOrders
  .filter(order => order.status === 'completed')
  .reduce((sum, order) => sum + order.amount, 0);

// 总佣金 = 当前可用 + 待结算 + 已提现
const totalCommission = currentCommission + pendingAmount + withdrawnAmount;
```

### 容错处理
```javascript
// 分别获取数据，避免一个失败导致全部失败
const commissionResponse = await userApi.getCommissions();
const profileResponse = await userApi.getProfile();

// 提现记录单独处理，失败不影响佣金显示
let withdrawResponse = null;
try {
  withdrawResponse = await withdrawApi.getWithdrawHistory(1, 100, 'commission');
} catch (error) {
  console.warn('Failed to load withdraw history:', error);
}
```

## 测试场景

### 场景1：新用户获得佣金
- 获得佣金：100
- **显示**：
  - 总佣金：100
  - 可提现：100
  - 待结算：0
  - 已提现：0 ✅

### 场景2：申请提现30，待审批
- 当前佣金：70
- pending订单：30
- **显示**：
  - 总佣金：100
  - 可提现：70
  - 待结算：30
  - 已提现：0 ✅

### 场景3：审批通过
- 当前佣金：70
- completed订单：30
- **显示**：
  - 总佣金：100
  - 可提现：70
  - 待结算：0
  - 已提现：30 ✅

### 场景4：审批拒绝
- 当前佣金：100（退回）
- rejected订单：30
- **显示**：
  - 总佣金：100
  - 可提现：100
  - 待结算：0
  - 已提现：0 ✅

## 修改的文件
- `src/pages/Dashboard/Commission.tsx` - 修复佣金计算逻辑和API调用
- `server/scripts/testCommissionFlow.js` - 新增测试脚本

## 关键修复点
1. ✅ 使用提现订单状态计算，而不是差值计算
2. ✅ 正确的API方法名：`getWithdrawHistory`
3. ✅ 添加容错处理，提现记录失败不影响佣金显示
4. ✅ 只有completed状态才计入"已提现"
5. ✅ pending/processing状态计入"待结算"

## 数据一致性
- 总佣金 = 可提现 + 待结算 + 已提现
- 这个公式在任何状态下都成立
- 不依赖佣金记录总额，避免数据不一致问题
