# 系统配置指南

## 快速开始

### 1. 登录管理后台

使用管理员账号登录：
- 邮箱：`admin@infosearch.com`
- 密码：`admin123`

### 2. 配置积分系统

路径：`/admin/settings` → 积分配置

**查询消耗配置：**
```
每次查询所需积分: 10
启用积分消耗: 是
```

**每日签到配置：**
```
每日签到获得积分: 10
连续7天奖励: 50
连续30天奖励: 200
启用每日签到: 是
```

**邀请奖励配置：**
```
成功邀请一个用户获得积分: 100
被邀请用户注册奖励: 50
启用邀请奖励: 是
```

**注册奖励配置：**
```
新用户注册奖励积分: 100
启用注册奖励: 是
```

**其他配置：**
```
积分过期时间: 0（永不过期）
最大积分上限: 0（无上限）
```

### 3. 配置搜索类型

路径：`/admin/settings` → 搜索类型

**默认搜索类型：**
- 身份证 (idcard)
- 手机号 (phone)
- 姓名 (name)
- QQ号 (qq)
- 微博号 (weibo)
- 微信号 (wechat)
- 邮箱 (email)

**添加自定义搜索类型：**
1. 点击"添加搜索类型"
2. 输入类型ID（英文，如：passport）
3. 输入显示名称（中文，如：护照号）
4. 设置排序顺序
5. 启用该类型
6. 保存

### 4. 配置数据库

路径：`/admin/settings` → 数据库配置

系统支持两种类型的数据库：

#### 用户数据库
存储用户账户、积分、订单等信息，只需配置一个。

**MySQL配置示例：**
```
数据库名称: 用户数据库
数据库类型: MySQL
主机地址: localhost
端口: 3306
用户名: root
密码: your_password
数据库名: infosearch_users
连接池大小: 10
超时时间: 30000
```

#### 查询数据库
存储搜索数据，支持配置多个数据库（主库、备库等）。

**添加查询数据库：**
1. 点击"添加查询数据库"
2. 填写数据库信息
3. 选择数据库类型（MySQL/PostgreSQL/MongoDB/SQL Server）
4. 设置启用状态
5. 保存

**MySQL查询数据库示例：**
```
数据库名称: 主查询数据库
数据库类型: MySQL
主机地址: localhost
端口: 3306
用户名: query_user
密码: your_password
数据库名: infosearch_data
连接池大小: 20
超时时间: 30000
启用: 是
```

**PostgreSQL查询数据库示例：**
```
数据库名称: 备用查询数据库
数据库类型: PostgreSQL
主机地址: localhost
端口: 5432
用户名: postgres
密码: your_password
数据库名: infosearch_backup
连接池大小: 10
超时时间: 30000
启用: 否
```

**支持的数据库类型：**
- MySQL
- PostgreSQL
- MongoDB
- SQL Server

### 5. 配置邮件服务

路径：`/admin/settings` → 邮件配置

#### Gmail SMTP配置

```
SMTP主机: smtp.gmail.com
SMTP端口: 587
SMTP用户名: your-email@gmail.com
SMTP密码: your-app-password
发件人名称: InfoSearch
发件人邮箱: your-email@gmail.com
SSL/TLS加密: 启用
```

**注意：** Gmail需要使用应用专用密码，不是账户密码。

#### 腾讯企业邮箱配置

```
SMTP主机: smtp.exmail.qq.com
SMTP端口: 465
SMTP用户名: noreply@yourdomain.com
SMTP密码: your-password
发件人名称: InfoSearch
发件人邮箱: noreply@yourdomain.com
SSL/TLS加密: 启用
```

#### 阿里云邮件推送配置

```
SMTP主机: smtpdm.aliyun.com
SMTP端口: 465
SMTP用户名: your-username@your-domain.com
SMTP密码: your-password
发件人名称: InfoSearch
发件人邮箱: noreply@your-domain.com
SSL/TLS加密: 启用
```

### 6. 配置邮件模板

路径：`/admin/settings` → 邮件配置 → 邮件模板

#### 欢迎邮件模板

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .content {
      padding: 30px;
      background: #f9fafb;
    }
    .button {
      display: inline-block;
      background: #4F46E5;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 欢迎加入 InfoSearch</h1>
  </div>
  <div class="content">
    <p>尊敬的 <strong>{{username}}</strong>，</p>
    <p>感谢您注册 InfoSearch 信息搜索平台！</p>
    <p>我们为您准备了 <strong>100积分</strong> 的新用户礼包。</p>
    <p>点击下方按钮验证您的邮箱：</p>
    <center>
      <a href="{{verify_link}}" class="button">验证邮箱</a>
    </center>
    <p>如果您没有注册此账户，请忽略此邮件。</p>
  </div>
  <div class="footer">
    <p>© 2024 InfoSearch. All rights reserved.</p>
    <p>如有问题，请联系客服：support@infosearch.com</p>
  </div>
</body>
</html>
```

#### 密码重置模板

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
    }
    .header {
      background: #EF4444;
      color: white;
      padding: 30px;
      text-align: center;
    }
    .content {
      padding: 30px;
      background: #f9fafb;
    }
    .button {
      display: inline-block;
      background: #EF4444;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .warning {
      background: #FEF3C7;
      border-left: 4px solid #F59E0B;
      padding: 15px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔐 重置密码</h1>
  </div>
  <div class="content">
    <p>您好 <strong>{{username}}</strong>，</p>
    <p>我们收到了您的密码重置请求。</p>
    <p>点击下方按钮重置您的密码：</p>
    <center>
      <a href="{{reset_link}}" class="button">重置密码</a>
    </center>
    <div class="warning">
      <strong>⚠️ 安全提示：</strong>
      <ul>
        <li>此链接将在24小时后失效</li>
        <li>如果您没有请求重置密码，请忽略此邮件</li>
        <li>请勿将此链接分享给他人</li>
      </ul>
    </div>
  </div>
</body>
</html>
```

## 内容管理配置

### 1. 添加数据库

路径：`/admin/content` → 数据库列表

**步骤：**
1. 点击"添加数据库"
2. 填写数据库信息：
   - 名称：如"手机号信息库"
   - 描述：详细说明数据库内容
   - 价格：每次查询费用
   - 记录数量：数据库记录总数
   - 支持的搜索类型：勾选支持的类型
   - 启用状态：是否对用户可见
3. 保存

### 2. 添加FAQ

路径：`/admin/content` → 常见问题

**步骤：**
1. 点击"添加问题"
2. 填写问题信息：
   - 问题：用户常问的问题
   - 答案：详细的解答
   - 分类：选择合适的分类
   - 排序：数字越小越靠前
3. 保存

### 3. 添加热门话题

路径：`/admin/content` → 热门话题

**步骤：**
1. 点击"添加话题"
2. 填写话题信息：
   - 标题：吸引人的标题
   - 内容：详细内容
   - 分类：选择合适的分类
   - 标签：用逗号分隔，如"安全,隐私"
   - 设为热门：是否在热门区域显示
3. 保存

### 4. 添加广告

路径：`/admin/content` → 广告管理

**步骤：**
1. 点击"添加广告"
2. 填写广告信息：
   - 标题：广告标题
   - 内容：HTML格式的广告内容
   - 显示位置：选择显示页面
   - 排序：数字越小越靠前
   - 启用状态：是否显示
3. 使用预览功能查看效果
4. 保存

## 常见问题

### Q: 如何测试邮件配置？
A: 在邮件配置页面，点击"发送测试邮件"按钮，系统会发送一封测试邮件到配置的邮箱。

### Q: 搜索类型修改后需要重启吗？
A: 不需要，修改会立即生效。

### Q: 如何备份配置？
A: 建议定期导出数据库配置和邮件模板，保存为JSON文件。

### Q: 数据库连接失败怎么办？
A: 检查以下项目：
1. 主机地址和端口是否正确
2. 用户名和密码是否正确
3. 数据库是否存在
4. 防火墙是否允许连接
5. 使用"测试连接"功能诊断问题

### Q: Gmail SMTP配置失败？
A: Gmail需要：
1. 开启"允许不够安全的应用"
2. 或使用"应用专用密码"
3. 确保开启了IMAP/SMTP访问

## 安全建议

1. **定期更换密码**：定期更换数据库和邮件服务密码
2. **使用强密码**：密码应包含大小写字母、数字和特殊字符
3. **限制访问**：只允许必要的IP访问数据库
4. **备份配置**：定期备份所有配置信息
5. **监控日志**：定期检查系统日志，发现异常及时处理
6. **SSL/TLS**：始终使用加密连接
