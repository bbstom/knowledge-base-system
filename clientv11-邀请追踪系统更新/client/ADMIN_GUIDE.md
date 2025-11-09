# 管理后台使用指南

## 访问管理后台

1. 使用管理员账号登录：
   - 邮箱：`admin@infosearch.com`
   - 密码：`admin123`

2. 登录后，点击导航栏的"管理后台"按钮

## 内容管理功能

访问路径：`/admin/content`

### 1. 数据库管理

管理员可以添加、编辑、删除数据库：

**可编辑字段：**
- 数据库名称
- 描述
- 价格
- 记录数量
- 支持的搜索类型（身份证、手机号、姓名、QQ、微博、微信、邮箱）
- 启用/禁用状态

### 2. 常见问题（FAQ）管理

管理FAQ内容：

**可编辑字段：**
- 问题
- 答案
- 分类（账户相关、搜索功能、充值提现、推荐奖励、VIP会员）
- 排序顺序

### 3. 热门话题管理

管理热门话题内容：

**可编辑字段：**
- 标题
- 内容
- 分类（信息安全、法律法规、使用技巧、VIP相关、平台公告）
- 标签（逗号分隔）
- 是否设为热门

### 4. 广告管理

管理平台广告内容：

**可编辑字段：**
- 标题
- 内容（支持HTML格式）
- 显示位置（搜索页面、首页、数据库列表）
- 排序顺序
- 启用/禁用状态

**HTML内容示例：**
```html
<div class="space-y-2">
  <h3 class="text-lg font-semibold text-blue-900">🎉 新用户福利</h3>
  <p class="text-gray-700">注册即送 <span class="font-bold text-blue-600">100积分</span></p>
  <img src="图片URL" alt="描述" class="rounded" />
</div>
```

## 操作说明

### 添加内容
1. 选择对应的标签页（数据库/FAQ/话题/广告）
2. 点击"添加"按钮
3. 填写表单
4. 点击"保存"

### 编辑内容
1. 在列表中找到要编辑的项目
2. 点击编辑图标（铅笔图标）
3. 修改内容
4. 点击"保存"

### 删除内容
1. 在列表中找到要删除的项目
2. 点击删除图标（垃圾桶图标）
3. 确认删除

## 注意事项

1. **数据库管理**：
   - 禁用的数据库不会在前台显示
   - 价格设置会影响用户搜索费用

2. **FAQ管理**：
   - 排序数字越小，显示越靠前
   - 分类要与前台分类保持一致

3. **热门话题**：
   - 设为热门的话题会在"本周热门"区域显示
   - 标签用逗号分隔，如：`信息安全,隐私保护,数据安全`

4. **广告管理**：
   - HTML内容支持Tailwind CSS类名
   - 建议使用预览功能查看效果
   - 可以插入图片、链接等元素
   - 排序数字越小，显示越靠前

## 系统设置功能

访问路径：`/admin/settings`

### 1. 搜索类型管理

自定义系统支持的搜索类型：

**可配置项：**
- 类型ID（英文标识符，如：phone）
- 显示名称（中文名称，如：手机号）
- 排序顺序
- 启用/禁用状态

**操作：**
- 添加新的搜索类型
- 编辑现有搜索类型
- 删除不需要的搜索类型
- 调整显示顺序

### 2. 数据库配置

配置系统数据库连接：

**可配置项：**
- 主机地址
- 端口号
- 用户名
- 密码
- 数据库名称
- 连接池大小
- 超时时间

**功能：**
- 保存配置
- 测试连接

### 3. 邮件配置

#### SMTP服务器配置

**可配置项：**
- SMTP主机（如：smtp.gmail.com）
- SMTP端口（如：587）
- SMTP用户名
- SMTP密码
- 发件人名称
- 发件人邮箱
- SSL/TLS加密选项

**功能：**
- 保存配置
- 发送测试邮件

#### 邮件模板管理

管理系统邮件模板：

**可配置项：**
- 模板ID（如：welcome, reset_password）
- 模板名称
- 邮件主题
- 邮件内容（支持HTML）
- 启用/禁用状态

**常用模板：**
- 欢迎邮件（welcome）
- 密码重置（reset_password）
- 邮箱验证（verify_email）
- 搜索通知（search_notification）
- 提现通知（withdraw_notification）

**HTML模板示例：**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .header { background: #4F46E5; color: white; padding: 20px; }
    .content { padding: 20px; }
    .button { background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="header">
    <h1>欢迎加入 InfoSearch</h1>
  </div>
  <div class="content">
    <p>尊敬的 {{username}}，</p>
    <p>感谢您注册 InfoSearch 平台！</p>
    <a href="{{verify_link}}" class="button">验证邮箱</a>
  </div>
</body>
</html>
```

**支持的变量：**
- `{{username}}` - 用户名
- `{{email}}` - 邮箱地址
- `{{verify_link}}` - 验证链接
- `{{reset_link}}` - 重置密码链接
- `{{amount}}` - 金额
- `{{date}}` - 日期

## 技术说明

当前使用模拟数据（Mock Data），实际部署时需要：
1. 连接真实数据库
2. 实现后端API接口
3. 添加权限验证
4. 实现数据持久化
5. 配置真实的SMTP服务器
6. 实现邮件发送队列
