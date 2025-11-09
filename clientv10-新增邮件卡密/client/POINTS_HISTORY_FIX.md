# 积分记录显示问题修复

## 问题描述
用户中心-积分中心页面不能正确显示积分记录。

## 问题原因
后端API在查询积分历史时，使用了错误的查询条件：
- 原来查询：`type: { $in: ['recharge', 'reward'] }`
- 问题：
  1. `BalanceLog`模型的`type`枚举中没有`reward`类型
  2. 应该根据`currency`字段查询，而不是`type`
  3. 没有正确计算已使用的积分

## 修复方案

### 后端修复 (server/routes/user.js)

**修改前：**
```javascript
const logs = await BalanceLog.find({ 
  userId: req.user._id,
  type: { $in: ['recharge', 'reward'] }
})
```

**修改后：**
```javascript
const logs = await BalanceLog.find({ 
  userId: req.user._id,
  currency: 'points'  // 查询所有积分相关的记录
})
```

### 主要改进

1. **正确的查询条件**
   - 使用`currency: 'points'`查询所有积分相关记录
   - 包括充值、消费、退款等所有类型

2. **计算已使用积分**
   ```javascript
   const usedPointsResult = await BalanceLog.aggregate([
     {
       $match: {
         userId: req.user._id,
         currency: 'points',
         amount: { $lt: 0 }
       }
     },
     {
       $group: {
         _id: null,
         total: { $sum: '$amount' }
       }
     }
   ]);
   ```

3. **类型映射优化**
   ```javascript
   const typeMapping = {
     'recharge': 'recharge',
     'recharge_card': 'recharge',
     'commission': 'referral',
     'search': 'purchase',
     'exchange': 'purchase',
     'vip': 'purchase',
     'refund': 'bonus'
   };
   ```

## 测试结果

### 测试数据
- 用户：kailsay
- 总积分：660
- 已使用：10
- 记录数：5条

### 记录详情
1. 搜索消费：-10积分
2. 卡密充值：+100积分
3. 卡密充值：+100积分
4. 在线充值：+100积分
5. 在线充值：+100积分

## 修改的文件
- `server/routes/user.js` - 修复积分历史查询逻辑
- `server/scripts/testPointsHistory.js` - 更新测试脚本

## 功能验证
✅ 正确显示所有积分记录（充值、消费、退款等）
✅ 正确计算已使用积分
✅ 正确映射记录类型到前端显示
✅ 支持分页查询
✅ 包含完整的记录信息（时间、类型、金额、描述）

## 影响范围
- 用户中心 - 积分中心页面
- 积分记录列表显示
- 积分统计数据

## 注意事项
- 需要重启服务器使修改生效
- 前端无需修改，自动适配新的数据结构
- 所有历史数据都能正确显示
