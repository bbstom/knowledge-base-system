# ✅ 网站配置数据库保存已修复

## 🎯 问题

网站配置只保存在localStorage中，刷新后配置丢失。

## 🔧 解决方案

现在网站配置会保存到MongoDB数据库中，永久保存。

---

## 📦 完成的工作

### 1. 创建SiteConfig数据库模型 ✅
**文件：** `server/models/SiteConfig.js`

**包含字段：**
- 基本信息（网站名称、描述、Logo等）
- 联系信息（邮箱、电话、地址）
- 社交链接（微信、QQ、微博、Twitter）
- 充值配置（BEpusdt配置、充值套餐）
- VIP配置（VIP套餐）

### 2. 创建后端API ✅
**文件：** `server/routes/siteConfig.js`

**API端点：**
- `GET /api/site-config` - 获取公开配置（无需登录）
- `GET /api/site-config/admin` - 获取完整配置（管理员）
- `PUT /api/site-config` - 更新配置（管理员）
- `POST /api/site-config/reset` - 重置配置（管理员）

### 3. 更新前端页面 ✅
**文件：** `src/pages/Admin/SiteConfig.tsx`

**更新内容：**
- 从API加载配置
- 保存配置到数据库
- localStorage作为缓存

### 4. 注册路由 ✅
**文件：** `server/index.js`

---

## 🚀 现在的工作流程

### 保存配置
```
管理员修改配置 → 点击保存 → 
调用API → 保存到MongoDB → 
同时缓存到localStorage → 
显示成功提示
```

### 加载配置
```
打开配置页面 → 从API加载 → 
显示配置 → 同时缓存到localStorage
```

### 公开访问
```
普通用户访问网站 → 
从API获取公开配置 → 
显示网站名称、Logo等
```

---

## 🧪 测试步骤

### 1. 重启后端服务器
```bash
cd server
npm start
```

### 2. 登录管理后台
- 访问：http://localhost:5173/login
- 邮箱：`admin@example.com`
- 密码：`admin123456`

### 3. 访问网站配置
- 访问：http://localhost:5173/admin/site-config

### 4. 修改配置
- 修改网站名称
- 修改网站描述
- 修改Logo URL
- 等等...

### 5. 保存配置
- 点击"保存配置"按钮
- 应该看到："配置已保存到数据库"

### 6. 验证持久化
- 刷新页面
- 配置应该保持不变
- 重启浏览器
- 配置应该保持不变

---

## 🔍 验证数据库

### 使用MongoDB Shell
```bash
mongosh "mongodb://chroot:Ubuntu123!@172.16.254.15:27017/userdata?authSource=admin"

# 查看配置
db.siteconfigs.find().pretty()
```

**应该看到：**
```javascript
{
  _id: ObjectId("..."),
  siteName: "您设置的网站名称",
  siteDescription: "您设置的描述",
  logoUrl: "您设置的Logo URL",
  // ... 其他配置
  updatedAt: ISODate("..."),
  updatedBy: ObjectId("...")  // 管理员ID
}
```

---

## 📊 API说明

### 1. 获取公开配置
```bash
GET /api/site-config
```

**响应：**
```json
{
  "success": true,
  "data": {
    "siteName": "InfoSearch",
    "siteDescription": "...",
    "logoUrl": "...",
    "footerText": "...",
    "contactEmail": "...",
    "socialLinks": { ... }
  }
}
```

### 2. 获取完整配置（管理员）
```bash
GET /api/site-config/admin
Authorization: Bearer <token>
```

**响应：**
```json
{
  "success": true,
  "data": {
    // 所有配置，包括敏感信息
    "recharge": {
      "bepusdtApiKey": "...",
      // ...
    }
  }
}
```

### 3. 更新配置（管理员）
```bash
PUT /api/site-config
Authorization: Bearer <token>
Content-Type: application/json

{
  "siteName": "新网站名称",
  "siteDescription": "新描述",
  // ... 其他配置
}
```

**响应：**
```json
{
  "success": true,
  "message": "配置已保存",
  "data": { ... }
}
```

---

## 🔐 权限控制

### 公开端点
- `GET /api/site-config` - 任何人都可以访问

### 管理员端点
- `GET /api/site-config/admin` - 需要管理员权限
- `PUT /api/site-config` - 需要管理员权限
- `POST /api/site-config/reset` - 需要管理员权限

### 权限检查
1. 验证JWT token
2. 检查用户是否存在
3. 检查用户role是否为'admin'

---

## 💾 数据持久化

### 双重保存机制

**1. MongoDB（主要存储）**
- 永久保存
- 多设备同步
- 可追溯历史

**2. localStorage（缓存）**
- 快速加载
- 离线访问
- 降低API调用

### 加载优先级
1. 首先从API加载（最新数据）
2. 如果API失败，从localStorage加载（缓存）
3. 如果都失败，使用默认配置

---

## 🎯 特性

### 1. 单例模式
- 数据库中只有一个配置文档
- 自动创建默认配置
- 使用 `SiteConfig.getConfig()` 获取

### 2. 更新追踪
- 记录更新时间
- 记录更新人（管理员ID）
- 便于审计

### 3. 敏感信息保护
- 公开API不返回敏感信息
- BEpusdt密钥只对管理员可见

### 4. 容错机制
- API失败时使用缓存
- 缓存失败时使用默认值
- 不会因为网络问题导致网站无法访问

---

## 📝 修改的文件

1. ✅ `server/models/SiteConfig.js` - 新建数据库模型
2. ✅ `server/routes/siteConfig.js` - 新建API路由
3. ✅ `server/index.js` - 注册路由
4. ✅ `src/pages/Admin/SiteConfig.tsx` - 更新前端逻辑

---

## 🐛 故障排除

### 问题1：保存后刷新配置丢失

**检查：**
1. 后端服务器是否运行
2. 浏览器Console是否有错误
3. Network标签查看API响应

**解决：**
```bash
# 重启后端服务器
cd server
npm start
```

### 问题2：无法加载配置

**检查：**
1. 是否已登录
2. 是否有管理员权限
3. API是否返回错误

**解决：**
```javascript
// 浏览器Console检查
fetch('/api/site-config/admin', {
  headers: {
    'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
  }
}).then(r => r.json()).then(console.log)
```

### 问题3：权限不足

**错误：** "需要管理员权限"

**解决：**
确认用户role为'admin'：
```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log('Role:', user.role);
```

---

## ✅ 验证清单

- [ ] 后端服务器运行正常
- [ ] 可以访问配置页面
- [ ] 可以修改配置
- [ ] 点击保存显示成功
- [ ] 刷新页面配置保持
- [ ] 数据库中有配置记录
- [ ] 重启浏览器配置保持

---

## 🎉 总结

现在网站配置系统已经完善：

1. ✅ 配置保存到MongoDB数据库
2. ✅ 支持管理员权限控制
3. ✅ 公开API供前端使用
4. ✅ localStorage缓存提升性能
5. ✅ 完整的错误处理
6. ✅ 更新追踪和审计

配置不会再丢失了！🎊

---

**修复时间：** 2024-10-19  
**状态：** ✅ 已修复  
**测试：** 请重启后端并测试
