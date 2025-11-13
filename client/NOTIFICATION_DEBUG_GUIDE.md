# 通知弹窗功能调试指南

## 问题描述
管理员创建通知后，用户登录时没有弹出提示框。

## 已修复的问题

### 1. 后端API查询条件错误
**问题**: `server/routes/notification.js` 中的 `/api/notifications/active` 路由使用了两个 `$or` 操作符，MongoDB不支持。

**修复**: 
- 使用 `$and` 和嵌套的 `$or` 来正确组合查询条件
- 添加了VIP用户和普通用户的正确过滤逻辑
- 在后端过滤掉已读通知

### 2. Notification模型枚举缺失
**问题**: `targetUsers` 枚举中缺少 `'normal'` 选项。

**修复**: 在 `server/models/Notification.js` 中添加了 `'normal'` 到枚举列表。

### 3. 前端调试日志
**改进**: 在 `NotificationModal.tsx` 中添加了详细的控制台日志，方便调试。

## 调试步骤

### 步骤1: 检查管理员创建的通知
1. 登录管理员账号
2. 进入 "通知管理" 页面
3. 创建一个新通知，确保：
   - 状态设置为 "活动"
   - 开始时间 <= 当前时间
   - 结束时间 > 当前时间（或留空）
   - 目标用户选择 "所有用户" 或符合测试用户的类型

### 步骤2: 检查数据库
在MongoDB中运行以下查询，确认通知已创建：

```javascript
db.notifications.find({
  status: 'active'
}).pretty()
```

### 步骤3: 测试API
1. 登录普通用户账号
2. 打开浏览器开发者工具（F12）
3. 在控制台粘贴并运行 `test-notification.js` 中的代码
4. 查看API返回的数据

### 步骤4: 检查前端日志
1. 刷新页面或重新登录
2. 打开浏览器控制台
3. 查找以下日志：
   - `NotificationModal: 开始加载通知...`
   - `NotificationModal: API响应 =`
   - `NotificationModal: 获取到 X 条通知`

### 步骤5: 检查"今日不再显示"功能
如果之前勾选了"今日不再显示"，通知不会弹出。清除方法：

```javascript
// 在浏览器控制台运行
localStorage.removeItem('notification_hidden_date');
console.log('✅ 已清除"今日不再显示"设置');
```

## 常见问题排查

### 问题1: API返回空数组
**可能原因**:
- 通知状态不是 'active'
- 通知的开始时间晚于当前时间
- 通知已过期（结束时间早于当前时间）
- 目标用户类型不匹配（如通知设置为VIP，但测试用户是普通用户）
- 用户已读过该通知

**解决方法**:
检查通知的配置，确保符合上述条件。

### 问题2: 控制台没有任何日志
**可能原因**:
- NotificationModal组件没有正确挂载
- 用户未登录

**解决方法**:
检查 `src/App.tsx` 中是否包含 `<NotificationModal />`。

### 问题3: API返回401错误
**可能原因**:
- Token过期或无效
- 用户未登录

**解决方法**:
重新登录。

### 问题4: 弹窗一闪而过
**可能原因**:
- 可能是CSS动画问题
- 可能是状态管理问题

**解决方法**:
检查浏览器控制台是否有JavaScript错误。

## 测试用例

### 测试用例1: 所有用户通知
1. 创建通知，目标用户选择 "所有用户"
2. 使用普通用户登录
3. 应该看到通知弹窗

### 测试用例2: VIP用户通知
1. 创建通知，目标用户选择 "VIP用户"
2. 使用VIP用户登录 → 应该看到通知
3. 使用普通用户登录 → 不应该看到通知

### 测试用例3: 普通用户通知
1. 创建通知，目标用户选择 "普通用户"
2. 使用普通用户登录 → 应该看到通知
3. 使用VIP用户登录 → 不应该看到通知

### 测试用例4: 多条通知
1. 创建3条活动通知
2. 登录用户
3. 应该依次显示3条通知，可以点击"下一条"或"跳过全部"

### 测试用例5: 今日不再显示
1. 登录用户，看到通知
2. 勾选"今日不再显示"，关闭通知
3. 刷新页面 → 不应该再看到通知
4. 第二天登录 → 应该再次看到通知

## 快速测试命令

在浏览器控制台运行：

```javascript
// 1. 清除"今日不再显示"设置
localStorage.removeItem('notification_hidden_date');

// 2. 测试API
fetch('/api/notifications/active', {
  headers: {
    'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('通知数据:', data));

// 3. 强制刷新页面
location.reload();
```

## 文件清单

修改的文件：
- `server/routes/notification.js` - 修复API查询逻辑
- `server/models/Notification.js` - 添加枚举选项
- `src/components/NotificationModal.tsx` - 添加调试日志

新增的文件：
- `test-notification.js` - 测试脚本
- `NOTIFICATION_DEBUG_GUIDE.md` - 本调试指南
