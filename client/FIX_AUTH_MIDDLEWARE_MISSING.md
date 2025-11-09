# 修复认证中间件缺失错误

## 问题描述

服务器启动失败，报错：
```
Error: Cannot find module '../middleware/auth'
```

## 问题原因

在`server/routes/recharge.js`中尝试导入`../middleware/auth`模块，但该文件不存在。

项目中没有独立的`middleware`目录，其他路由文件都是在文件内部定义`authMiddleware`。

## 解决方案

在`server/routes/recharge.js`文件内部定义`authMiddleware`，与其他路由文件保持一致。

### 修改前
```javascript
const authMiddleware = require('../middleware/auth'); // ❌ 文件不存在
```

### 修改后
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 认证中间件
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '认证失败'
    });
  }
};
```

## 认证中间件功能

1. **提取Token**：从Authorization头中提取JWT token
2. **验证Token**：使用JWT_SECRET验证token有效性
3. **查询用户**：根据token中的userId查询用户信息
4. **附加用户**：将用户对象附加到`req.user`
5. **错误处理**：token无效或用户不存在时返回401

## 项目中的认证模式

项目中所有需要认证的路由都采用相同的模式：

```javascript
// 在每个路由文件内部定义authMiddleware
const authMiddleware = async (req, res, next) => { ... };

// 在需要认证的路由上使用
router.post('/create', authMiddleware, async (req, res) => {
  // req.user 包含当前登录用户信息
  const userId = req.user._id;
  ...
});
```

## 使用认证中间件的路由

以下路由文件都使用了相同的认证模式：

- `server/routes/user.js` ✅
- `server/routes/withdraw.js` ✅
- `server/routes/search.js` ✅
- `server/routes/shop.js` ✅
- `server/routes/siteConfig.js` ✅
- `server/routes/systemConfig.js` ✅
- `server/routes/notification.js` ✅
- `server/routes/faq.js` ✅
- `server/routes/database.js` ✅
- `server/routes/topic.js` ✅
- `server/routes/recharge.js` ✅ (已修复)

## 验证修复

### 1. 启动服务器
```bash
cd server
npm start
```

### 2. 检查输出
应该看到：
```
⚠️  BEpusdt运行在测试模式
服务器运行在端口 3001
✅ 已连接到用户数据库
✅ 已连接到查询数据库
```

### 3. 测试充值
- 确保已登录
- 访问充值页面
- 尝试创建订单
- 应该能成功创建

## 未来优化建议

虽然当前方案可行，但可以考虑以下优化：

### 1. 创建独立的middleware目录
```
server/
  middleware/
    auth.js       # 认证中间件
    admin.js      # 管理员中间件
    validate.js   # 验证中间件
```

### 2. 统一导入
```javascript
const { authMiddleware, adminMiddleware } = require('../middleware');
```

### 3. 好处
- 代码复用
- 统一维护
- 减少重复
- 更易测试

## 总结

✅ 修复了模块导入错误
✅ 在文件内部定义authMiddleware
✅ 与其他路由文件保持一致
✅ 服务器可以正常启动
✅ 充值功能可以正常使用

现在服务器应该可以正常启动并处理充值请求了！
