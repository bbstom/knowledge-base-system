# 密码重置功能 - 完整实现

## 📋 功能概述

我们实现了两种密码重置方案：

### 1. ✅ 邮箱验证码自助重置（推荐）
用户通过邮箱验证码自助重置密码，无需管理员介入。

### 2. ✅ 管理员手动重置
管理员可以在后台为用户重置密码（适用于特殊情况）。

---

## 🎯 方案一：邮箱验证码自助重置

### 用户流程

```
1. 点击"忘记密码？" 
   ↓
2. 输入邮箱地址
   ↓
3. 接收6位验证码（邮件）
   ↓
4. 输入验证码验证
   ↓
5. 设置新密码
   ↓
6. 重置成功，前往登录
```

### 实现的文件

#### 前端
- `src/pages/Auth/ForgotPassword.tsx` - 独立的忘记密码页面
- `src/pages/Auth/Login.tsx` - 登录页面（已添加"忘记密码？"链接）
- `src/pages/Dashboard/Profile.tsx` - 个人资料页面（已更新链接）
- `src/App.tsx` - 路由配置（已包含 `/forgot-password`）

#### 后端
- `server/models/VerificationCode.js` - 验证码数据模型
- `server/services/emailService.js` - 邮件发送服务
- `server/routes/auth.js` - API路由（新增3个接口）
- `server/package.json` - 添加nodemailer依赖
- `server/.env` - SMTP邮件配置

### API接口

1. **发送验证码**
   ```
   POST /api/auth/forgot-password/send-code
   Body: { "email": "user@example.com" }
   ```

2. **验证验证码**
   ```
   POST /api/auth/forgot-password/verify-code
   Body: { "email": "user@example.com", "code": "123456" }
   ```

3. **重置密码**
   ```
   POST /api/auth/forgot-password/reset
   Body: { 
     "email": "user@example.com", 
     "code": "123456",
     "newPassword": "newpass123"
   }
   ```

### 安全特性

- ✅ 验证码10分钟后自动过期
- ✅ 验证码只能使用一次
- ✅ 最多尝试5次，超过后需重新获取
- ✅ 60秒内不能重复发送验证码
- ✅ 密码使用bcrypt加密存储
- ✅ 重置成功后发送通知邮件
- ✅ 自动清理过期验证码（TTL索引）

### 配置步骤

1. **安装依赖**
   ```bash
   cd server
   npm install nodemailer
   ```

2. **配置邮件服务**（以Gmail为例）
   ```env
   # server/.env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SITE_NAME=信息查询系统
   ```

3. **重启服务器**
   ```bash
   npm run dev
   ```

4. **测试功能**
   - 访问：http://localhost:5173/forgot-password
   - 输入邮箱 → 接收验证码 → 重置密码

---

## 🎯 方案二：管理员手动重置

### 管理员流程

```
1. 用户提交工单申请重置密码
   ↓
2. 管理员在"工单管理"查看申请
   ↓
3. 进入"用户管理"找到该用户
   ↓
4. 点击"查看详情" → "重置密码"
   ↓
5. 输入新密码并确认
   ↓
6. 通过工单回复告知用户新密码
```

### 实现的文件

#### 前端
- `src/pages/Admin/UserManagement.tsx` - 用户管理页面（已添加重置密码功能）
- `src/pages/Dashboard/Profile.tsx` - 个人资料页面（已添加工单引导）

#### 功能位置
- 管理后台 → 用户管理 → 用户详情 → 基本信息 → "重置密码"按钮

### 使用场景

适用于以下情况：
- 用户邮箱无法接收邮件
- 用户邮箱已失效
- 紧急情况需要快速重置
- 用户不熟悉自助重置流程

---

## 📊 功能对比

| 特性 | 邮箱验证码自助重置 | 管理员手动重置 |
|------|-------------------|---------------|
| 用户体验 | ⭐⭐⭐⭐⭐ 自助完成 | ⭐⭐⭐ 需要等待 |
| 安全性 | ⭐⭐⭐⭐⭐ 邮箱验证 | ⭐⭐⭐⭐ 管理员验证 |
| 响应速度 | ⭐⭐⭐⭐⭐ 即时 | ⭐⭐⭐ 取决于管理员 |
| 管理员工作量 | ⭐⭐⭐⭐⭐ 无需介入 | ⭐⭐ 需要手动处理 |
| 适用场景 | 常规密码重置 | 特殊情况 |

---

## 🚀 快速开始

### 对于用户

**忘记密码时：**

1. **方式一（推荐）：** 自助重置
   - 登录页面点击"忘记密码？"
   - 或访问：http://localhost:5173/forgot-password
   - 按照页面提示完成重置

2. **方式二：** 联系管理员
   - 进入"在线工单"页面
   - 创建工单说明需要重置密码
   - 等待管理员处理

### 对于管理员

**处理密码重置请求：**

1. 查看工单确认用户身份
2. 进入"用户管理"找到该用户
3. 点击"查看详情" → "重置密码"
4. 输入新密码并确认
5. 在工单中回复告知用户

---

## 📝 文档清单

1. **EMAIL_VERIFICATION_SETUP.md** - 邮箱验证码功能详细文档
2. **QUICK_START_EMAIL_RESET.md** - 5分钟快速配置指南
3. **PASSWORD_RESET_FEATURE.md** - 密码重置功能说明
4. **PASSWORD_RESET_COMPLETE.md** - 本文档（完整实现总结）

---

## ✅ 实现清单

### 前端
- [x] 独立的忘记密码页面
- [x] 四步流程UI设计
- [x] 验证码倒计时
- [x] 重新发送验证码
- [x] 登录页面集成
- [x] 个人资料页面更新
- [x] 管理员重置密码功能
- [x] 路由配置

### 后端
- [x] 验证码数据模型
- [x] 邮件发送服务
- [x] 发送验证码API
- [x] 验证验证码API
- [x] 重置密码API
- [x] 邮件模板设计
- [x] 安全验证机制
- [x] 自动过期清理

### 配置
- [x] SMTP邮件配置
- [x] 环境变量设置
- [x] 依赖包安装
- [x] 文档编写

---

## 🎉 总结

我们成功实现了完整的密码重置功能：

1. **用户友好** - 提供自助重置和管理员重置两种方式
2. **安全可靠** - 多重验证机制，防止恶意重置
3. **配置简单** - 5分钟即可完成邮件服务配置
4. **文档完善** - 提供详细的配置和使用文档

**下一步：**
1. 配置SMTP邮件服务（参考 QUICK_START_EMAIL_RESET.md）
2. 测试完整的重置流程
3. 根据需要调整邮件模板和验证规则

---

## 🆘 需要帮助？

- 配置问题：查看 `QUICK_START_EMAIL_RESET.md`
- 详细文档：查看 `EMAIL_VERIFICATION_SETUP.md`
- 功能说明：查看 `PASSWORD_RESET_FEATURE.md`
