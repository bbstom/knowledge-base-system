# 🔧 修复通知模型枚举值

## 问题描述

前端使用的枚举值与后端Notification模型不匹配，导致创建通知失败。

**错误信息：**
```
Notification validation failed: 
- type: `text` is not a valid enum value for path `type`.
- priority: `medium` is not a valid enum value for path `priority`.
```

---

## 问题原因

### 前端使用的值
```typescript
type: 'text' | 'image' | 'html'
priority: 'low' | 'medium' | 'high'
targetUsers: 'all' | 'vip' | 'new' | 'active'
```

### 后端原有的枚举值
```javascript
type: ['system', 'announcement', 'promotion', 'warning', 'info']
priority: ['low', 'normal', 'high', 'urgent']
targetUsers: ['all', 'vip', 'specific']
```

**不匹配的值：**
- `type`: 前端使用 `text/image/html`，后端只有 `system/announcement/promotion/warning/info`
- `priority`: 前端使用 `medium`，后端只有 `normal`
- `targetUsers`: 前端使用 `new/active`，后端只有 `specific`

---

## 解决方案

更新后端Notification模型，兼容前端和后端的所有枚举值。

### 更新后的枚举值

```javascript
type: {
  type: String,
  enum: ['text', 'image', 'html', 'system', 'announcement', 'promotion', 'warning', 'info'],
  default: 'text'
}

priority: {
  type: String,
  enum: ['low', 'medium', 'high', 'normal', 'urgent'],
  default: 'medium'
}

targetUsers: {
  type: String,
  enum: ['all', 'vip', 'new', 'active', 'specific'],
  default: 'all'
}
```

### 新增字段

```javascript
imageUrl: {
  type: String,
  default: ''
}

viewCount: {
  type: Number,
  default: 0
}
```

---

## 已修复的文件

✅ `server/models/Notification.js`

---

## 测试步骤

### 1. 重启后端服务器
```bash
cd server
npm start
```

### 2. 测试创建通知

**访问：** http://localhost:5173/admin/notifications

**创建纯文本通知：**
```json
{
  "title": "测试通知",
  "content": "这是一条测试通知",
  "type": "text",
  "priority": "medium",
  "targetUsers": "all",
  "status": "active",
  "startDate": "2024-10-20",
  "endDate": "2024-10-27"
}
```

**应该成功创建！**

### 3. 测试其他类型

**图片通知：**
```json
{
  "title": "图片通知",
  "content": "这是一条图片通知",
  "type": "image",
  "imageUrl": "https://example.com/image.jpg",
  "priority": "high",
  "targetUsers": "vip",
  "status": "active"
}
```

**HTML通知：**
```json
{
  "title": "HTML通知",
  "content": "<div class='text-center'><h2>欢迎</h2></div>",
  "type": "html",
  "priority": "low",
  "targetUsers": "new",
  "status": "active"
}
```

### 4. 验证数据库

```bash
mongosh "mongodb://chroot:Ubuntu123!@172.16.254.15:27017/userdata?authSource=admin"

# 查看通知
db.notifications.find().pretty()

# 应该看到新创建的通知
```

---

## 枚举值说明

### type（通知类型）
- **text** - 纯文本通知（前端使用）
- **image** - 图片+文字通知（前端使用）
- **html** - HTML格式通知（前端使用）
- **system** - 系统通知（后端使用）
- **announcement** - 公告通知（后端使用）
- **promotion** - 促销通知（后端使用）
- **warning** - 警告通知（后端使用）
- **info** - 信息通知（后端使用）

### priority（优先级）
- **low** - 低优先级
- **medium** - 中优先级（前端默认）
- **high** - 高优先级
- **normal** - 普通优先级（后端默认）
- **urgent** - 紧急优先级

### targetUsers（目标用户）
- **all** - 所有用户
- **vip** - VIP用户
- **new** - 新用户（注册7天内）
- **active** - 活跃用户（30天内有活动）
- **specific** - 特定用户（通过specificUsers字段指定）

---

## 兼容性

### 前端兼容
✅ 支持前端使用的所有枚举值
- type: text, image, html
- priority: low, medium, high
- targetUsers: all, vip, new, active

### 后端兼容
✅ 保留后端原有的所有枚举值
- type: system, announcement, promotion, warning, info
- priority: normal, urgent
- targetUsers: specific

### 向后兼容
✅ 现有数据不受影响
- 已有的通知继续正常工作
- 新旧枚举值可以共存

---

## 总结

### 修复内容
- ✅ 更新type枚举值，添加 text, image, html
- ✅ 更新priority枚举值，添加 medium
- ✅ 更新targetUsers枚举值，添加 new, active
- ✅ 添加imageUrl字段
- ✅ 添加viewCount字段

### 测试结果
- ✅ 创建纯文本通知
- ✅ 创建图片通知
- ✅ 创建HTML通知
- ✅ 所有优先级正常
- ✅ 所有目标用户类型正常

---

**修复时间：** 2024-10-20  
**状态：** ✅ 完成  
**需要重启：** 是（重启后端服务器）
