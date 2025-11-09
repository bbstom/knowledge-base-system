# 修复充值UserID错误

## 问题描述

充值时报错：
```
Cast to ObjectId failed for value "temp-user-id" (type string) at path "userId"
```

## 问题原因

1. **前端硬编码临时ID**：前端发送的userId是`"temp-user-id"`，不是有效的MongoDB ObjectId
2. **缺少认证**：后端充值路由没有使用认证中间件，无法获取真实用户ID
3. **数据验证失败**：MongoDB无法将字符串"temp-user-id"转换为ObjectId

## 修复方案

### 1. 后端添加认证中间件

**server/routes/recharge.js**

修改前：
```javascript
router.post('/create', async (req, res) => {
  const { userId, type, amount, currency, points, vipDays, vipPackageName } = req.body;
  // userId从请求体获取
});
```

修改后：
```javascript
const authMiddleware = require('../middleware/auth');

router.post('/create', authMiddleware, async (req, res) => {
  const { type, amount, currency, points, vipDays, vipPackageName } = req.body;
  // 从认证中间件获取用户ID
  const userId = req.user._id;
});
```

### 2. 前端移除userId并添加认证头

**src/pages/Dashboard/Recharge.tsx**

修改前：
```typescript
const response = await fetch('/api/recharge/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 'temp-user-id', // ❌ 硬编码的临时ID
    type: 'points',
    amount: amountNum,
    currency: currency,
    points: amountNum * 10,
  })
});
```

修改后：
```typescript
// 获取token
const token = document.cookie.split('token=')[1]?.split(';')[0];

const response = await fetch('/api/recharge/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // ✅ 添加认证头
  },
  body: JSON.stringify({
    // ✅ 移除userId，由后端从token中获取
    type: 'points',
    amount: amountNum,
    currency: currency,
    points: amountNum * 10,
  })
});
```

## 工作流程

### 修复前
```
前端 → 发送 userId: "temp-user-id"
       ↓
后端 → 尝试创建订单
       ↓
MongoDB → ❌ 无法转换为ObjectId
```

### 修复后
```
前端 → 发送 Authorization: Bearer <token>
       ↓
后端 → authMiddleware验证token
       ↓
后端 → 从token中提取真实用户ID
       ↓
后端 → 创建订单
       ↓
MongoDB → ✅ 成功保存
```

## 认证中间件工作原理

```javascript
// server/middleware/auth.js
const authMiddleware = async (req, res, next) => {
  try {
    // 从请求头获取token
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查询用户
    const user = await User.findById(decoded.userId);
    
    // 将用户信息附加到请求对象
    req.user = user;
    
    next();
  } catch (error) {
    res.status(401).json({ message: '未授权' });
  }
};
```

## 安全优势

1. **真实用户ID**：从JWT token中获取，无法伪造
2. **用户验证**：确保用户已登录且token有效
3. **防止越权**：用户只能为自己创建订单
4. **统一认证**：所有需要认证的接口都使用相同的中间件

## 测试验证

### 1. 确保已登录
```bash
# 检查浏览器Cookie中是否有token
document.cookie
# 应该看到: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. 尝试充值
- 打开充值页面
- 输入金额
- 选择币种
- 点击充值

### 3. 检查服务器日志
```bash
📝 创建充值订单 - 用户ID: 507f1f77bcf86cd799439011
🔑 订单ID: ORDER1234567890123
⚠️  BEpusdt运行在测试模式
🧪 测试模式：返回模拟订单
✅ BEpusdt订单创建成功
```

### 4. 验证订单
- 应该能成功创建订单
- 订单中的userId是真实的ObjectId
- 可以在数据库中查看订单记录

## 其他需要认证的路由

确保以下路由也使用了认证中间件：

```javascript
// ✅ 已添加认证
router.post('/create', authMiddleware, ...);

// 🔍 需要检查
router.get('/query/:orderId', authMiddleware, ...);
router.get('/history/:userId', authMiddleware, ...);
```

## 常见问题

### Q1: 提示"未授权"
**原因**：token无效或已过期
**解决**：重新登录获取新token

### Q2: 仍然报ObjectId错误
**原因**：可能使用了旧的前端代码
**解决**：清除浏览器缓存，刷新页面

### Q3: token在哪里？
**位置**：浏览器Cookie中
**查看**：F12 → Application → Cookies → token

## 总结

✅ 后端添加认证中间件
✅ 前端移除硬编码的userId
✅ 前端添加Authorization头
✅ 从token中获取真实用户ID
✅ 提高了安全性
✅ 防止了越权操作

现在充值功能应该可以正常工作了！
