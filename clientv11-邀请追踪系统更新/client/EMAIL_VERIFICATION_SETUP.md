# 邮箱验证码自助重置密码功能

## 功能概述

用户可以通过邮箱验证码自助重置密码，无需管理员介入。整个流程包括：
1. 输入邮箱地址
2. 接收6位数字验证码
3. 验证验证码
4. 设置新密码

## 已实现的功能

### 前端

✅ **独立的忘记密码页面** (`src/pages/Auth/ForgotPassword.tsx`)
- 四步流程：输入邮箱 → 验证验证码 → 设置新密码 → 成功
- 验证码倒计时（60秒）
- 重新发送验证码功能
- 友好的UI设计和错误提示

✅ **登录页面集成**
- 在密码输入框旁添加"忘记密码？"链接
- 点击跳转到独立的忘记密码页面

✅ **个人资料页面更新**
- 将"忘记密码"链接改为跳转到独立页面
- 更新提示文字

### 后端

✅ **邮件服务** (`server/services/emailService.js`)
- 发送验证码邮件（精美的HTML模板）
- 发送密码重置成功通知邮件
- 支持SMTP配置

✅ **验证码模型** (`server/models/VerificationCode.js`)
- 6位数字验证码
- 10分钟有效期
- 防止重复使用
- 限制尝试次数（最多5次）
- 自动过期清理（TTL索引）

✅ **API路由** (`server/routes/auth.js`)
- `POST /api/auth/forgot-password/send-code` - 发送验证码
- `POST /api/auth/forgot-password/verify-code` - 验证验证码
- `POST /api/auth/forgot-password/reset` - 重置密码

## 邮件服务配置

### 1. 安装依赖

```bash
cd server
npm install nodemailer
```

### 2. 配置环境变量

在 `server/.env` 文件中添加以下配置：

```env
# 邮件服务配置（SMTP）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SITE_NAME=信息查询系统
```

### 3. Gmail配置示例

如果使用Gmail，需要：

1. **启用两步验证**
   - 访问 https://myaccount.google.com/security
   - 启用"两步验证"

2. **生成应用专用密码**
   - 访问 https://myaccount.google.com/apppasswords
   - 选择"邮件"和"其他（自定义名称）"
   - 输入名称（如"信息查询系统"）
   - 复制生成的16位密码
   - 将密码填入 `SMTP_PASS`

3. **更新配置**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx  # 应用专用密码
   SITE_NAME=信息查询系统
   ```

### 4. 其他邮件服务商

#### QQ邮箱
```env
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-qq@qq.com
SMTP_PASS=授权码  # 在QQ邮箱设置中获取
```

#### 163邮箱
```env
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@163.com
SMTP_PASS=授权码  # 在163邮箱设置中获取
```

#### 阿里云邮件推送
```env
SMTP_HOST=smtpdm.aliyun.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-sender@your-domain.com
SMTP_PASS=your-smtp-password
```

## 使用流程

### 用户端流程

1. **访问忘记密码页面**
   - 从登录页面点击"忘记密码？"
   - 或直接访问 `/forgot-password`

2. **输入邮箱**
   - 输入注册时使用的邮箱地址
   - 点击"发送验证码"

3. **接收验证码**
   - 检查邮箱收件箱（可能在垃圾邮件中）
   - 验证码有效期10分钟

4. **输入验证码**
   - 输入6位数字验证码
   - 可以点击"重新发送"（60秒后）

5. **设置新密码**
   - 输入新密码（至少6位）
   - 确认新密码
   - 点击"重置密码"

6. **完成**
   - 显示成功页面
   - 点击"前往登录"使用新密码登录

### 安全特性

- ✅ 验证码10分钟后自动过期
- ✅ 验证码只能使用一次
- ✅ 最多尝试5次，超过后需重新获取
- ✅ 60秒内不能重复发送验证码
- ✅ 密码使用bcrypt加密存储
- ✅ 重置成功后发送通知邮件

## 测试

### 1. 测试发送验证码

```bash
curl -X POST http://localhost:3001/api/auth/forgot-password/send-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 2. 测试验证验证码

```bash
curl -X POST http://localhost:3001/api/auth/forgot-password/verify-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'
```

### 3. 测试重置密码

```bash
curl -X POST http://localhost:3001/api/auth/forgot-password/reset \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "code":"123456",
    "newPassword":"newpassword123"
  }'
```

## 邮件模板预览

### 验证码邮件

```
🔐 密码重置验证码

您好，

您正在申请重置密码。请使用以下验证码完成验证：

┌─────────────────┐
│   123456        │
│ 验证码有效期：10分钟 │
└─────────────────┘

⚠️ 安全提示：
• 如果这不是您本人的操作，请忽略此邮件
• 请勿将验证码告诉任何人
• 验证码仅用于密码重置，其他用途均为诈骗
```

### 重置成功通知邮件

```
✅ 密码重置成功

尊敬的 username，

您的账户密码已成功重置。

⚠️ 安全提示：
• 如果这不是您本人的操作，请立即联系客服
• 建议定期更换密码以保护账户安全
• 不要使用简单或常见的密码

重置时间：2024-10-23 14:30:00
```

## 故障排查

### 1. 邮件发送失败

**问题：** 验证码发送失败

**解决方案：**
- 检查SMTP配置是否正确
- 确认邮箱服务商是否启用了SMTP
- 检查应用专用密码是否正确
- 查看服务器日志：`tail -f server/logs/error.log`

### 2. 验证码收不到

**问题：** 用户收不到验证码邮件

**解决方案：**
- 检查垃圾邮件文件夹
- 确认邮箱地址是否正确
- 检查邮件服务商的发送限制
- 查看数据库中是否创建了验证码记录

### 3. 验证码过期

**问题：** 验证码总是提示已过期

**解决方案：**
- 检查服务器时间是否正确
- 确认验证码有效期设置（默认10分钟）
- 检查数据库中的 `expiresAt` 字段

### 4. 无法重置密码

**问题：** 验证通过但密码重置失败

**解决方案：**
- 检查用户是否存在
- 确认新密码符合要求（至少6位）
- 查看服务器日志中的错误信息

## 数据库清理

验证码会自动过期清理（TTL索引），但也可以手动清理：

```javascript
// 清理所有过期的验证码
db.verificationcodes.deleteMany({
  expiresAt: { $lt: new Date() }
});

// 清理所有已使用的验证码
db.verificationcodes.deleteMany({
  used: true
});
```

## 未来改进

1. **短信验证码**
   - 支持手机号验证
   - 集成短信服务商（阿里云、腾讯云等）

2. **多因素认证**
   - 支持Google Authenticator
   - 支持手机号+邮箱双重验证

3. **验证码图形化**
   - 使用图形验证码防止机器人
   - 添加滑块验证

4. **邮件模板自定义**
   - 管理后台可以自定义邮件模板
   - 支持多语言邮件

5. **发送频率限制**
   - IP限制（防止恶意发送）
   - 邮箱限制（每天最多发送次数）

## 总结

✅ 用户可以通过邮箱验证码自助重置密码
✅ 完整的四步流程，用户体验友好
✅ 安全可靠，包含多重验证和限制
✅ 精美的HTML邮件模板
✅ 支持多种邮件服务商
⏳ 需要配置SMTP邮件服务才能使用

**下一步：** 配置邮件服务并测试完整流程
