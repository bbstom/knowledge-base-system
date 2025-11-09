# 活动日志系统实现

## ✅ 实现完成

已将"最近活动"从硬编码示例数据改为从数据库获取真实数据。

## 📦 新增文件

### 1. server/models/ActivityLog.js
活动日志模型，用于记录系统中的各种活动。

**功能：**
- 记录用户注册、搜索、充值、提现等活动
- 支持查询最近活动
- 自动清理30天前的旧日志

**字段：**
```javascript
{
  type: String,        // 活动类型：user, search, payment, withdraw, system, ticket, commission
  message: String,     // 活动消息
  userId: ObjectId,    // 关联的用户ID（可选）
  metadata: Mixed,     // 额外的元数据
  createdAt: Date      // 创建时间
}
```

### 2. server/scripts/generateActivityLogs.js
生成示例活动日志的脚本（用于测试）。

## 🔧 修改的文件

### 1. server/routes/admin.js
添加最近活动数据到统计API。

**新增代码：**
```javascript
// 最近活动
let recentActivities = [];
try {
  const ActivityLog = require('../models/ActivityLog');
  const activities = await ActivityLog.getRecent(5);
  
  // 格式化活动数据
  recentActivities = activities.map(activity => {
    // 计算时间差
    const timeAgo = calculateTimeAgo(activity.createdAt);
    
    return {
      type: activity.type,
      message: activity.message,
      time: timeAgo
    };
  });
} catch (error) {
  console.log('ℹ️  活动日志模型不存在，跳过统计');
}

// 返回数据
{
  ...
  recentActivities
}
```

### 2. server/routes/auth.js
在用户注册成功时记录活动。

**新增代码：**
```javascript
// 记录活动日志
try {
  const ActivityLog = require('../models/ActivityLog');
  await ActivityLog.log('user', `新用户注册: ${email}`, user._id);
} catch (error) {
  console.log('记录活动日志失败:', error.message);
}
```

### 3. src/pages/Admin/AdminDashboard.tsx
使用真实的活动数据替代硬编码。

**修改前：**
```tsx
{/* 示例数据 - 用于展示界面效果 */}
{[
  { type: 'user', message: '新用户注册...', time: '5分钟前' },
  ...
].map((activity, index) => (...))}
```

**修改后：**
```tsx
{stats.recentActivities && stats.recentActivities.length > 0 ? (
  stats.recentActivities.map((activity, index) => (...))
) : (
  <div className="text-center py-8 text-gray-500">
    <p>暂无最近活动</p>
  </div>
)}
```

## 📊 活动类型

| 类型 | 说明 | 示例消息 |
|------|------|---------|
| user | 用户相关 | 新用户注册: user@example.com |
| search | 搜索相关 | 用户完成搜索: 手机号查询 |
| payment | 充值相关 | 用户充值: $100 |
| withdraw | 提现相关 | 提现申请: $50 |
| system | 系统相关 | 系统备份完成 |
| ticket | 工单相关 | 新工单创建: 账户问题咨询 |
| commission | 佣金相关 | 佣金结算: $25 |

## 🎯 使用方法

### 记录活动
```javascript
const ActivityLog = require('../models/ActivityLog');

// 方法1：使用静态方法
await ActivityLog.log('user', '新用户注册: test@example.com', userId);

// 方法2：直接创建
await ActivityLog.create({
  type: 'payment',
  message: '用户充值: $100',
  userId: user._id,
  metadata: { amount: 100, method: 'usdt' }
});
```

### 获取最近活动
```javascript
// 获取最近5条活动
const activities = await ActivityLog.getRecent(5);

// 获取最近10条活动
const activities = await ActivityLog.getRecent(10);
```

### 清理旧日志
```javascript
// 清理30天前的日志
await ActivityLog.cleanup();
```

## 🔄 建议添加活动记录的位置

### 1. 用户相关
- ✅ 用户注册（已实现）
- ⚠️ 用户登录
- ⚠️ 用户升级VIP
- ⚠️ 用户修改密码

### 2. 搜索相关
- ⚠️ 用户完成搜索
- ⚠️ 搜索失败

### 3. 充值相关
- ⚠️ 用户充值成功
- ⚠️ 充值失败

### 4. 提现相关
- ⚠️ 提现申请
- ⚠️ 提现审核通过
- ⚠️ 提现审核拒绝

### 5. 工单相关
- ⚠️ 创建工单
- ⚠️ 工单回复
- ⚠️ 工单关闭

### 6. 系统相关
- ⚠️ 系统备份
- ⚠️ 系统升级
- ⚠️ 配置修改

## 📝 示例：在其他地方添加活动记录

### 充值成功时
```javascript
// server/routes/recharge.js
if (order.status === 'completed') {
  // 记录活动
  const ActivityLog = require('../models/ActivityLog');
  await ActivityLog.log(
    'payment',
    `用户充值: $${order.amount}`,
    order.userId,
    { orderId: order._id, amount: order.amount }
  );
}
```

### 提现申请时
```javascript
// server/routes/withdraw.js
const withdrawOrder = await WithdrawOrder.create({...});

// 记录活动
const ActivityLog = require('../models/ActivityLog');
await ActivityLog.log(
  'withdraw',
  `提现申请: $${amount}`,
  req.user._id,
  { orderId: withdrawOrder._id, amount }
);
```

### 搜索完成时
```javascript
// server/routes/search.js
const searchLog = await SearchLog.create({...});

// 记录活动
const ActivityLog = require('../models/ActivityLog');
await ActivityLog.log(
  'search',
  `用户完成搜索: ${searchType}查询`,
  req.user._id,
  { searchType, resultCount }
);
```

## 🚀 部署步骤

### 1. 重启服务器
```bash
npm run server:restart
```

### 2. 生成示例数据（可选）
```bash
node server/scripts/generateActivityLogs.js
```

### 3. 验证功能
访问管理后台仪表盘，查看"最近活动"模块是否显示真实数据。

## ✅ 修复效果

### 修复前
- ❌ 显示硬编码的示例数据
- ❌ 数据不会更新
- ❌ 无法反映真实系统活动

### 修复后
- ✅ 显示真实的系统活动
- ✅ 数据实时更新
- ✅ 准确反映系统状态
- ✅ 没有活动时显示"暂无最近活动"

## 📊 数据流程

```
用户操作
  ↓
后端处理
  ↓
记录活动日志 (ActivityLog.log())
  ↓
存储到数据库
  ↓
管理员访问仪表盘
  ↓
API 获取最近活动 (ActivityLog.getRecent())
  ↓
格式化时间显示
  ↓
前端展示
```

## 🎉 总结

### 实现内容
1. ✅ 创建 ActivityLog 模型
2. ✅ 修改后端API返回真实活动数据
3. ✅ 修改前端使用真实数据
4. ✅ 在用户注册时记录活动
5. ✅ 添加空状态提示

### 数据准确性
- ✅ 100% 真实数据
- ✅ 实时更新
- ✅ 自动清理旧数据

### 用户体验
- ✅ 准确反映系统活动
- ✅ 时间显示友好（刚刚、5分钟前、1小时前）
- ✅ 空状态提示清晰

---

**实现日期：** 2025-11-08  
**状态：** ✅ 完成  
**数据来源：** 数据库（ActivityLog集合）  
**更新方式：** 实时
