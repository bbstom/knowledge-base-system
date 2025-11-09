# 充值页面简化方案

## 当前问题

1. ✅ 余额货币符号已修改为$
2. ⏳ 充值页面仍然显示金额输入，需要简化

## 解决方案

### 方案A: 修改现有Recharge页面（推荐）

**优点**: 保留现有功能，支持两种入口
**实现**: 
- 从RechargeCenter传递订单信息时，直接显示支付界面
- 直接访问Recharge页面时，仍可手动输入金额

**已完成**:
- ✅ 添加useLocation导入
- ✅ 检测location.state中的订单信息
- ✅ 自动设置currentOrder
- ✅ 更新汇率为USD

**还需要**:
- ⏳ 修改页面渲染逻辑，隐藏金额输入部分
- ⏳ 修改所有¥为$
- ⏳ 更新汇率显示

### 方案B: 创建新的支付页面

**优点**: 代码更清晰，专注支付流程
**缺点**: 需要创建新文件

## 推荐实施步骤

### Step 1: 修改Recharge页面显示逻辑 ✅

```typescript
// 已完成：检测订单信息
useEffect(() => {
  const state = location.state as any;
  if (state?.order) {
    setCurrentOrder({...});
  }
}, [location]);
```

### Step 2: 修改页面渲染（需要完成）

```typescript
return (
  <Layout showSidebar>
    <div className="p-6">
      {!currentOrder ? (
        // 如果没有订单，显示选择支付方式（不显示金额输入）
        <div>
          <h2>选择支付方式</h2>
          <button onClick={() => setCurrency('USDT')}>USDT</button>
          <button onClick={() => setCurrency('TRX')}>TRX</button>
          <button onClick={handleCreateOrder}>确认支付</button>
        </div>
      ) : (
        // 有订单，显示支付二维码
        <div>
          <QRCode value={currentOrder.address} />
          <p>支付金额: ${currentOrder.amount}</p>
        </div>
      )}
    </div>
  </Layout>
);
```

### Step 3: 修改所有货币符号

需要在Recharge.tsx中查找并替换：
- `¥{` → `${`
- `¥` → `$`
- `CNY` → `USD`
- 汇率说明更新

## 当前状态

### 已修改 ✅
1. Dashboard.tsx - 余额和佣金显示改为$
2. Recharge.tsx - 添加location state检测
3. Recharge.tsx - 更新汇率为USD基准

### 待修改 ⏳
1. Recharge.tsx - 隐藏金额输入，只显示支付方式选择
2. Recharge.tsx - 修改所有¥为$
3. Recharge.tsx - 简化UI流程

## 快速修复方案

如果你希望快速实现，可以：

1. **保持当前Recharge页面不变**
2. **从RechargeCenter传递完整订单信息**
3. **Recharge页面检测到订单后直接显示支付界面**

这样用户从充值中心点击套餐后，会直接看到支付二维码，无需再输入金额。

## 测试步骤

1. 进入充值中心
2. 点击任意套餐
3. 应该直接看到支付界面（不是金额输入）
4. 显示正确的金额（USD）
5. 选择USDT或TRX
6. 显示支付二维码

## 注意事项

- 保持向后兼容：直接访问/dashboard/recharge仍可手动充值
- 货币统一：所有显示都使用$
- 汇率准确：USDT=1USD，TRX需要实时汇率
