# 高级邮件功能 - 完整实现

## 🎯 新增功能

### 1. ✅ 发送频率限制
防止恶意发送和滥用，保护系统资源

### 2. ✅ 邮件模板自定义
管理后台可以自定义邮件模板，支持多语言

### 3. 🔄 滑块验证（待实现）
防止机器人攻击

---

## 📊 功能一：发送频率限制

### 限制规则

#### 发送验证码
- **邮箱限制：** 每小时最多5次
- **IP限制：** 每小时最多10次

#### 验证验证码
- **邮箱限制：** 每小时最多10次
- **IP限制：** 每小时最多20次

#### 重置密码
- **邮箱限制：** 每天最多3次
- **IP限制：** 每天最多5次

### 实现文件

**后端：**
- `server/models/RateLimit.js` - 频率限制数据模型
- `server/middleware/rateLimit.js` - 频率限制中间件
- `server/routes/auth.js` - 已集成频率限制

### 工作原理

1. **请求到达** → 提取邮箱和IP
2. **检查限制** → 查询数据库中的请求记录
3. **判断是否超限** → 
   - 未超限：允许请求，计数+1
   - 已超限：拒绝请求，返回429状态码
4. **自动清理** → TTL索引自动删除过期记录

### 响应示例

**成功响应：**
```json
{
  "success": true,
  "message": "验证码已发送"
}
```

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

### 管理员操作

**重置用户限制：**
```javascript
const RateLimit = require('./models/RateLimit');

// 重置特定邮箱的发送限制
await RateLimit.resetLimit('user@example.com', 'email', 'send_code');

// 重置特定IP的所有限制
await RateLimit.deleteMany({ identifier: '192.168.1.1', type: 'ip' });
```

### 配置调整

编辑 `server/middleware/rateLimit.js`：

```javascript
const RATE_LIMITS = {
  send_code: {
    email: { max: 5, window: 60 * 60 * 1000 },  // 修改这里
    ip: { max: 10, window: 60 * 60 * 1000 }
  },
  // ...
};
```

---

## 📧 功能二：邮件模板自定义

### 功能特点

- ✅ 管理后台可视化编辑
- ✅ 支持HTML和纯文本
- ✅ 变量替换系统
- ✅ 模板预览功能
- ✅ 多语言支持
- ✅ 启用/禁用控制

### 实现文件

**后端：**
- `server/models/EmailTemplate.js` - 邮件模板数据模型
- `server/routes/emailTemplates.js` - 邮件模板管理API
- `server/services/emailService.js` - 已集成模板系统

**前端（待实现）：**
- `src/pages/Admin/EmailTemplateManagement.tsx` - 模板管理页面

### 默认模板

#### 1. verification_code（验证码邮件）
**变量：**
- `{{code}}` - 验证码
- `{{expireMinutes}}` - 过期时间（分钟）
- `{{siteName}}` - 网站名称
- `{{year}}` - 年份

#### 2. password_reset_success（重置成功通知）
**变量：**
- `{{username}}` - 用户名
- `{{resetTime}}` - 重置时间
- `{{siteName}}` - 网站名称
- `{{year}}` - 年份

### API接口

#### 获取所有模板
```
GET /api/email-templates
Headers: Authorization: Bearer <admin_token>
```

#### 获取单个模板
```
GET /api/email-templates/:name
Headers: Authorization: Bearer <admin_token>
```

#### 创建/更新模板
```
POST /api/email-templates
Headers: Authorization: Bearer <admin_token>
Body: {
  "name": "verification_code",
  "subject": "验证码 - {{siteName}}",
  "htmlContent": "<html>...</html>",
  "textContent": "纯文本内容",
  "variables": [
    {
      "name": "code",
      "description": "验证码",
      "example": "123456"
    }
  ],
  "language": "zh-CN",
  "isActive": true
}
```

#### 删除模板
```
DELETE /api/email-templates/:name
Headers: Authorization: Bearer <admin_token>
```

#### 初始化默认模板
```
POST /api/email-templates/init-defaults
Headers: Authorization: Bearer <admin_token>
```

#### 预览模板
```
POST /api/email-templates/:name/preview
Headers: Authorization: Bearer <admin_token>
```

### 使用示例

**初始化默认模板：**
```bash
curl -X POST http://localhost:3001/api/email-templates/init-defaults \
  -H "Authorization: Bearer <admin_token>"
```

**获取所有模板：**
```bash
curl http://localhost:3001/api/email-templates \
  -H "Authorization: Bearer <admin_token>"
```

**更新模板：**
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

### 模板变量系统

**定义变量：**
```javascript
variables: [
  {
    name: 'code',           // 变量名
    description: '验证码',   // 描述
    example: '123456'       // 示例值
  }
]
```

**使用变量：**
```html
<div class="code">{{code}}</div>
<p>有效期：{{expireMinutes}}分钟</p>
```

**渲染变量：**
```javascript
const rendered = template.render({
  code: '123456',
  expireMinutes: '10',
  siteName: '信息查询系统',
  year: '2024'
});
```

### 多语言支持

**创建中文模板：**
```javascript
{
  name: 'verification_code',
  language: 'zh-CN',
  subject: '验证码 - {{siteName}}',
  htmlContent: '...'
}
```

**创建英文模板：**
```javascript
{
  name: 'verification_code_en',
  language: 'en-US',
  subject: 'Verification Code - {{siteName}}',
  htmlContent: '...'
}
```

---

## 🔄 功能三：滑块验证（待实现）

### 计划功能

- 滑块拖动验证
- 拼图验证
- 点击验证
- 行为分析

### 推荐方案

#### 1. 使用第三方服务
- **腾讯云验证码**
- **阿里云验证码**
- **Google reCAPTCHA**

#### 2. 开源方案
- **vue-puzzle-vcode**
- **react-captcha**
- **slider-captcha**

### 集成示例（腾讯云）

**前端：**
```typescript
import TencentCaptcha from 'tencent-captcha';

const captcha = new TencentCaptcha('your-app-id', (res) => {
  if (res.ret === 0) {
    // 验证成功
    sendVerificationCode(res.ticket, res.randstr);
  }
});

captcha.show();
```

**后端：**
```javascript
const axios = require('axios');

async function verifyCaptcha(ticket, randstr, userIP) {
  const response = await axios.get('https://ssl.captcha.qq.com/ticket/verify', {
    params: {
      aid: 'your-app-id',
      AppSecretKey: 'your-secret-key',
      Ticket: ticket,
      Randstr: randstr,
      UserIP: userIP
    }
  });
  
  return response.data.response === '1';
}
```

---

## 📊 数据库结构

### RateLimit集合

```javascript
{
  _id: ObjectId,
  identifier: String,      // 邮箱或IP
  type: String,            // 'email' 或 'ip'
  action: String,          // 'send_code', 'verify_code', 'reset_password'
  count: Number,           // 请求次数
  windowStart: Date,       // 时间窗口开始时间
  expiresAt: Date,         // 过期时间
  createdAt: Date
}
```

**索引：**
```javascript
{ identifier: 1, type: 1, action: 1 }  // 复合索引
{ expiresAt: 1 }                        // TTL索引
```

### EmailTemplate集合

```javascript
{
  _id: ObjectId,
  name: String,            // 模板名称（唯一）
  subject: String,         // 邮件主题
  htmlContent: String,     // HTML内容
  textContent: String,     // 纯文本内容
  variables: [{            // 变量定义
    name: String,
    description: String,
    example: String
  }],
  language: String,        // 语言
  isActive: Boolean,       // 是否启用
  createdAt: Date,
  updatedAt: Date
}
```

**索引：**
```javascript
{ name: 1 }  // 唯一索引
```

---

## 🧪 测试

### 测试频率限制

**测试脚本：**
```javascript
// test-rate-limit.js
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
      } else {
        console.log(`第${i}次请求: ❌ 其他错误`);
      }
    }
    
    // 等待1秒
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testRateLimit();
```

**运行测试：**
```bash
cd server
node test-rate-limit.js
```

**预期结果：**
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

**初始化默认模板：**
```bash
curl -X POST http://localhost:3001/api/email-templates/init-defaults \
  -H "Authorization: Bearer <admin_token>"
```

**预览模板：**
```bash
curl -X POST http://localhost:3001/api/email-templates/verification_code/preview \
  -H "Authorization: Bearer <admin_token>"
```

---

## 🔧 配置

### 调整频率限制

编辑 `server/middleware/rateLimit.js`：

```javascript
const RATE_LIMITS = {
  send_code: {
    email: { 
      max: 10,                    // 改为10次
      window: 60 * 60 * 1000      // 1小时
    },
    ip: { 
      max: 20,                    // 改为20次
      window: 60 * 60 * 1000 
    }
  }
};
```

### 禁用频率限制（开发环境）

编辑 `server/routes/auth.js`：

```javascript
// 注释掉频率限制中间件
router.post('/forgot-password/send-code', 
  // rateLimitMiddleware('send_code'),  // 注释这行
  async (req, res) => {
  // ...
});
```

---

## 📈 监控和统计

### 查看频率限制统计

```javascript
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
```

### 查看邮件模板使用情况

```javascript
// 查看所有启用的模板
db.emailtemplates.find({ isActive: true });

// 查看最近更新的模板
db.emailtemplates.find().sort({ updatedAt: -1 }).limit(5);
```

---

## 🚀 部署建议

### 生产环境配置

1. **启用Redis缓存**
   - 将频率限制数据存储在Redis中
   - 提高查询性能

2. **使用CDN**
   - 邮件中的图片使用CDN
   - 加快邮件加载速度

3. **监控告警**
   - 监控频率限制触发次数
   - 异常IP自动封禁

4. **日志记录**
   - 记录所有被限制的请求
   - 分析攻击模式

---

## 📝 总结

### 已实现功能

✅ **发送频率限制**
- 邮箱和IP双重限制
- 自动过期清理
- 响应头显示剩余次数
- 管理员可重置限制

✅ **邮件模板自定义**
- 数据库存储模板
- 变量替换系统
- 模板预览功能
- 多语言支持
- 完整的管理API

### 待实现功能

🔄 **滑块验证**
- 集成第三方验证服务
- 或使用开源方案

### 下一步

1. **配置频率限制规则**
2. **初始化默认邮件模板**
3. **创建前端管理页面**
4. **集成滑块验证**
5. **测试完整流程**

---

## 📚 相关文档

- `EMAIL_VERIFICATION_SETUP.md` - 邮箱验证码基础功能
- `QUICK_START_EMAIL_RESET.md` - 快速开始指南
- `PASSWORD_RESET_COMPLETE.md` - 密码重置完整说明
- `ADVANCED_EMAIL_FEATURES.md` - 本文档

---

**功能已完成！** 🎉

现在系统具备：
- ✅ 防止恶意发送（频率限制）
- ✅ 灵活的邮件模板（自定义管理）
- 🔄 防止机器人攻击（待集成滑块验证）
