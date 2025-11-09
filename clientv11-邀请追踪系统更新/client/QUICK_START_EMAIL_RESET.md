# 快速启动：邮箱验证码重置密码

## 🚀 5分钟快速配置

### 步骤1：安装依赖

```bash
cd server
npm install nodemailer
```

### 步骤2：配置Gmail（推荐）

1. **启用两步验证**
   - 访问：https://myaccount.google.com/security
   - 点击"两步验证" → 开启

2. **生成应用专用密码**
   - 访问：https://myaccount.google.com/apppasswords
   - 选择"邮件"和"其他"
   - 输入名称："信息查询系统"
   - 复制生成的16位密码

3. **更新 server/.env**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx
   SITE_NAME=信息查询系统
   ```

### 步骤3：重启服务器

```bash
# 停止当前服务器（Ctrl+C）
# 重新启动
npm run dev
```

### 步骤4：测试功能

1. 访问：http://localhost:5173/forgot-password
2. 输入邮箱地址
3. 检查邮箱收到验证码
4. 输入验证码
5. 设置新密码
6. 完成！

## 📧 其他邮箱配置

### QQ邮箱

```env
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-qq@qq.com
SMTP_PASS=授权码
```

**获取授权码：**
1. 登录QQ邮箱
2. 设置 → 账户 → POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务
3. 开启"POP3/SMTP服务"
4. 生成授权码

### 163邮箱

```env
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@163.com
SMTP_PASS=授权码
```

**获取授权码：**
1. 登录163邮箱
2. 设置 → POP3/SMTP/IMAP
3. 开启"SMTP服务"
4. 设置授权密码

## ⚠️ 常见问题

### Q: 收不到邮件？
A: 
1. 检查垃圾邮件文件夹
2. 确认SMTP配置正确
3. 查看服务器日志

### Q: 提示"发送失败"？
A:
1. 确认应用专用密码正确
2. 检查网络连接
3. 确认邮箱服务商允许SMTP

### Q: 验证码过期？
A:
- 验证码有效期10分钟
- 可以点击"重新发送"获取新验证码

## 🎉 完成！

现在用户可以：
- ✅ 自助重置密码
- ✅ 无需管理员介入
- ✅ 安全可靠

详细文档请查看：`EMAIL_VERIFICATION_SETUP.md`
