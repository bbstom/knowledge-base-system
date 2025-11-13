# 通知功能快速启动指南

## 🚀 立即开始

### 1️⃣ 重启服务器
```bash
# 如果服务器正在运行，先停止
# 然后重新启动
npm start
# 或
node server/index.js
```

### 2️⃣ 创建测试通知

1. 打开浏览器访问管理后台
2. 登录管理员账号
3. 进入 **通知管理** 页面
4. 点击 **创建通知** 按钮
5. 填写以下信息：

```
标题: 欢迎使用本系统
内容: 这是一条测试通知，用于验证通知弹窗功能是否正常工作。
类型: 纯文本
目标用户: 所有用户
优先级: 一般
状态: 生效中 ⚠️ 重要！必须选择"生效中"
开始日期: [今天的日期]
结束日期: [留空]
```

6. 点击 **保存**

### 3️⃣ 测试通知弹窗

1. 退出管理员账号
2. 使用普通用户账号登录
3. ✅ 应该立即看到通知弹窗！

### 4️⃣ 如果没有弹出

打开浏览器开发者工具（按 F12），在控制台运行：

```javascript
// 1. 清除"今日不再显示"设置
localStorage.removeItem('notification_hidden_date');

// 2. 测试API
fetch('/api/notifications/active', {
  headers: {
    'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('API响应:', data);
  if (data.success && data.data.length > 0) {
    console.log('✅ API正常，找到', data.data.length, '条通知');
  } else {
    console.log('❌ 没有找到通知');
  }
});

// 3. 刷新页面
location.reload();
```

## 📋 检查清单

如果通知仍然不弹出，请检查：

- [ ] 服务器已重启
- [ ] 通知状态是 "生效中"（不是 "草稿"）
- [ ] 开始日期 <= 今天
- [ ] 目标用户选择了 "所有用户"
- [ ] 用户已登录
- [ ] 浏览器控制台没有错误

## 🔍 查看日志

在浏览器控制台应该看到：
```
NotificationModal: 开始加载通知...
NotificationModal: API响应 = {success: true, data: Array(1)}
NotificationModal: 获取到 1 条通知
```

## 📚 更多信息

- 详细调试指南: `NOTIFICATION_DEBUG_GUIDE.md`
- 修复总结: `NOTIFICATION_FIX_SUMMARY.md`
- 测试脚本: `test-notification.js`

## ⚡ 常见问题快速解决

### 问题: "今日不再显示"后看不到通知
```javascript
localStorage.removeItem('notification_hidden_date');
location.reload();
```

### 问题: 想测试VIP用户通知
1. 创建通知，目标用户选择 "VIP用户"
2. 确保测试账号是VIP用户
3. 登录测试

### 问题: 想测试多条通知
1. 创建3条通知，都设置为 "生效中"
2. 登录用户
3. 应该依次显示，可以点击 "下一条" 或 "跳过全部"

## 🎯 成功标志

当你看到这个弹窗时，说明功能正常：

```
┌─────────────────────────────────────┐
│  📢 重要通知                         │
├─────────────────────────────────────┤
│  [一般]                      1 / 1  │
│                                     │
│  欢迎使用本系统                      │
│                                     │
│  这是一条测试通知，用于验证通知      │
│  弹窗功能是否正常工作。              │
│                                     │
│  ☐ 今日不再显示                     │
│                                     │
│              [我知道了 ✓]           │
└─────────────────────────────────────┘
```

## 💡 提示

- 通知会在用户登录时自动弹出
- 每个用户只会看到未读的通知
- 勾选 "今日不再显示" 后，当天不会再弹出
- 管理员可以创建不同优先级的通知（低、一般、中、重要、紧急）
- 可以针对不同用户群体发送通知（所有用户、VIP用户、普通用户等）
