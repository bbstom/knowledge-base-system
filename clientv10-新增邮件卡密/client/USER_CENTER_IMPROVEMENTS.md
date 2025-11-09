# 用户中心功能完善

## 📋 概述

完善用户中心的三个核心功能：
1. **搜索历史** - 保存并显示用户的查询记录
2. **推荐奖励** - 从数据库获取真实的推荐数据
3. **积分记录** - 显示所有积分变动（充值、邀请、消费等）

## ✅ 已完成的功能

### 1. 搜索历史功能

#### 后端实现 (server/routes/user.js)
```javascript
// GET /api/user/search-history
// 从SearchLog模型获取用户的搜索记录
- 支持分页（默认20条/页）
- 按时间倒序排列
- 返回完整的搜索信息：
  - searchType: 搜索类型
  - searchQuery: 查询内容
  - resultsCount: 结果数量
  - pointsCharged: 消耗积分
  - searchTime: 搜索耗时
  - databasesSearched: 搜索的数据库数量
```

#### 前端实现 (src/pages/Dashboard/SearchHistory.tsx)
- ✅ 显示搜索历史列表
- ✅ 显示搜索类型、查询内容、结果数量
- ✅ 显示积分消耗（免费/扣费）
- ✅ 显示搜索耗时
- ✅ 统计数据：总次数、有结果次数、无结果次数、消耗积分
- ✅ 分页功能
- ✅ 筛选功能（按状态、时间范围）
- ✅ 导出CSV功能

### 2. 推荐奖励功能

#### 后端实现 (server/routes/user.js)
```javascript
// GET /api/user/referral-stats
// 获取推荐统计信息
- referralCode: 用户的推荐码
- totalReferrals: 推荐人数
- totalEarnings: 总收益
- referredUsers: 被推荐用户列表

// GET /api/user/commissions
// 获取佣金记录
- 从BalanceLog中筛选type='commission'的记录
- 支持分页
- 计算总佣金
- 返回详细的佣金记录
```

#### 前端实现
- ✅ 显示推荐码
- ✅ 显示推荐人数和总收益
- ✅ 显示被推荐用户列表
- ✅ 显示佣金记录详情

### 3. 积分记录功能

#### 后端实现 (server/routes/user.js)
```javascript
// GET /api/user/balance-logs
// 获取积分变动记录
- 支持多种类型：
  - recharge: 充值
  - consume: 消费
  - refund: 退款
  - commission: 推荐奖励
  - vip: VIP奖励
  - search: 搜索消费
- 显示变动前后余额
- 支持分页
```

#### 前端实现 (src/pages/Dashboard/BalanceLogs.tsx)
- ✅ 显示积分变动记录
- ✅ 区分不同类型（充值、消费、奖励等）
- ✅ 显示变动金额和余额
- ✅ 显示详细描述
- ✅ 支持刷新和加载更多

## 📊 数据模型

### SearchLog (搜索日志)
```javascript
{
  userId: ObjectId,           // 用户ID
  searchType: String,         // 搜索类型（idcard/phone/name等）
  searchQuery: String,        // 查询内容
  searchFingerprint: String,  // 搜索指纹（用于判断重复）
  resultsCount: Number,       // 结果数量
  pointsCharged: Number,      // 消耗积分
  searchTime: Number,         // 搜索耗时（毫秒）
  databasesSearched: Number,  // 搜索的数据库数量
  createdAt: Date            // 创建时间
}
```

### BalanceLog (积分日志)
```javascript
{
  userId: ObjectId,          // 用户ID
  type: String,              // 类型（recharge/consume/commission等）
  amount: Number,            // 变动金额
  balanceBefore: Number,     // 变动前余额
  balanceAfter: Number,      // 变动后余额
  orderId: String,           // 订单ID（可选）
  description: String,       // 描述
  createdAt: Date           // 创建时间
}
```

## 🔄 API接口

### 搜索历史
```
GET /api/user/search-history?page=1&limit=20
Response: {
  success: true,
  data: {
    history: [...],
    pagination: { page, limit, total, pages }
  }
}
```

### 推荐统计
```
GET /api/user/referral-stats
Response: {
  success: true,
  data: {
    referralCode: "ABC123",
    totalReferrals: 5,
    totalEarnings: 250,
    referredUsers: [...]
  }
}
```

### 佣金记录
```
GET /api/user/commissions?page=1&limit=20
Response: {
  success: true,
  data: {
    commissions: [...],
    totalCommission: 250,
    pendingCommission: 0,
    pagination: { page, limit, total, pages }
  }
}
```

### 积分记录
```
GET /api/user/balance-logs?page=1&limit=20
Response: {
  success: true,
  data: {
    logs: [...],
    pagination: { page, limit, total, pages }
  }
}
```

## 🎨 用户界面

### 搜索历史页面
- **路径**: `/dashboard/search-history`
- **功能**:
  - 表格显示搜索记录
  - 筛选器（状态、时间范围）
  - 统计卡片（总次数、成功/失败次数、消耗积分）
  - 分页导航
  - 导出CSV

### 推荐奖励页面
- **路径**: `/dashboard/referrals`
- **功能**:
  - 显示推荐码和分享链接
  - 推荐统计（人数、收益）
  - 被推荐用户列表
  - 佣金记录列表

### 积分记录页面
- **路径**: `/dashboard/balance-logs`
- **功能**:
  - 时间线显示积分变动
  - 类型图标和颜色区分
  - 显示变动前后余额
  - 详细描述
  - 刷新和加载更多

## 🔧 技术实现

### 搜索历史自动保存
在搜索API中，每次搜索都会自动创建SearchLog记录：
```javascript
// server/routes/search.js
const searchLog = new SearchLog({
  userId: req.user._id,
  searchType,
  searchQuery: query,
  searchFingerprint,
  resultsCount: results.length,
  pointsCharged,
  searchTime: Date.now() - startTime,
  databasesSearched: databases.length
});
await searchLog.save();
```

### 积分变动自动记录
在任何积分变动操作中，都会创建BalanceLog记录：
```javascript
// 创建积分记录
const balanceLog = new BalanceLog({
  userId: user._id,
  type: 'search',
  amount: -searchCost,
  balanceBefore: user.balance,
  balanceAfter: user.balance - searchCost,
  description: `搜索消费：${searchType} - ${query}`
});
await balanceLog.save();
```

## 📝 使用说明

### 用户操作流程

1. **查看搜索历史**
   - 进入"用户中心 → 搜索历史"
   - 查看所有搜索记录
   - 使用筛选器查找特定记录
   - 导出记录为CSV文件

2. **查看推荐奖励**
   - 进入"用户中心 → 推荐奖励"
   - 复制推荐码或分享链接
   - 查看推荐人数和收益
   - 查看佣金记录详情

3. **查看积分记录**
   - 进入"用户中心 → 积分记录"
   - 查看所有积分变动
   - 了解积分来源和去向
   - 刷新获取最新记录

## 🎯 下一步优化

### 搜索历史
- [ ] 添加搜索结果预览
- [ ] 支持重新搜索
- [ ] 添加搜索历史统计图表
- [ ] 支持批量删除历史

### 推荐奖励
- [ ] 添加推荐排行榜
- [ ] 显示推荐进度和等级
- [ ] 添加推荐活动和奖励规则
- [ ] 支持推荐码自定义

### 积分记录
- [ ] 添加积分统计图表
- [ ] 支持按类型筛选
- [ ] 添加积分预测功能
- [ ] 支持积分兑换记录

## 📦 修改的文件

### 后端
1. `server/routes/user.js` - 更新搜索历史和佣金记录API
2. `server/models/SearchLog.js` - 搜索日志模型（已存在）
3. `server/models/BalanceLog.js` - 积分日志模型（已存在）

### 前端
1. `src/pages/Dashboard/SearchHistory.tsx` - 更新搜索历史页面
2. `src/pages/Dashboard/BalanceLogs.tsx` - 更新积分记录页面
3. `src/utils/api.ts` - API调用方法（已存在）

## ✨ 总结

用户中心的三个核心功能已经完善：
- ✅ 搜索历史自动保存并可查询
- ✅ 推荐奖励数据从数据库获取
- ✅ 积分记录完整显示所有变动

所有功能都已连接到真实的数据库，用户可以查看完整的历史记录和统计信息！
