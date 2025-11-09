# ✅ FAQ数据库集成指南

## 🎯 已完成的工作

已创建FAQ的后端支持，现在需要更新前端使用真实API。

---

## 📦 已创建的文件

### 1. server/models/FAQ.js
**FAQ数据模型**

**字段：**
- `question` - 问题（必需）
- `answer` - 答案（必需）
- `category` - 分类（account/search/payment/referral/vip/general）
- `order` - 排序
- `isActive` - 是否启用
- `views` - 浏览量
- `helpful` - 有帮助数
- `notHelpful` - 无帮助数
- `createdBy` - 创建者
- `createdAt` - 创建时间
- `updatedAt` - 更新时间

### 2. server/routes/faq.js
**FAQ路由**

**公开接口：**
- `GET /api/faqs` - 获取FAQ列表（只返回启用的）
- `POST /api/faqs/:id/view` - 增加浏览量
- `POST /api/faqs/:id/feedback` - 提交反馈

**管理员接口：**
- `GET /api/faqs/admin` - 获取所有FAQ（包括未启用的）
- `POST /api/faqs` - 创建FAQ
- `PUT /api/faqs/:id` - 更新FAQ
- `DELETE /api/faqs/:id` - 删除FAQ

### 3. src/utils/adminApi.ts
**前端API工具**

已添加 `faqApi` 对象，包含：
- `getAll()` - 获取所有FAQ
- `create()` - 创建FAQ
- `update()` - 更新FAQ
- `delete()` - 删除FAQ

### 4. server/index.js
已注册FAQ路由：`app.use('/api/faqs', faqRoutes);`

---

## 🔄 需要更新的部分

### 1. 后台管理 - ContentManagement.tsx

**当前状态：** 使用模拟数据

**需要修改：**

#### 加载FAQ数据
```typescript
// 当前（模拟数据）
setFaqs([
  { id: '1', question: '...', answer: '...', ... }
]);

// 需要改为
const response = await faqApi.getAll();
if (response.success) {
  setFaqs(response.data.faqs || []);
}
```

#### 保存FAQ
```typescript
// 当前（本地状态）
if (isAdding) {
  setFaqs([...faqs, { ...editingItem, id: `${Date.now()}` }]);
} else {
  setFaqs(faqs.map(faq => ...));
}

// 需要改为
if (isAdding) {
  const response = await faqApi.create(editingItem);
  if (response.success) {
    await loadContent(); // 重新加载
  }
} else {
  const response = await faqApi.update(editingItem._id, editingItem);
  if (response.success) {
    await loadContent();
  }
}
```

#### 删除FAQ
```typescript
// 当前（本地状态）
setFaqs(faqs.filter(faq => faq.id !== id));

// 需要改为
const response = await faqApi.delete(id);
if (response.success) {
  await loadContent();
}
```

### 2. 前端FAQ页面 - src/pages/FAQ.tsx

**需要创建或更新FAQ页面，使用公开API**

```typescript
import { useState, useEffect } from 'react';

const loadFAQs = async () => {
  const response = await fetch('/api/faqs');
  const data = await response.json();
  if (data.success) {
    setFaqs(data.data.faqs);
  }
};
```

---

## 🧪 测试步骤

### 1. 重启后端服务器
```bash
cd server
npm start
```

### 2. 测试API

**获取FAQ列表（公开）：**
```bash
curl http://localhost:3000/api/faqs
```

**创建FAQ（需要管理员token）：**
```bash
curl -X POST http://localhost:3000/api/faqs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "question": "如何注册账户？",
    "answer": "点击右上角的注册按钮...",
    "category": "account",
    "order": 1
  }'
```

### 3. 在管理后台测试

**访问：** http://localhost:5173/admin/content

**点击"常见问题"标签**

**测试功能：**
1. 创建新FAQ
2. 编辑FAQ
3. 删除FAQ
4. 刷新页面验证数据持久化

### 4. 在前端测试

**访问：** http://localhost:5173/faq

**应该看到：**
- 所有启用的FAQ
- 按分类显示
- 可以搜索

---

## 📊 数据库验证

```bash
mongosh "mongodb://chroot:Ubuntu123!@172.16.254.15:27017/userdata?authSource=admin"

# 查看FAQ
db.faqs.find().pretty()

# 查看特定分类
db.faqs.find({ category: "account" }).pretty()

# 查看启用的FAQ
db.faqs.find({ isActive: true }).pretty()
```

---

## 🎨 FAQ分类

### account - 账户相关
- 注册、登录、密码找回等

### search - 搜索功能
- 如何搜索、搜索费用、搜索结果等

### payment - 充值提现
- 充值方式、提现流程、费用说明等

### referral - 推荐奖励
- 推荐机制、奖励规则等

### vip - VIP会员
- VIP特权、升级方式等

### general - 一般问题
- 其他常见问题

---

## 📝 下一步

1. 更新 `ContentManagement.tsx` 中的FAQ部分
2. 更新或创建前端 `FAQ.tsx` 页面
3. 添加FAQ搜索功能
4. 添加FAQ反馈功能
5. 测试所有功能

---

**创建时间：** 2024-10-20  
**状态：** 🔄 进行中  
**下一步：** 更新ContentManagement.tsx
