# 📧 邮件模板中添加Logo和网站链接

## 🎯 新增变量

现在邮件模板支持以下新变量：

### `{{siteUrl}}`
- **说明：** 网站主页URL
- **用途：** 创建可点击的链接
- **示例值：** `http://localhost:5173` 或 `https://yoursite.com`

### `{{logoUrl}}`
- **说明：** 网站Logo图片URL
- **用途：** 在邮件中显示Logo
- **示例值：** `http://localhost:5173/logo.png`

## 💡 使用示例

### 1. 简单的可点击Logo

```html
<a href="{{siteUrl}}">
  <img src="{{logoUrl}}" alt="{{siteName}}" style="max-width: 150px;">
</a>
```

### 2. 带样式的Logo头部

```html
<div style="text-align: center; padding: 20px; background: #f5f5f5;">
  <a href="{{siteUrl}}" target="_blank">
    <img src="{{logoUrl}}" alt="{{siteName}}" style="max-width: 200px; height: auto;">
  </a>
  <p style="margin-top: 10px; color: #666;">{{siteName}}</p>
</div>
```

### 3. 完整的邮件头部

```html
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #667eea;">
  <tr>
    <td align="center" style="padding: 30px 0;">
      <a href="{{siteUrl}}" target="_blank" style="text-decoration: none;">
        <img src="{{logoUrl}}" alt="{{siteName}}" style="max-width: 180px; height: auto;">
      </a>
    </td>
  </tr>
</table>
```

### 4. 邮件底部链接

```html
<div style="text-align: center; padding: 20px; border-top: 1px solid #eee;">
  <p style="color: #666; font-size: 14px;">
    <a href="{{siteUrl}}" style="color: #667eea; text-decoration: none;">
      访问 {{siteName}}
    </a>
  </p>
  <p style="color: #999; font-size: 12px;">
    &copy; {{year}} {{siteName}}. All rights reserved.
  </p>
</div>
```

## 🎨 完整模板示例

### 专业的验证码邮件模板

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px 20px;
      text-align: center;
    }
    .logo {
      max-width: 150px;
      height: auto;
      display: inline-block;
    }
    .content {
      padding: 40px 30px;
    }
    .code-box {
      background: #f0f4ff;
      border: 2px dashed #667eea;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin: 30px 0;
    }
    .code {
      font-size: 36px;
      font-weight: bold;
      color: #667eea;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #667eea;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      margin: 20px 0;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer-links {
      margin: 15px 0;
    }
    .footer-links a {
      color: #667eea;
      text-decoration: none;
      margin: 0 10px;
    }
    .warning {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- 头部Logo -->
    <div class="header">
      <a href="{{siteUrl}}" target="_blank">
        <img src="{{logoUrl}}" alt="{{siteName}}" class="logo">
      </a>
    </div>
    
    <!-- 主要内容 -->
    <div class="content">
      <h1 style="color: #1f2937; margin-top: 0;">🔐 验证码</h1>
      
      <p>您好，<strong>{{username}}</strong>！</p>
      
      <p>您正在进行重要操作，请使用以下验证码完成验证：</p>
      
      <!-- 验证码 -->
      <div class="code-box">
        <div class="code">{{code}}</div>
        <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">
          验证码有效期：{{expireMinutes}} 分钟
        </p>
      </div>
      
      <!-- 安全提示 -->
      <div class="warning">
        <strong>⚠️ 安全提示：</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>如果这不是您本人的操作，请忽略此邮件</li>
          <li>请勿将验证码告诉任何人</li>
          <li>验证码仅用于身份验证，其他用途均为诈骗</li>
        </ul>
      </div>
      
      <p style="margin-top: 30px;">
        如有疑问，请访问我们的帮助中心或联系客服。
      </p>
      
      <div style="text-align: center;">
        <a href="{{siteUrl}}" class="button" target="_blank">
          访问 {{siteName}}
        </a>
      </div>
    </div>
    
    <!-- 底部 -->
    <div class="footer">
      <div class="footer-links">
        <a href="{{siteUrl}}" target="_blank">首页</a>
        <a href="{{siteUrl}}/faq" target="_blank">帮助中心</a>
        <a href="{{siteUrl}}/dashboard/tickets" target="_blank">联系客服</a>
      </div>
      
      <p style="color: #6b7280; font-size: 12px; margin: 10px 0;">
        此邮件由系统自动发送，请勿直接回复
      </p>
      
      <p style="color: #9ca3af; font-size: 12px; margin: 10px 0;">
        &copy; {{year}} {{siteName}}. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
```

## 📝 使用步骤

### 1. 准备Logo图片

确保你的Logo图片可以通过URL访问，例如：
- 放在 `public/logo.png`
- 或使用外部图床URL

### 2. 编辑模板

1. 登录管理后台
2. 进入"邮件管理" → "邮件模板"
3. 选择要编辑的模板
4. 在HTML内容中使用 `{{logoUrl}}` 和 `{{siteUrl}}`

### 3. 预览测试

点击"预览"按钮查看效果，确保：
- Logo正确显示
- 链接可以点击
- 样式符合预期

### 4. 保存并启用

确认无误后保存模板。

## 🎯 最佳实践

### Logo图片建议

- **格式：** PNG（支持透明背景）或 SVG
- **尺寸：** 建议宽度 150-200px
- **大小：** 小于 100KB
- **背景：** 透明或白色

### 链接设置

```html
<!-- 推荐：在新标签页打开 -->
<a href="{{siteUrl}}" target="_blank" rel="noopener noreferrer">

<!-- 添加样式防止邮件客户端修改 -->
<a href="{{siteUrl}}" style="color: #667eea; text-decoration: none;">
```

### 响应式设计

```html
<!-- 使用百分比宽度 -->
<img src="{{logoUrl}}" alt="{{siteName}}" style="max-width: 100%; height: auto;">

<!-- 或使用媒体查询 -->
<style>
  @media only screen and (max-width: 600px) {
    .logo { max-width: 120px !important; }
  }
</style>
```

### 邮件客户端兼容性

```html
<!-- 使用table布局更兼容 -->
<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center">
      <a href="{{siteUrl}}">
        <img src="{{logoUrl}}" alt="{{siteName}}" width="150" style="display: block;">
      </a>
    </td>
  </tr>
</table>
```

## 🔧 变量配置

这些变量会自动从系统配置中获取：

- `{{siteUrl}}` - 从环境变量 `FRONTEND_URL` 或当前域名
- `{{logoUrl}}` - 从网站配置或默认Logo路径
- `{{siteName}}` - 从环境变量 `SITE_NAME` 或网站配置

## ✅ 测试清单

发送邮件前，请确认：

- [ ] Logo图片可以正常访问
- [ ] Logo在不同邮件客户端中显示正常
- [ ] 链接可以点击并跳转到正确页面
- [ ] 在移动设备上显示正常
- [ ] 在Gmail、Outlook、QQ邮箱等主流客户端测试

## 🎉 效果展示

使用这些变量后，你的邮件将：

- ✅ 显示专业的品牌Logo
- ✅ 提供便捷的网站访问入口
- ✅ 增强品牌识别度
- ✅ 提升用户体验
- ✅ 看起来更专业可信

---

现在你可以创建带有Logo和可点击链接的专业邮件模板了！🎊
