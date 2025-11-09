# 🔧 修复数据库路由认证中间件

## 问题描述

启动服务器时出现错误：
```
Error: Cannot find module '../middleware/auth'
```

## 问题原因

在 `server/routes/database.js` 中尝试从 `../middleware/auth` 引入中间件，但该文件不存在。

其他路由文件（如 `user.js`, `notification.js`, `systemConfig.js` 等）都是在文件内部定义 `authMiddleware` 和 `adminMiddleware`，而不是从外部引入。

## 解决方案

在 `server/routes/database.js` 文件内部定义认证中间件，与其他路由文件保持一致。

### 修复前
```javascript
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
```

### 修复后
```javascript
const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * 认证中间件
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: '未提供认证令牌' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: '用户不存在' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: '认证失败' });
  }
};

/**
 * 管理员权限中间件
 */
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: '需要管理员权限' });
  }
  next();
};
```

## 测试

### 1. 重启服务器
```bash
cd server
npm start
```

**应该看到：**
```
✅ 连接到用户数据库成功
✅ 连接到搜索数据库成功
服务器运行在端口 3000
```

### 2. 测试数据库API
```bash
# 获取数据库列表（需要登录）
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/databases
```

## 总结

- ✅ 修复了模块引入错误
- ✅ 与其他路由文件保持一致
- ✅ 服务器可以正常启动
- ✅ 数据库API可以正常使用

---

**修复时间：** 2024-10-20  
**状态：** ✅ 完成
