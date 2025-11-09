# 工单系统后端实现

## 实现内容

### 1. 数据模型 (server/models/Ticket.js)

创建了Ticket模型，包含以下字段：
- `ticketNumber`: 工单编号（自动生成，格式：TK000001）
- `userId`: 用户ID
- `subject`: 标题
- `category`: 分类（general, technical, billing, account, other）
- `priority`: 优先级（low, medium, high）
- `status`: 状态（open, replied, closed）
- `messages`: 消息列表
  - `content`: 消息内容
  - `isAdmin`: 是否管理员回复
  - `createdBy`: 创建者ID
  - `attachments`: 附件列表
  - `createdAt`: 创建时间
- `createdAt`: 创建时间
- `updatedAt`: 更新时间
- `closedAt`: 关闭时间

### 2. API路由 (server/routes/tickets.js)

#### 用户端API
- `POST /api/tickets` - 创建工单
- `GET /api/tickets` - 获取用户工单列表（支持状态筛选、分页）
- `GET /api/tickets/:id` - 获取工单详情
- `POST /api/tickets/:id/reply` - 回复工单
- `PUT /api/tickets/:id/close` - 关闭工单

#### 管理员API
- `GET /api/tickets/admin/all` - 获取所有工单（支持状态、优先级筛选、搜索、分页）
- `PUT /api/tickets/admin/:id/status` - 更新工单状态

### 3. 前端API (src/utils/realApi.ts)

添加了 `ticketApi` 对象，包含所有工单相关的API调用方法。

### 4. 路由注册 (server/index.js)

在服务器中注册了工单路由：
```javascript
app.use('/api/tickets', ticketRoutes);
```

## 功能特性

✅ 工单编号自动生成
✅ 用户权限验证
✅ 管理员权限验证
✅ 工单状态管理（open → replied → closed）
✅ 消息回复功能
✅ 分页查询
✅ 状态筛选
✅ 优先级筛选
✅ 搜索功能（标题、工单编号）
✅ 数据库索引优化

## 使用流程

### 用户端
1. 用户创建工单（填写标题、分类、优先级、内容）
2. 系统自动生成工单编号
3. 用户可以查看自己的工单列表
4. 用户可以回复工单
5. 用户可以关闭工单

### 管理员端
1. 管理员可以查看所有工单
2. 管理员可以筛选和搜索工单
3. 管理员可以回复工单（回复后状态自动变为replied）
4. 管理员可以更新工单状态
5. 管理员可以关闭工单

## 数据库连接

工单数据存储在用户数据库（userConnection）中，与用户、订单等数据在同一个数据库。

## 测试

重启服务器后，前端页面就可以正常使用工单功能了：
1. 用户中心 → 工单 → 创建工单
2. 管理后台 → 工单管理 → 查看所有工单

## 注意事项

1. 需要重启服务器才能生效
2. 工单数据会持久化到MongoDB数据库
3. 工单编号是唯一的，自动递增
4. 用户只能查看和操作自己的工单
5. 管理员可以查看和操作所有工单
