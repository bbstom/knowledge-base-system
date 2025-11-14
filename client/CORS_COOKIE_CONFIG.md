# CORS和Cookie配置说明

## ❌ 错误配置

```env
CORS_ORIGIN=https://www.13140.sbs
COOKIE_DOMAIN=.www.13140.sbs  # ❌ 错误！
```

## ✅ 正确配置

```env
CORS_ORIGIN=https://www.13140.sbs
COOKIE_DOMAIN=.13140.sbs  # ✅ 正确！去掉www
```

## 📝 详细说明

### CORS_ORIGIN（允许的前端域名）

**正确**：
```env
# 如果前端域名是 www.13140.sbs
CORS_ORIGIN=https://www.13140.sbs

# 如果前端域名是 13140.sbs（不带www）
CORS_ORIGIN=https://13140.sbs

# 如果两个都要支持
CORS_ORIGIN=https://www.13140.sbs,https://13140.sbs
```

### COOKIE_DOMAIN（Cookie的域名）

**规则**：
- 以点(.)开头
- 只包含主域名，不包含子域名
- 这样可以让所有子域名共享Cookie

**正确示例**：
```env
# 域名: www.13140.sbs
COOKIE_DOMAIN=.13140.sbs  # ✅ 正确

# 域名: api.13140.sbs
COOKIE_DOMAIN=.13140.sbs  # ✅ 正确

# 域名: admin.13140.sbs
COOKIE_DOMAIN=.13140.sbs  # ✅ 正确
```

**错误示例**：
```env
COOKIE_DOMAIN=.www.13140.sbs  # ❌ 错误！不要包含www
COOKIE_DOMAIN=www.13140.sbs   # ❌ 错误！缺少点
COOKIE_DOMAIN=13140.sbs       # ⚠️ 可以但不推荐（不能跨子域名）
```

## 🎯 你的正确配置

### 场景1：前端在 www.13140.sbs，后端在 api.13140.sbs

```env
# 后端 .env
CORS_ORIGIN=https://www.13140.sbs
COOKIE_DOMAIN=.13140.sbs
```

### 场景2：前端在 www.13140.sbs，后端在另一台服务器

```env
# 后端 .env
CORS_ORIGIN=https://www.13140.sbs
COOKIE_DOMAIN=.13140.sbs
```

### 场景3：支持多个域名（带www和不带www）

```env
# 后端 .env
CORS_ORIGIN=https://www.13140.sbs,https://13140.sbs
COOKIE_DOMAIN=.13140.sbs
```

## 🔧 完整的后端配置

### .env 文件

```env
# 服务器配置
PORT=3001
NODE_ENV=production

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/knowledge-base
MONGODB_QUERY_URI=mongodb://localhost:27017/query-database

# JWT密钥
JWT_SECRET=your-super-secret-key-change-this

# CORS配置
CORS_ORIGIN=https://www.13140.sbs
COOKIE_DOMAIN=.13140.sbs

# 邮件配置（如果需要）
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
```

### server/index.js 配置

```javascript
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// CORS配置
const allowedOrigins = process.env.CORS_ORIGIN.split(',');
const corsOptions = {
  origin: function (origin, callback) {
    // 允许没有origin的请求（如移动应用、Postman等）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // 允许发送Cookie
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// 设置Cookie的中间件示例
app.post('/api/auth/login', async (req, res) => {
  // ... 登录逻辑
  
  // 设置Cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // 生产环境使用HTTPS
    sameSite: 'none', // 跨域必须设置为none
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
    domain: process.env.COOKIE_DOMAIN || '.13140.sbs'
  });
  
  res.json({ success: true });
});
```

## 🌐 前端配置

### .env.production

```env
VITE_API_URL=https://api.13140.sbs
```

### API请求配置

```typescript
// src/utils/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = {
  get: async (url: string) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      credentials: 'include', // 重要！发送Cookie
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
  
  post: async (url: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      credentials: 'include', // 重要！发送Cookie
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
```

## 🔍 验证配置

### 1. 检查CORS

```bash
# 测试CORS预检请求
curl -H "Origin: https://www.13140.sbs" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.13140.sbs/api/auth/login

# 应该返回：
# Access-Control-Allow-Origin: https://www.13140.sbs
# Access-Control-Allow-Credentials: true
```

### 2. 检查Cookie

在浏览器开发者工具中：
1. 打开 Application → Cookies
2. 登录后检查Cookie
3. 确认：
   - Domain: `.13140.sbs` ✅
   - Secure: true ✅
   - SameSite: None ✅
   - HttpOnly: true ✅

### 3. 检查API请求

在浏览器开发者工具 Network 标签中：
1. 查看请求头
2. 确认包含 `Cookie: token=...`
3. 确认响应头包含 `Access-Control-Allow-Credentials: true`

## ⚠️ 常见错误

### 错误1：Cookie不发送

**原因**：
- `COOKIE_DOMAIN` 配置错误
- 前端请求缺少 `credentials: 'include'`
- `sameSite` 设置错误

**解决**：
```env
COOKIE_DOMAIN=.13140.sbs  # 确保正确
```

```javascript
// 后端
res.cookie('token', token, {
  sameSite: 'none',
  secure: true
});

// 前端
fetch(url, {
  credentials: 'include'
});
```

### 错误2：CORS错误

**原因**：
- `CORS_ORIGIN` 配置错误
- 缺少 `credentials: true`

**解决**：
```env
CORS_ORIGIN=https://www.13140.sbs  # 确保与前端域名完全一致
```

```javascript
app.use(cors({
  origin: 'https://www.13140.sbs',
  credentials: true
}));
```

### 错误3：Cookie Domain错误

**错误配置**：
```env
COOKIE_DOMAIN=.www.13140.sbs  # ❌ 包含www
COOKIE_DOMAIN=www.13140.sbs   # ❌ 缺少点
```

**正确配置**：
```env
COOKIE_DOMAIN=.13140.sbs  # ✅ 只包含主域名，带点
```

## 📊 配置对照表

| 配置项 | 错误示例 | 正确示例 |
|--------|---------|---------|
| CORS_ORIGIN | http://www.13140.sbs | https://www.13140.sbs |
| COOKIE_DOMAIN | .www.13140.sbs | .13140.sbs |
| COOKIE_DOMAIN | www.13140.sbs | .13140.sbs |
| sameSite | lax | none |
| secure | false | true |
| credentials | 缺少 | include |

## 🎯 最终配置总结

### 后端 (.env)
```env
CORS_ORIGIN=https://www.13140.sbs
COOKIE_DOMAIN=.13140.sbs
NODE_ENV=production
```

### 前端 (.env.production)
```env
VITE_API_URL=https://api.13140.sbs
```

### 关键点
1. ✅ `COOKIE_DOMAIN` 只包含主域名 `.13140.sbs`
2. ✅ `CORS_ORIGIN` 包含完整的前端URL
3. ✅ 使用HTTPS
4. ✅ `sameSite: 'none'`
5. ✅ `credentials: 'include'`

按照这个配置，Cookie将可以在 `www.13140.sbs` 和 `api.13140.sbs` 之间正常工作！
