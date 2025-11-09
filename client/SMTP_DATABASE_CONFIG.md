# SMTP数据库配置 - 安全方案

## 🔒 安全升级完成！

我已经将SMTP配置从.env文件迁移到**数据库存储+加密**方案，更加安全可靠！

---

## ✅ 实现的功能

### 1. 数据库存储
- ✅ SMTP配置存储在MongoDB的SystemConfig集合
- ✅ 不再依赖.env文件
- ✅ 支持动态更新，无需重启服务器

### 2. 密码加密
- ✅ 使用AES-256-CBC加密算法
- ✅ SMTP密码加密后存储
- ✅ 只有在使用时才解密
- ✅ 前端永远看不到真实密码

### 3. 管理后台
- ✅ 可视化配置界面
- ✅ 实时保存和测试
- ✅ 常用配置示例
- ✅ 测试邮件功能

### 4. 向后兼容
- ✅ 优先使用数据库配置
- ✅ 降级到.env配置
- ✅ 平滑迁移

---

## 📁 新增文件

**后端：**
- `server/utils/encryption.js` - AES加密/解密工具

**前端：**
- `src/pages/Admin/EmailConfig.tsx` - SMTP配置页面

**修改的文件：**
- `server/services/emailService.js` - 从数据库读取配置
- `server/routes/systemConfig.js` - 添加SMTP配置API
- `src/App.tsx` - 添加路由
- `src/components/Layout/AdminLayout.tsx` - 添加菜单

---

## 🔐 安全特性

### 加密算法
- **算法：** AES-256-CBC
- **密钥：** SHA-256哈希后的32字节密钥
- **IV：** 每次加密生成随机IV
- **格式：** `iv:encryptedData`

### 密码保护
1. **存储时：** 密码使用AES-256加密
2. **传输时：** HTTPS加密传输
3. **显示时：** 前端显示为`******`
4. **使用时：** 临时解密后立即使用

### 权限控制
- ✅ 只有管理员可以访问
- ✅ 需要登录认证
- ✅ API有权限验证

---

## 🚀 使用指南

### 步骤1：访问配置页面

登录管理后台 → 邮件配置

或直接访问：http://localhost:5173/admin/email-config

### 步骤2：填写SMTP配置

**Gmail示例：**
```
SMTP服务器：smtp.gmail.com
端口：587
SSL/TLS：不启用
用户名：your-email@gmail.com
密码：应用专用密码（16位）
发件人名称：信息查询系统
发件人邮箱：your-email@gmail.com
```

**QQ邮箱示例：**
```
SMTP服务器：smtp.qq.com
端口：587
SSL/TLS：不启用
用户名：your-qq@qq.com
密码：授权码
```

**163邮箱示例：**
```
SMTP服务器：smtp.163.com
端口：465
SSL/TLS：启用
用户名：your-email@163.com
密码：授权码
```

### 步骤3：保存配置

点击"保存配置"按钮，配置将：
1. 密码自动加密
2. 保存到数据库
3. 立即生效

### 步骤4：测试配置

1. 点击"测试配置"按钮
2. 输入测试邮箱地址
3. 点击"发送测试邮件"
4. 检查邮箱是否收到测试邮件

---

## 🔧 API接口

### 获取SMTP配置
```
GET /api/system-config/smtp
Headers: Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "data": {
    "smtpHost": "smtp.gmail.com",
    "smtpPort": 587,
    "smtpSecure": false,
    "smtpUser": "your-email@gmail.com",
    "smtpPassword": "******",  // 隐藏真实密码
    "fromName": "信息查询系统",
    "fromEmail": "your-email@gmail.com"
  }
}
```

### 更新SMTP配置
```
POST /api/system-config/smtp
Headers: Authorization: Bearer <admin_token>
Body: {
  "smtpHost": "smtp.gmail.com",
  "smtpPort": 587,
  "smtpSecure": false,
  "smtpUser": "your-email@gmail.com",
  "smtpPassword": "your-app-password",  // 将被加密
  "fromName": "信息查询系统",
  "fromEmail": "your-email@gmail.com"
}

Response:
{
  "success": true,
  "message": "SMTP配置已保存"
}
```

### 测试SMTP配置
```
POST /api/system-config/smtp/test
Headers: Authorization: Bearer <admin_token>
Body: {
  "testEmail": "test@example.com"
}

Response:
{
  "success": true,
  "message": "测试邮件已发送，请检查收件箱"
}
```

---

## 🔒 加密实现

### 加密过程

```javascript
const crypto = require('crypto');

function encrypt(text) {
  // 1. 生成密钥（SHA-256哈希）
  const key = crypto.createHash('sha256')
    .update(ENCRYPTION_KEY)
    .digest();
  
  // 2. 生成随机IV
  const iv = crypto.randomBytes(16);
  
  // 3. 创建加密器
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  // 4. 加密数据
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // 5. 返回 iv:encryptedData
  return iv.toString('hex') + ':' + encrypted;
}
```

### 解密过程

```javascript
function decrypt(text) {
  // 1. 分离IV和加密数据
  const [ivHex, encryptedText] = text.split(':');
  
  // 2. 生成密钥
  const key = crypto.createHash('sha256')
    .update(ENCRYPTION_KEY)
    .digest();
  
  // 3. 恢复IV
  const iv = Buffer.from(ivHex, 'hex');
  
  // 4. 创建解密器
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  
  // 5. 解密数据
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

---

## 📊 数据库结构

### SystemConfig集合

```javascript
{
  _id: ObjectId,
  email: {
    smtpHost: String,           // SMTP服务器
    smtpPort: Number,           // 端口
    smtpSecure: Boolean,        // 是否使用SSL/TLS
    smtpUser: String,           // 用户名
    smtpPassword: String,       // 加密后的密码
    fromName: String,           // 发件人名称
    fromEmail: String           // 发件人邮箱
  },
  // ... 其他配置
}
```

### 密码存储示例

```javascript
// 原始密码
"my-secret-password"

// 加密后存储
"a1b2c3d4e5f6g7h8:9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3"
```

---

## 🔄 配置优先级

```
1. 数据库配置（优先）
   ↓
2. .env文件配置（降级）
   ↓
3. 抛出错误
```

### 代码实现

```javascript
const createTransporter = async () => {
  // 1. 尝试从数据库读取
  const config = await SystemConfig.findOne();
  if (config && config.email && config.email.smtpHost) {
    return nodemailer.createTransporter({
      host: config.email.smtpHost,
      port: config.email.smtpPort,
      secure: config.email.smtpSecure,
      auth: {
        user: config.email.smtpUser,
        pass: decrypt(config.email.smtpPassword)  // 解密
      }
    });
  }
  
  // 2. 降级到.env
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      // ...
    });
  }
  
  // 3. 抛出错误
  throw new Error('SMTP配置未找到');
};
```

---

## 🧪 测试

### 测试加密解密

```bash
cd server
node -e "
const { encrypt, decrypt, testEncryption } = require('./utils/encryption');
testEncryption();
"
```

**预期输出：**
```
Original: test-password-123
Encrypted: a1b2c3d4e5f6g7h8:9i0j1k2l3m4n5o6p...
Decrypted: test-password-123
Match: true
```

### 测试SMTP配置

1. 访问：http://localhost:5173/admin/email-config
2. 填写配置
3. 点击"保存配置"
4. 点击"测试配置"
5. 输入测试邮箱
6. 检查是否收到邮件

---

## 🔐 安全建议

### 1. 设置强加密密钥

编辑 `server/.env`：

```env
# 加密密钥（32字符）
ENCRYPTION_KEY=your-very-strong-32-char-key!!
```

**生成随机密钥：**
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### 2. 保护.env文件

```bash
# 设置文件权限（Linux/Mac）
chmod 600 server/.env

# 添加到.gitignore
echo "server/.env" >> .gitignore
```

### 3. 定期更换密钥

如果怀疑密钥泄露：
1. 生成新的ENCRYPTION_KEY
2. 重新保存所有SMTP配置
3. 旧的加密数据将无法解密

### 4. 备份配置

```bash
# 导出配置（不包含密码）
mongo
use userdata
db.systemconfigs.find({}, {
  "email.smtpPassword": 0
}).pretty()
```

---

## 📝 迁移指南

### 从.env迁移到数据库

**步骤1：** 记录当前.env配置

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**步骤2：** 访问管理后台配置页面

http://localhost:5173/admin/email-config

**步骤3：** 填写相同的配置并保存

**步骤4：** 测试配置是否正常

**步骤5：** （可选）从.env中删除SMTP配置

```env
# 可以注释掉或删除
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# ...
```

---

## ❓ 常见问题

### Q: 密码会被看到吗？
A: 不会。密码在数据库中是加密的，前端显示为`******`，只有在发送邮件时才临时解密。

### Q: 如果忘记密码怎么办？
A: 重新输入新密码并保存即可，系统会重新加密。

### Q: 可以导出配置吗？
A: 可以导出除密码外的所有配置。密码是加密的，导出也没有意义。

### Q: 多个管理员会冲突吗？
A: 不会。配置是全局的，所有管理员看到的是同一份配置。

### Q: 性能会受影响吗？
A: 不会。解密操作非常快（微秒级），对性能影响可以忽略。

---

## 🎉 总结

### ✅ 优势

**vs .env文件：**
- ✅ 更安全（加密存储）
- ✅ 更灵活（动态更新）
- ✅ 更方便（可视化配置）
- ✅ 更可靠（不怕文件丢失）

**安全性：**
- ✅ AES-256加密
- ✅ 随机IV
- ✅ 权限控制
- ✅ 密码隐藏

**易用性：**
- ✅ 可视化界面
- ✅ 一键测试
- ✅ 常用示例
- ✅ 实时生效

### 🚀 立即使用

1. 访问：http://localhost:5173/admin/email-config
2. 填写SMTP配置
3. 保存并测试
4. 开始使用！

---

**享受更安全的邮件配置！** 🔒
