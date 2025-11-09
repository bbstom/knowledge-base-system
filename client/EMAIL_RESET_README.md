# 📧 邮箱验证码自助重置密码功能

## 🎉 功能已完成！

用户现在可以通过邮箱验证码自助重置密码，无需管理员介入。

---

## 🚀 快速开始

### Windows用户

```cmd
INSTALL_EMAIL_RESET.bat
```

### Linux/Mac用户

```bash
chmod +x INSTALL_EMAIL_RESET.sh
./INSTALL_EMAIL_RESET.sh
```

### 手动安装

```bash
cd server
npm install nodemailer
```

然后配置 `server/.env`：

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SITE_NAME=信息查询系统
```

---

## 📖 文档导航

### 快速开始
- **QUICK_START_EMAIL_RESET.md** - 5分钟快速配置指南 ⭐ 推荐新手

### 详细文档
- **EMAIL_VERIFICATION_SETUP.md** - 完整的配置和使用文档
- **PASSWORD_RESET_COMPLETE.md** - 功能实现总结
- **PASSWORD_RESET_FEATURE.md** - 密码重置功能说明

### 安装脚本
- **INSTALL_EMAIL_RESET.bat** - Windows安装脚本
- **INSTALL_EMAIL_RESET.sh** - Linux/Mac安装脚本

---

## ✨ 功能特点

### 用户端
- ✅ 独立的忘记密码页面
- ✅ 四步流程：邮箱 → 验证码 → 新密码 → 完成
- ✅ 6位数字验证码
- ✅ 60秒倒计时，可重新发送
- ✅ 友好的错误提示

### 后端
- ✅ 精美的HTML邮件模板
- ✅ 验证码10分钟有效期
- ✅ 防止重复使用
- ✅ 限制尝试次数（最多5次）
- ✅ 自动清理过期验证码
- ✅ 密码重置成功通知邮件

### 安全性
- ✅ 邮箱验证
- ✅ 验证码加密存储
- ✅ 密码bcrypt加密
- ✅ 防暴力破解
- ✅ 操作日志记录

---

## 🎯 使用流程

### 用户重置密码

1. **访问忘记密码页面**
   - 登录页面点击"忘记密码？"
   - 或直接访问：http://localhost:5173/forgot-password

2. **输入邮箱地址**
   - 输入注册时使用的邮箱
   - 点击"发送验证码"

3. **接收验证码**
   - 检查邮箱收件箱
   - 验证码有效期10分钟

4. **输入验证码**
   - 输入6位数字验证码
   - 点击"验证"

5. **设置新密码**
   - 输入新密码（至少6位）
   - 确认新密码
   - 点击"重置密码"

6. **完成**
   - 显示成功页面
   - 点击"前往登录"

---

## 📧 邮件服务配置

### Gmail（推荐）

1. 启用两步验证：https://myaccount.google.com/security
2. 生成应用专用密码：https://myaccount.google.com/apppasswords
3. 配置 `.env`：
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx
   ```

### QQ邮箱

```env
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-qq@qq.com
SMTP_PASS=授权码
```

### 163邮箱

```env
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@163.com
SMTP_PASS=授权码
```

---

## 🧪 测试

### 方式一：浏览器测试

1. 启动服务器：`cd server && npm run dev`
2. 访问：http://localhost:5173/forgot-password
3. 按照页面提示完成测试

### 方式二：API测试

```bash
cd server
node test-email-reset.js
```

---

## 📁 文件清单

### 新增文件

#### 前端
```
src/pages/Auth/ForgotPassword.tsx          # 忘记密码页面
```

#### 后端
```
server/models/VerificationCode.js          # 验证码模型
server/services/emailService.js            # 邮件服务
```

#### 文档
```
EMAIL_VERIFICATION_SETUP.md                # 详细配置文档
QUICK_START_EMAIL_RESET.md                 # 快速开始指南
PASSWORD_RESET_COMPLETE.md                 # 完整实现总结
EMAIL_RESET_README.md                      # 本文档
INSTALL_EMAIL_RESET.bat                    # Windows安装脚本
INSTALL_EMAIL_RESET.sh                     # Linux/Mac安装脚本
```

### 修改文件

```
src/pages/Auth/Login.tsx                   # 添加"忘记密码？"链接
src/pages/Dashboard/Profile.tsx            # 更新忘记密码引导
src/pages/Admin/UserManagement.tsx         # 添加管理员重置密码功能
src/App.tsx                                # 路由配置（已包含）
server/routes/auth.js                      # 添加3个API接口
server/package.json                        # 添加nodemailer依赖
server/.env                                # 添加SMTP配置
```

---

## ⚠️ 常见问题

### Q: 收不到邮件？
**A:** 
1. 检查垃圾邮件文件夹
2. 确认SMTP配置正确
3. 查看服务器日志
4. 确认邮箱地址正确

### Q: 提示"发送失败"？
**A:**
1. 确认应用专用密码正确
2. 检查网络连接
3. 确认邮箱服务商允许SMTP
4. 查看服务器控制台错误信息

### Q: 验证码过期？
**A:**
- 验证码有效期10分钟
- 可以点击"重新发送"获取新验证码
- 确认服务器时间正确

### Q: 验证码错误？
**A:**
- 确认输入的验证码正确
- 注意验证码区分大小写（实际上是纯数字）
- 最多尝试5次，超过后需重新获取

---

## 🔧 故障排查

### 1. 邮件发送失败

**检查清单：**
- [ ] SMTP配置是否正确
- [ ] 应用专用密码是否正确
- [ ] 网络是否正常
- [ ] 邮箱服务商是否启用SMTP
- [ ] 查看服务器日志

**解决方案：**
```bash
# 查看服务器日志
cd server
npm run dev

# 测试SMTP连接
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ SMTP连接失败:', error);
  } else {
    console.log('✅ SMTP连接成功');
  }
});
"
```

### 2. 验证码无效

**检查清单：**
- [ ] 验证码是否过期（10分钟）
- [ ] 验证码是否已使用
- [ ] 尝试次数是否超过5次
- [ ] 数据库连接是否正常

**解决方案：**
```bash
# 清理过期验证码
mongo
use userdata
db.verificationcodes.deleteMany({ expiresAt: { $lt: new Date() } })
```

### 3. 数据库问题

**检查清单：**
- [ ] MongoDB是否运行
- [ ] 数据库连接字符串是否正确
- [ ] 验证码集合是否创建

**解决方案：**
```bash
# 检查MongoDB连接
mongo mongodb://chroot:Ubuntu123!@172.16.254.15:27017/userdata?authSource=admin

# 查看验证码集合
use userdata
db.verificationcodes.find().pretty()
```

---

## 📊 数据库结构

### VerificationCode集合

```javascript
{
  _id: ObjectId,
  email: String,              // 邮箱地址
  code: String,               // 6位验证码
  type: String,               // 类型：password_reset
  expiresAt: Date,            // 过期时间（10分钟后）
  used: Boolean,              // 是否已使用
  attempts: Number,           // 尝试次数
  createdAt: Date             // 创建时间
}
```

### 索引

```javascript
// 复合索引
{ email: 1, type: 1 }

// TTL索引（自动清理过期文档）
{ expiresAt: 1 }, { expireAfterSeconds: 0 }
```

---

## 🎨 邮件模板预览

### 验证码邮件

![验证码邮件](https://via.placeholder.com/600x400/667eea/ffffff?text=Verification+Code+Email)

- 精美的渐变背景
- 大号验证码显示
- 安全提示
- 有效期说明

### 重置成功通知

![重置成功通知](https://via.placeholder.com/600x400/10b981/ffffff?text=Password+Reset+Success)

- 成功图标
- 重置时间
- 安全建议

---

## 🚀 性能优化

### 已实现
- ✅ TTL索引自动清理过期验证码
- ✅ 复合索引加速查询
- ✅ 异步邮件发送
- ✅ 验证码缓存（10分钟）

### 未来优化
- [ ] Redis缓存验证码
- [ ] 邮件队列（Bull/Bee-Queue）
- [ ] 发送频率限制（IP/邮箱）
- [ ] 邮件模板缓存

---

## 📈 监控和日志

### 建议监控指标
- 验证码发送成功率
- 验证码验证成功率
- 密码重置成功率
- 平均处理时间
- 错误率

### 日志记录
```javascript
// 已记录的事件
- 验证码发送成功/失败
- 验证码验证成功/失败
- 密码重置成功/失败
- SMTP连接错误
```

---

## 🎯 下一步

1. **立即开始**
   - 运行安装脚本
   - 配置SMTP
   - 测试功能

2. **生产环境**
   - 使用专业邮件服务（SendGrid、阿里云等）
   - 配置域名邮箱
   - 启用监控和日志

3. **功能扩展**
   - 添加短信验证码
   - 多因素认证
   - 社交账号登录

---

## 💡 提示

- 📧 Gmail用户需要启用两步验证并生成应用专用密码
- 🔒 生产环境建议使用专业邮件服务
- 📊 定期检查邮件发送日志
- 🧹 数据库会自动清理过期验证码
- 🔐 验证码仅用于密码重置，不要用于其他用途

---

## 📞 获取帮助

- 📖 查看详细文档：`EMAIL_VERIFICATION_SETUP.md`
- 🚀 快速开始：`QUICK_START_EMAIL_RESET.md`
- 📋 完整说明：`PASSWORD_RESET_COMPLETE.md`

---

## ✅ 完成清单

在开始使用前，请确认：

- [ ] 已安装nodemailer依赖
- [ ] 已配置SMTP邮件服务
- [ ] 已重启服务器
- [ ] 已测试发送验证码
- [ ] 已测试完整重置流程
- [ ] 已阅读相关文档

---

**祝使用愉快！** 🎉
