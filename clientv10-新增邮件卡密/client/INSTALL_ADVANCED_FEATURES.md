# 安装高级邮件功能

## 🎯 新功能

1. ✅ **发送频率限制** - 防止恶意发送和滥用
2. ✅ **邮件模板自定义** - 管理后台可自定义邮件模板
3. 🔄 **滑块验证** - 防止机器人（待集成）

---

## 📦 安装步骤

### 步骤1：确认依赖已安装

```bash
cd server
npm install nodemailer
```

### 步骤2：重启服务器

```bash
# 停止当前服务器（Ctrl+C）
# 重新启动
npm run dev
```

### 步骤3：初始化默认邮件模板

**方式一：使用curl**
```bash
curl -X POST http://localhost:3001/api/email-templates/init-defaults \
  -H "Authorization: Bearer <admin_token>"
```

**方式二：使用浏览器**
1. 登录管理后台
2. 打开浏览器控制台
3. 执行：
```javascript
fetch('/api/email-templates/init-defaults', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
  }
}).then(r => r.json()).then(console.log);
```

### 步骤4：测试功能

**测试频率限制：**
```bash
cd server
node -e "
const axios = require('axios');
async function test() {
  for (let i = 1; i <= 7; i++) {
    try {
      const res = await axios.post('http://localhost:3001/api/auth/forgot-password/send-code', {
        email: 'test@example.com'
      });
      console.log(\`第\${i}次: ✅ 成功, 剩余: \${res.headers['x-ratelimit-remaining-email']}\`);
    } catch (e) {
      console.log(\`第\${i}次: ❌ \${e.response?.data?.message}\`);
      break;
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}
test();
"
```

**测试邮件模板：**
```bash
# 获取所有模板
curl http://localhost:3001/api/email-templates \
  -H "Authorization: Bearer <admin_token>"

# 预览模板
curl -X POST http://localhost:3001/api/email-templates/verification_code/preview \
  -H "Authorization: Bearer <admin_token>"
```

---

## ✅ 功能验证

### 1. 频率限制验证

**预期行为：**
- 前5次发送验证码：成功
- 第6次发送：被限制，提示"请求过于频繁"
- 响应头包含剩余次数

**验证方法：**
1. 访问：http://localhost:5173/forgot-password
2. 连续发送验证码6次
3. 第6次应该被拒绝

### 2. 邮件模板验证

**预期行为：**
- 默认模板已创建
- 可以获取模板列表
- 可以预览模板

**验证方法：**
```bash
# 检查数据库
mongo
use userdata
db.emailtemplates.find().pretty()
```

---

## 🔧 配置

### 调整频率限制

编辑 `server/middleware/rateLimit.js`：

```javascript
const RATE_LIMITS = {
  send_code: {
    email: { max: 5, window: 60 * 60 * 1000 },  // 每小时5次
    ip: { max: 10, window: 60 * 60 * 1000 }     // 每小时10次
  },
  verify_code: {
    email: { max: 10, window: 60 * 60 * 1000 },
    ip: { max: 20, window: 60 * 60 * 1000 }
  },
  reset_password: {
    email: { max: 3, window: 24 * 60 * 60 * 1000 },  // 每天3次
    ip: { max: 5, window: 24 * 60 * 60 * 1000 }
  }
};
```

### 自定义邮件模板

**通过API更新：**
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

---

## 📊 数据库结构

### 新增集合

**ratelimits（频率限制）**
```javascript
{
  identifier: String,    // 邮箱或IP
  type: String,          // 'email' 或 'ip'
  action: String,        // 'send_code', 'verify_code', 'reset_password'
  count: Number,         // 请求次数
  windowStart: Date,     // 时间窗口开始
  expiresAt: Date        // 过期时间
}
```

**emailtemplates（邮件模板）**
```javascript
{
  name: String,          // 模板名称
  subject: String,       // 邮件主题
  htmlContent: String,   // HTML内容
  textContent: String,   // 纯文本内容
  variables: Array,      // 变量定义
  language: String,      // 语言
  isActive: Boolean,     // 是否启用
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 前端集成（待实现）

### 邮件模板管理页面

创建 `src/pages/Admin/EmailTemplateManagement.tsx`：

```typescript
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/Layout/AdminLayout';

export const EmailTemplateManagement: React.FC = () => {
  const [templates, setTemplates] = useState([]);
  
  useEffect(() => {
    loadTemplates();
  }, []);
  
  const loadTemplates = async () => {
    const response = await fetch('/api/email-templates', {
      headers: {
        'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
      }
    });
    const data = await response.json();
    if (data.success) {
      setTemplates(data.data.templates);
    }
  };
  
  return (
    <AdminLayout>
      <div>
        <h1>邮件模板管理</h1>
        {/* 模板列表和编辑器 */}
      </div>
    </AdminLayout>
  );
};
```

### 添加到路由

编辑 `src/App.tsx`：

```typescript
import { EmailTemplateManagement } from './pages/Admin/EmailTemplateManagement';

// 在Admin Routes中添加
<Route 
  path="/admin/email-templates" 
  element={
    <AdminRoute>
      <EmailTemplateManagement />
    </AdminRoute>
  } 
/>
```

### 添加到管理菜单

编辑 `src/components/Layout/AdminLayout.tsx`：

```typescript
{
  name: '邮件模板',
  path: '/admin/email-templates',
  icon: Mail
}
```

---

## 🧪 测试脚本

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

---

## 📚 相关文档

- **ADVANCED_EMAIL_FEATURES.md** - 高级功能详细文档 ⭐
- **EMAIL_VERIFICATION_SETUP.md** - 基础邮箱验证功能
- **QUICK_START_EMAIL_RESET.md** - 快速开始指南
- **PASSWORD_RESET_COMPLETE.md** - 密码重置完整说明

---

## ✅ 完成清单

安装前检查：
- [ ] 已安装nodemailer
- [ ] 已配置SMTP邮件服务
- [ ] 服务器正在运行

安装后验证：
- [ ] 频率限制正常工作
- [ ] 默认邮件模板已创建
- [ ] 可以获取模板列表
- [ ] 可以预览模板
- [ ] 邮件使用新模板发送

---

## 🎉 总结

新增功能已完成：

✅ **发送频率限制**
- 邮箱和IP双重限制
- 自动过期清理
- 响应头显示剩余次数

✅ **邮件模板自定义**
- 数据库存储模板
- 变量替换系统
- 模板预览功能
- 完整的管理API

🔄 **滑块验证**
- 待集成第三方服务

**下一步：**
1. 测试频率限制功能
2. 初始化默认邮件模板
3. 创建前端管理页面
4. 集成滑块验证服务
