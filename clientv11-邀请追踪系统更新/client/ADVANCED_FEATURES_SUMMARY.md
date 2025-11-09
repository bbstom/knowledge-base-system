# 高级邮件功能 - 实现总结

## 🎉 完成情况

根据你的需求，我已经实现了以下高级功能：

### ✅ 1. 发送频率限制
**状态：已完成**

防止恶意发送和滥用，保护系统资源。

**功能特点：**
- 邮箱和IP双重限制
- 灵活的限制规则配置
- 自动过期清理（TTL索引）
- 响应头显示剩余次数
- 管理员可重置限制

**限制规则：**
- 发送验证码：每小时5次（邮箱）/ 10次（IP）
- 验证验证码：每小时10次（邮箱）/ 20次（IP）
- 重置密码：每天3次（邮箱）/ 5次（IP）

### ✅ 2. 邮件模板自定义
**状态：已完成**

管理后台可以自定义邮件模板，支持多语言。

**功能特点：**
- 数据库存储模板
- 变量替换系统
- 模板预览功能
- 多语言支持
- 启用/禁用控制
- 完整的管理API

**默认模板：**
- verification_code（验证码邮件）
- password_reset_success（重置成功通知）

### 🔄 3. 滑块验证
**状态：待集成**

防止机器人攻击。

**推荐方案：**
- 腾讯云验证码
- 阿里云验证码
- Google reCAPTCHA
- 开源方案（vue-puzzle-vcode等）

---

## 📁 新增文件清单

### 后端文件

**数据模型：**
- `server/models/RateLimit.js` - 频率限制模型
- `server/models/EmailTemplate.js` - 邮件模板模型

**中间件：**
- `server/middleware/rateLimit.js` - 频率限制中间件

**路由：**
- `server/routes/emailTemplates.js` - 邮件模板管理API

**修改的文件：**
- `server/routes/auth.js` - 集成频率限制
- `server/services/emailService.js` - 集成模板系统
- `server/index.js` - 注册新路由

### 文档文件

- `ADVANCED_EMAIL_FEATURES.md` - 详细功能文档
- `INSTALL_ADVANCED_FEATURES.md` - 安装指南
- `ADVANCED_FEATURES_SUMMARY.md` - 本文档

---

## 🚀 快速开始

### 1. 确认依赖

```bash
cd server
npm install nodemailer  # 如果还没安装
```

### 2. 重启服务器

```bash
npm run dev
```

### 3. 初始化邮件模板

```bash
curl -X POST http://localhost:3001/api/email-templates/init-defaults \
  -H "Authorization: Bearer <admin_token>"
```

### 4. 测试功能

**测试频率限制：**
```bash
# 连续发送6次验证码，第6次应该被拒绝
for i in {1..6}; do
  curl -X POST http://localhost:3001/api/auth/forgot-password/send-code \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
  echo ""
  sleep 1
done
```

**测试邮件模板：**
```bash
# 获取所有模板
curl http://localhost:3001/api/email-templates \
  -H "Authorization: Bearer <admin_token>"
```

---

## 📊 API接口

### 频率限制

频率限制自动应用于以下接口：
- `POST /api/auth/forgot-password/send-code`
- `POST /api/auth/forgot-password/verify-code`
- `POST /api/auth/forgot-password/reset`

**响应头：**
```
X-RateLimit-Limit-Email: 5
X-RateLimit-Remaining-Email: 4
X-RateLimit-Limit-IP: 10
X-RateLimit-Remaining-IP: 9
```

**超限响应：**
```json
{
  "success": false,
  "message": "请求过于频繁，请在 45 分钟后重试",
  "resetIn": 45
}
```

### 邮件模板管理

**获取所有模板：**
```
GET /api/email-templates
Headers: Authorization: Bearer <admin_token>
```

**获取单个模板：**
```
GET /api/email-templates/:name
Headers: Authorization: Bearer <admin_token>
```

**创建/更新模板：**
```
POST /api/email-templates
Headers: Authorization: Bearer <admin_token>
Body: {
  "name": "verification_code",
  "subject": "验证码 - {{siteName}}",
  "htmlContent": "<html>...</html>",
  "isActive": true
}
```

**删除模板：**
```
DELETE /api/email-templates/:name
Headers: Authorization: Bearer <admin_token>
```

**初始化默认模板：**
```
POST /api/email-templates/init-defaults
Headers: Authorization: Bearer <admin_token>
```

**预览模板：**
```
POST /api/email-templates/:name/preview
Headers: Authorization: Bearer <admin_token>
```

---

## 🔧 配置

### 调整频率限制

编辑 `server/middleware/rateLimit.js`：

```javascript
const RATE_LIMITS = {
  send_code: {
    email: { max: 5, window: 60 * 60 * 1000 },  // 修改这里
    ip: { max: 10, window: 60 * 60 * 1000 }
  },
  verify_code: {
    email: { max: 10, window: 60 * 60 * 1000 },
    ip: { max: 20, window: 60 * 60 * 1000 }
  },
  reset_password: {
    email: { max: 3, window: 24 * 60 * 60 * 1000 },
    ip: { max: 5, window: 24 * 60 * 60 * 1000 }
  }
};
```

### 自定义邮件模板

**方式一：通过API**
```bash
curl -X POST http://localhost:3001/api/email-templates \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "verification_code",
    "subject": "您的验证码 - {{siteName}}",
    "htmlContent": "<html><body><h1>验证码：{{code}}</h1></body></html>",
    "isActive": true
  }'
```

**方式二：直接修改数据库**
```javascript
db.emailtemplates.updateOne(
  { name: 'verification_code' },
  { $set: { 
    subject: '新主题',
    htmlContent: '<html>...</html>'
  }}
);
```

---

## 📈 监控和管理

### 查看频率限制统计

```javascript
// 连接MongoDB
mongo mongodb://chroot:Ubuntu123!@172.16.254.15:27017/userdata?authSource=admin

// 查看某个邮箱的请求记录
db.ratelimits.find({ 
  identifier: 'user@example.com', 
  type: 'email' 
}).pretty();

// 统计今天被限制的请求数
db.ratelimits.aggregate([
  {
    $match: {
      count: { $gte: 5 },
      windowStart: { $gte: new Date(new Date().setHours(0,0,0,0)) }
    }
  },
  {
    $group: {
      _id: '$action',
      total: { $sum: 1 }
    }
  }
]);

// 清理所有频率限制记录（慎用）
db.ratelimits.deleteMany({});
```

### 管理邮件模板

```javascript
// 查看所有模板
db.emailtemplates.find().pretty();

// 查看启用的模板
db.emailtemplates.find({ isActive: true });

// 禁用某个模板
db.emailtemplates.updateOne(
  { name: 'verification_code' },
  { $set: { isActive: false }}
);

// 删除某个模板
db.emailtemplates.deleteOne({ name: 'verification_code' });
```

### 重置用户限制

```javascript
// 在Node.js中
const RateLimit = require('./models/RateLimit');

// 重置特定邮箱的发送限制
await RateLimit.resetLimit('user@example.com', 'email', 'send_code');

// 重置特定IP的所有限制
await RateLimit.deleteMany({ identifier: '192.168.1.1', type: 'ip' });
```

---

## 🧪 测试

### 测试频率限制

创建 `server/test-rate-limit.js`：

```javascript
const axios = require('axios');

async function testRateLimit() {
  const email = 'test@example.com';
  console.log('测试发送频率限制...\n');
  
  for (let i = 1; i <= 7; i++) {
    try {
      const response = await axios.post('http://localhost:3001/api/auth/forgot-password/send-code', {
        email
      });
      
      console.log(`第${i}次请求: ✅ 成功`);
      console.log(`剩余次数: ${response.headers['x-ratelimit-remaining-email']}`);
    } catch (error) {
      if (error.response?.status === 429) {
        console.log(`第${i}次请求: ❌ 被限制`);
        console.log(`错误信息: ${error.response.data.message}`);
        break;
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testRateLimit();
```

运行：
```bash
cd server
node test-rate-limit.js
```

**预期输出：**
```
测试发送频率限制...

第1次请求: ✅ 成功
剩余次数: 4
第2次请求: ✅ 成功
剩余次数: 3
第3次请求: ✅ 成功
剩余次数: 2
第4次请求: ✅ 成功
剩余次数: 1
第5次请求: ✅ 成功
剩余次数: 0
第6次请求: ❌ 被限制
错误信息: 请求过于频繁，请在 59 分钟后重试
```

### 测试邮件模板

```bash
# 初始化默认模板
curl -X POST http://localhost:3001/api/email-templates/init-defaults \
  -H "Authorization: Bearer <admin_token>"

# 获取所有模板
curl http://localhost:3001/api/email-templates \
  -H "Authorization: Bearer <admin_token>"

# 预览模板
curl -X POST http://localhost:3001/api/email-templates/verification_code/preview \
  -H "Authorization: Bearer <admin_token>"
```

---

## 🎨 前端集成（待实现）

### 创建邮件模板管理页面

`src/pages/Admin/EmailTemplateManagement.tsx`

**功能需求：**
- 模板列表展示
- 创建/编辑模板
- 删除模板
- 预览模板
- 启用/禁用模板
- 变量说明

**UI组件：**
- 模板列表（表格）
- 模板编辑器（富文本或代码编辑器）
- 变量选择器
- 预览窗口

### 添加到管理菜单

编辑 `src/components/Layout/AdminLayout.tsx`：

```typescript
{
  name: '系统设置',
  icon: Settings,
  submenu: [
    { name: '站点配置', path: '/admin/site-config' },
    { name: '系统配置', path: '/admin/system-settings' },
    { name: '邮件模板', path: '/admin/email-templates' },  // 新增
    // ...
  ]
}
```

---

## 🔄 滑块验证集成（待实现）

### 推荐方案

#### 1. 腾讯云验证码

**优点：**
- 国内访问速度快
- 中文文档完善
- 价格合理

**集成步骤：**
1. 注册腾讯云账号
2. 开通验证码服务
3. 获取AppID和SecretKey
4. 前端集成SDK
5. 后端验证票据

#### 2. 阿里云验证码

**优点：**
- 阿里云生态
- 稳定可靠
- 多种验证方式

#### 3. Google reCAPTCHA

**优点：**
- 免费
- 全球通用
- 技术成熟

**缺点：**
- 国内访问可能受限

### 集成示例（腾讯云）

**前端：**
```typescript
import TencentCaptcha from 'tencent-captcha';

const handleSendCode = () => {
  const captcha = new TencentCaptcha('your-app-id', (res) => {
    if (res.ret === 0) {
      // 验证成功，发送验证码
      sendVerificationCode(res.ticket, res.randstr);
    }
  });
  captcha.show();
};
```

**后端：**
```javascript
const axios = require('axios');

async function verifyCaptcha(ticket, randstr, userIP) {
  const response = await axios.get('https://ssl.captcha.qq.com/ticket/verify', {
    params: {
      aid: process.env.TENCENT_CAPTCHA_APP_ID,
      AppSecretKey: process.env.TENCENT_CAPTCHA_SECRET_KEY,
      Ticket: ticket,
      Randstr: randstr,
      UserIP: userIP
    }
  });
  
  return response.data.response === '1';
}

// 在发送验证码前验证
router.post('/forgot-password/send-code', 
  rateLimitMiddleware('send_code'),
  async (req, res) => {
    const { email, ticket, randstr } = req.body;
    const userIP = getClientIP(req);
    
    // 验证滑块
    const isValid = await verifyCaptcha(ticket, randstr, userIP);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: '验证失败，请重试'
      });
    }
    
    // 继续发送验证码...
  }
);
```

---

## 📚 文档导航

### 主要文档
- **ADVANCED_EMAIL_FEATURES.md** - 详细功能文档 ⭐
- **INSTALL_ADVANCED_FEATURES.md** - 安装指南
- **ADVANCED_FEATURES_SUMMARY.md** - 本文档

### 相关文档
- **EMAIL_VERIFICATION_SETUP.md** - 基础邮箱验证功能
- **QUICK_START_EMAIL_RESET.md** - 快速开始指南
- **PASSWORD_RESET_COMPLETE.md** - 密码重置完整说明
- **EMAIL_RESET_README.md** - 邮箱重置功能总览

---

## ✅ 完成清单

### 已实现功能

- [x] 发送频率限制
  - [x] 邮箱限制
  - [x] IP限制
  - [x] 自动过期清理
  - [x] 响应头显示剩余次数
  - [x] 管理员重置功能

- [x] 邮件模板自定义
  - [x] 数据库存储
  - [x] 变量替换系统
  - [x] 模板预览
  - [x] 多语言支持
  - [x] 管理API

### 待实现功能

- [ ] 滑块验证
  - [ ] 选择验证服务商
  - [ ] 前端集成
  - [ ] 后端验证

- [ ] 前端管理页面
  - [ ] 邮件模板管理页面
  - [ ] 频率限制监控页面

---

## 🎉 总结

我已经成功实现了你要求的高级邮件功能：

### ✅ 完成的功能

1. **发送频率限制** - 完全实现
   - 防止恶意发送和滥用
   - 灵活的配置规则
   - 自动清理机制

2. **邮件模板自定义** - 完全实现
   - 管理后台可配置
   - 变量替换系统
   - 多语言支持

3. **滑块验证** - 提供集成方案
   - 推荐服务商
   - 集成示例代码
   - 待实际集成

### 🚀 下一步

1. **测试功能**
   - 运行测试脚本
   - 验证频率限制
   - 验证邮件模板

2. **创建前端页面**
   - 邮件模板管理页面
   - 频率限制监控页面

3. **集成滑块验证**
   - 选择验证服务商
   - 完成前后端集成

所有核心功能已经实现并可以使用！🎊
