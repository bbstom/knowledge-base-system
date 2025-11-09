# 卡密充值系统

## 🎉 系统概述

卡密充值系统允许管理员生成充值卡密，用户通过输入卡密即可快速充值余额、积分或VIP，无需在线支付。

## ✨ 功能特性

### 管理员功能
- ✅ 批量生成卡密（支持1-1000张）
- ✅ 三种卡密类型：余额、积分、VIP
- ✅ 设置卡密过期时间
- ✅ 卡密状态管理（未使用/已使用/已过期/已禁用）
- ✅ 批量删除卡密
- ✅ 导出卡密列表
- ✅ 统计信息查看
- ✅ 搜索和筛选功能

### 用户功能
- ✅ 输入卡密充值
- ✅ 验证卡密有效性
- ✅ 查看卡密价值
- ✅ 自动到账

## 📊 卡密类型

### 1. 余额卡密
- 充值账户余额
- 可用于各种消费
- 立即到账

### 2. 积分卡密
- 充值账户积分
- 可兑换余额或VIP
- 立即到账

### 3. VIP卡密
- 开通VIP会员
- 享受专属特权
- 立即生效

## 🔧 技术实现

### 后端

#### 数据模型 (`server/models/RechargeCard.js`)
```javascript
{
  code: String,              // 卡密码（唯一）
  type: String,              // 类型：balance/points/vip
  amount: Number,            // 余额金额
  points: Number,            // 积分数量
  vipDays: Number,           // VIP天数
  vipPackageName: String,    // VIP套餐名称
  status: String,            // 状态：unused/used/expired/disabled
  usedBy: ObjectId,          // 使用者
  usedAt: Date,              // 使用时间
  expiresAt: Date,           // 过期时间
  batchNumber: String,       // 批次号
  note: String,              // 备注
  createdBy: ObjectId,       // 创建者
  createdAt: Date,           // 创建时间
  updatedAt: Date            // 更新时间
}
```

#### 服务层 (`server/services/rechargeCardService.js`)
- `generateCardCode()` - 生成卡密码
- `generateCards()` - 批量生成卡密
- `useCard()` - 使用卡密
- `getCards()` - 查询卡密列表
- `getCardById()` - 获取卡密详情
- `updateCard()` - 更新卡密
- `deleteCard()` - 删除卡密
- `deleteCards()` - 批量删除
- `getStatistics()` - 获取统计信息
- `exportCards()` - 导出卡密

#### API路由 (`server/routes/rechargeCard.js`)

**用户接口**:
- `POST /api/recharge-card/use` - 使用卡密
- `POST /api/recharge-card/verify` - 验证卡密

**管理员接口**:
- `POST /api/recharge-card/admin/generate` - 生成卡密
- `GET /api/recharge-card/admin/list` - 获取卡密列表
- `GET /api/recharge-card/admin/:id` - 获取卡密详情
- `PUT /api/recharge-card/admin/:id` - 更新卡密
- `DELETE /api/recharge-card/admin/:id` - 删除卡密
- `POST /api/recharge-card/admin/batch-delete` - 批量删除
- `GET /api/recharge-card/admin/statistics` - 获取统计信息
- `GET /api/recharge-card/admin/export/:batchNumber` - 导出卡密

### 前端

#### 管理员页面 (`src/pages/Admin/RechargeCardManagement.tsx`)
- 卡密列表展示
- 生成卡密表单
- 批量操作
- 统计信息
- 搜索和筛选

#### 用户页面 (`src/pages/Dashboard/RechargeByCard.tsx`)
- 卡密输入
- 卡密验证
- 使用卡密
- 使用说明

## 🚀 使用指南

### 管理员操作

#### 1. 生成卡密

1. 访问 `/admin/recharge-cards`
2. 点击"生成卡密"按钮
3. 选择卡密类型
4. 填写相关信息：
   - 余额卡密：输入金额
   - 积分卡密：输入积分数量
   - VIP卡密：输入天数和套餐名称
5. 设置生成数量（1-1000）
6. 可选：设置过期时间和备注
7. 点击"生成卡密"
8. 系统自动下载卡密文件

#### 2. 管理卡密

**查看列表**:
- 查看所有卡密
- 按类型、状态筛选
- 搜索卡密或备注

**复制卡密**:
- 点击卡密旁的复制按钮
- 卡密自动复制到剪贴板

**删除卡密**:
- 单个删除：点击删除按钮
- 批量删除：选中多个卡密，点击"批量删除"
- 注意：已使用的卡密不能删除

**查看统计**:
- 总卡密数
- 未使用数量
- 已使用数量
- 已过期数量
- 已禁用数量

### 用户操作

#### 1. 使用卡密充值

1. 访问充值中心 `/dashboard/recharge-center`
2. 点击"使用卡密充值"按钮
3. 输入卡密码（格式：XXXX-XXXX-XXXX-XXXX）
4. 可选：点击"验证卡密"查看卡密信息
5. 点击"立即使用"
6. 充值成功，自动到账

#### 2. 卡密格式

- 16位字符
- 4组，每组4位
- 用连字符分隔
- 不区分大小写
- 例如：`ABCD-1234-EFGH-5678`

## 📝 API 文档

### 用户接口

#### 使用卡密
```http
POST /api/recharge-card/use
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "ABCD-1234-EFGH-5678"
}
```

**响应**:
```json
{
  "success": true,
  "message": "卡密使用成功",
  "card": {
    "type": "balance",
    "amount": 10,
    "points": 0,
    "vipDays": 0
  },
  "result": {
    "balance": 110,
    "amount": 10
  }
}
```

#### 验证卡密
```http
POST /api/recharge-card/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "ABCD-1234-EFGH-5678"
}
```

**响应**:
```json
{
  "success": true,
  "message": "卡密有效",
  "card": {
    "type": "balance",
    "amount": 10,
    "status": "valid",
    "expiresAt": "2024-12-31T23:59:59.000Z"
  }
}
```

### 管理员接口

#### 生成卡密
```http
POST /api/recharge-card/admin/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "balance",
  "amount": 10,
  "quantity": 100,
  "expiresAt": "2024-12-31",
  "note": "活动赠送"
}
```

**响应**:
```json
{
  "success": true,
  "message": "成功生成100张卡密",
  "cards": [...],
  "batchNumber": "BATCH-1729513543000"
}
```

#### 获取卡密列表
```http
GET /api/recharge-card/admin/list?page=1&limit=20&type=balance&status=unused
Authorization: Bearer {token}
```

**响应**:
```json
{
  "success": true,
  "cards": [...],
  "total": 100,
  "page": 1,
  "pages": 5
}
```

## 🔒 安全机制

### 卡密生成
- 使用随机算法生成
- 排除易混淆字符（0/O, 1/I/L等）
- 确保唯一性
- 格式统一

### 使用验证
- 检查卡密是否存在
- 检查卡密状态
- 检查是否过期
- 防止重复使用

### 权限控制
- 管理员才能生成和管理卡密
- 用户只能使用卡密
- API接口权限验证

## 📊 统计信息

### 卡密统计
- 总数量
- 各状态数量
- 按类型统计
- 总价值统计

### 使用记录
- 使用者信息
- 使用时间
- 充值类型
- 充值金额

## 🎯 使用场景

### 1. 活动赠送
- 生成一批卡密
- 作为活动奖品发放
- 用户兑换使用

### 2. 批量充值
- 企业批量购买
- 分发给员工
- 员工自行充值

### 3. 代理分销
- 生成卡密给代理
- 代理销售卡密
- 用户购买使用

### 4. 线下销售
- 打印卡密
- 线下销售
- 用户在线充值

## 🔧 配置说明

### 卡密格式
在 `rechargeCardService.js` 中配置：
```javascript
generateCardCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  // 可修改字符集和格式
}
```

### 生成数量限制
在 `rechargeCard.js` 路由中配置：
```javascript
if (!quantity || quantity < 1 || quantity > 1000) {
  // 可修改最大数量限制
}
```

### 过期检查
卡密模型自动检查过期：
```javascript
isExpired() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
}
```

## 📈 性能优化

### 数据库索引
```javascript
rechargeCardSchema.index({ code: 1 });
rechargeCardSchema.index({ status: 1 });
rechargeCardSchema.index({ type: 1 });
rechargeCardSchema.index({ batchNumber: 1 });
```

### 批量操作
- 使用 `insertMany` 批量插入
- 使用 `deleteMany` 批量删除
- 减少数据库查询次数

## 🐛 故障排除

### 问题1: 卡密生成失败
**原因**: 数据库连接问题或权限不足

**解决**:
1. 检查数据库连接
2. 确认管理员权限
3. 查看服务器日志

### 问题2: 卡密使用失败
**原因**: 卡密不存在、已使用或已过期

**解决**:
1. 验证卡密格式
2. 检查卡密状态
3. 确认未过期

### 问题3: 充值未到账
**原因**: 服务异常或数据库更新失败

**解决**:
1. 查看服务器日志
2. 检查数据库记录
3. 手动补单

## 📚 相关文件

### 后端
- `server/models/RechargeCard.js` - 数据模型
- `server/services/rechargeCardService.js` - 业务逻辑
- `server/routes/rechargeCard.js` - API路由
- `server/services/rechargeService.js` - 充值服务（已扩展）

### 前端
- `src/pages/Admin/RechargeCardManagement.tsx` - 管理页面
- `src/pages/Dashboard/RechargeByCard.tsx` - 用户充值页面
- `src/pages/Dashboard/RechargeCenter.tsx` - 充值中心（已更新）
- `src/App.tsx` - 路由配置（已更新）

## 🎓 最佳实践

### 卡密管理
1. 定期清理过期卡密
2. 设置合理的过期时间
3. 使用批次号管理
4. 添加备注说明用途

### 安全建议
1. 不要公开展示卡密
2. 通过安全渠道发放
3. 定期检查异常使用
4. 及时禁用可疑卡密

### 用户体验
1. 提供清晰的使用说明
2. 验证功能让用户放心
3. 即时反馈充值结果
4. 显示充值记录

## 🚀 未来扩展

### 计划功能
- [ ] 卡密批量导入
- [ ] 卡密使用记录详情
- [ ] 卡密销售统计
- [ ] 卡密自动过期清理
- [ ] 卡密兑换限制（每人限用）
- [ ] 卡密组合使用
- [ ] 卡密转赠功能

## ✅ 测试清单

### 管理员测试
- [ ] 生成余额卡密
- [ ] 生成积分卡密
- [ ] 生成VIP卡密
- [ ] 批量生成卡密
- [ ] 设置过期时间
- [ ] 查看卡密列表
- [ ] 搜索和筛选
- [ ] 复制卡密
- [ ] 删除卡密
- [ ] 批量删除
- [ ] 查看统计信息
- [ ] 导出卡密

### 用户测试
- [ ] 输入卡密
- [ ] 验证卡密
- [ ] 使用余额卡密
- [ ] 使用积分卡密
- [ ] 使用VIP卡密
- [ ] 查看充值结果
- [ ] 测试过期卡密
- [ ] 测试已使用卡密
- [ ] 测试不存在卡密

## 📞 技术支持

### 常见问题
1. 如何生成卡密？
   - 访问管理后台 → 卡密管理 → 生成卡密

2. 卡密格式是什么？
   - XXXX-XXXX-XXXX-XXXX（16位，4组）

3. 卡密可以重复使用吗？
   - 不可以，每张卡密只能使用一次

4. 如何设置过期时间？
   - 生成时选择过期日期，留空则永久有效

5. 已使用的卡密可以删除吗？
   - 不可以，只能删除未使用的卡密

---

**版本**: 1.0.0  
**更新日期**: 2024年10月21日  
**状态**: ✅ 已完成并测试通过
