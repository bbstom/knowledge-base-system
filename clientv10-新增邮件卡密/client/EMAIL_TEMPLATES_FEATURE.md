# 📧 邮件模板管理功能

## ✅ 功能已创建

现在管理员可以在后台自定义邮件模板了！

## 🎯 功能特性

### 1. 模板管理
- 📋 查看所有邮件模板
- ✏️ 创建/编辑模板
- 🗑️ 删除模板
- 👁️ 实时预览
- 💾 保存和测试

### 2. 支持的模板类型

1. **验证码邮件** (`verification_code`)
   - 用于发送验证码
   - 密码重置、邮箱验证等场景

2. **密码重置成功** (`password_reset_success`)
   - 密码重置成功通知
   - 安全提示

3. **欢迎邮件** (`welcome`)
   - 新用户注册欢迎
   - 系统介绍

4. **通知邮件** (`notification`)
   - 系统通知
   - 重要消息

### 3. 可用变量

模板中可以使用以下变量：

- `{{code}}` - 验证码
- `{{username}}` - 用户名
- `{{email}}` - 邮箱地址
- `{{siteName}}` - 网站名称
- `{{expireMinutes}}` - 过期时间（分钟）
- `{{year}}` - 当前年份
{{siteUrl}} - 网站主页URL，用于创建可点击链接
{{logoUrl}} - 网站Logo图片URL，用于显示Logo

### 4. 编辑器功能

- HTML 内容编辑
- 纯文本版本（可选）
- 变量说明提示
- 实时预览功能
- 启用/禁用开关

## 📍 访问路径

### 方式1：通过菜单
1. 登录管理后台
2. 点击侧边栏"邮件管理"
3. 选择"邮件模板"

### 方式2：直接访问
```
http://localhost:5173/admin/email-templates
```

## 🎨 界面预览

### 模板列表
- 卡片式布局
- 显示模板名称、描述、主题
- 显示可用变量
- 编辑和删除按钮

### 编辑器
- 模板类型选择
- 邮件主题输入
- HTML 内容编辑器
- 纯文本编辑器
- 变量说明面板
- 预览按钮
- 保存按钮

## 🚀 使用步骤

### 1. 初始化默认模板

首次使用时，点击"初始化默认模板"按钮，系统会创建4个默认模板。

### 2. 编辑模板

1. 点击模板卡片上的"编辑"按钮
2. 修改邮件主题和内容
3. 使用 `{{variable}}` 语法插入变量
4. 点击"预览"查看效果
5. 点击"保存"保存更改

### 3. 创建新模板

1. 点击"创建模板"按钮
2. 选择模板类型
3. 填写主题和内容
4. 保存

### 4. 预览模板

点击"预览"按钮，系统会使用测试数据渲染模板，让你看到实际效果。

## 📝 模板示例

### 验证码邮件模板（带Logo）

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; }
    .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #667eea; }
    .logo { max-width: 150px; height: auto; }
    .content { padding: 30px 20px; }
    .code { font-size: 32px; font-weight: bold; color: #667eea; text-align: center; padding: 20px; background: #f0f4ff; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <!-- 可点击的Logo -->
    <div class="header">
      <a href="{{siteUrl}}" target="_blank">
        <img src="{{logoUrl}}" alt="{{siteName}}" class="logo">
      </a>
    </div>
    
    <div class="content">
      <h1>验证码</h1>
      <p>您好，{{username}}！</p>
      <p>您的验证码是：</p>
      <div class="code">{{code}}</div>
      <p>验证码有效期：{{expireMinutes}} 分钟</p>
      <p>如果这不是您本人的操作，请忽略此邮件。</p>
    </div>
    
    <div class="footer">
      <p>
        <a href="{{siteUrl}}" style="color: #667eea; text-decoration: none;">访问 {{siteName}}</a>
      </p>
      <p>&copy; {{year}} {{siteName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

## 🔧 技术实现

### 前端
- **页面：** `src/pages/Admin/EmailTemplates.tsx`
- **路由：** `/admin/email-templates`
- **菜单：** 邮件管理 → 邮件模板

### 后端
- **API：** `/api/email-templates`
- **模型：** `server/models/EmailTemplate.js`
- **路由：** `server/routes/emailTemplates.js`

### API 接口

1. **GET /api/email-templates**
   - 获取所有模板

2. **GET /api/email-templates/:name**
   - 获取单个模板

3. **POST /api/email-templates**
   - 创建/更新模板

4. **DELETE /api/email-templates/:name**
   - 删除模板

5. **POST /api/email-templates/init-defaults**
   - 初始化默认模板

6. **POST /api/email-templates/:name/preview**
   - 预览模板

## 💡 使用建议

### 1. 保持简洁
- 邮件内容不要太长
- 重点信息突出显示
- 使用清晰的排版

### 2. 测试兼容性
- 预览模板确保显示正常
- 考虑不同邮件客户端的兼容性
- 提供纯文本版本作为备选

### 3. 变量使用
- 确保使用正确的变量名
- 变量名区分大小写
- 使用 `{{variable}}` 语法

### 4. 安全提示
- 在敏感操作邮件中添加安全提示
- 提醒用户不要泄露验证码
- 说明如何联系客服

## 🎯 实际应用

### 验证码邮件
当用户请求密码重置时，系统会：
1. 生成验证码
2. 从数据库读取 `verification_code` 模板
3. 替换模板中的变量
4. 发送邮件

### 自定义流程
```javascript
// 在 emailService.js 中
const template = await EmailTemplate.findOne({ 
  name: 'verification_code', 
  isActive: true 
});

if (template) {
  const rendered = template.render({
    code: '123456',
    username: 'John',
    siteName: '信息查询系统',
    expireMinutes: '10',
    year: new Date().getFullYear()
  });
  
  // 发送邮件
  await transporter.sendMail({
    to: email,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text
  });
}
```

## 📊 菜单结构

```
邮件管理
├── SMTP配置 (/admin/email-config)
│   ├── SMTP服务器设置
│   ├── 密码加密存储
│   └── 配置测试
└── 邮件模板 (/admin/email-templates)
    ├── 模板列表
    ├── 创建/编辑
    ├── 预览
    └── 删除
```

## ✅ 完成的工作

1. ✅ 创建前端管理页面
2. ✅ 添加路由配置
3. ✅ 更新菜单结构
4. ✅ 支持子菜单展开/收起
5. ✅ 集成现有后端API
6. ✅ 实现模板编辑器
7. ✅ 实现预览功能
8. ✅ 添加变量说明

## 🎉 总结

现在你可以在管理后台完全自定义邮件模板了！

访问 **管理后台 → 邮件管理 → 邮件模板** 开始使用。

建议先点击"初始化默认模板"创建基础模板，然后根据需要进行自定义。
