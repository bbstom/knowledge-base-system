# credentials: 'include' 配置指南

## ✅ 已修改的文件

我已经为你修改了以下核心文件：

### 1. src/utils/api.ts（Axios配置）

```typescript
// 创建 axios 实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true, // ✅ 已添加
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 2. src/utils/realApi.ts（Fetch配置）

```typescript
const request = async (url: string, options: RequestInit = {}) => {
  const config: RequestInit = {
    credentials: 'include', // ✅ 已添加
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  
  const response = await fetch(`${API_BASE_URL}${url}`, config);
  // ...
};
```

### 3. src/utils/adminApi.ts（管理员API）

```typescript
const apiRequest = async (url: string, options: RequestInit = {}) => {
  const config: RequestInit = {
    credentials: 'include', // ✅ 已添加
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  };
  
  const response = await fetch(url, config);
  return response.json();
};
```

## ⚠️ 其他需要手动添加的文件

以下文件中的 fetch 调用也需要添加 `credentials: 'include'`：

### 页面组件中的 fetch

这些文件中有直接的 fetch 调用，建议统一修改：

1. **src/pages/Dashboard/Tickets.tsx**
2. **src/pages/Dashboard/RechargeCenter.tsx**
3. **src/pages/Dashboard/RechargeByCard.tsx**
4. **src/pages/Dashboard/Recharge.tsx**
5. **src/pages/Dashboard/Orders.tsx**
6. **src/pages/Dashboard/Dashboard.tsx**
7. **src/pages/Dashboard/Commission.tsx**
8. **src/pages/Admin/SiteConfig.tsx**
9. **src/pages/Admin/UserManagement.tsx**
10. **src/pages/Admin/TicketManagement.tsx**
11. **src/pages/Admin/RechargeConfig.tsx**
12. **src/pages/Admin/RechargeCardManagement.tsx**

### 修改示例

**之前**：
```typescript
const response = await fetch('/api/some-endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(data)
});
```

**之后**：
```typescript
const response = await fetch('/api/some-endpoint', {
  credentials: 'include', // ✅ 添加这一行
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(data)
});
```

## 🔧 批量修改方案

### 方案1：创建统一的 fetch 封装

创建 `src/utils/fetchWithCredentials.ts`：

```typescript
// 统一的 fetch 封装
export const fetchWithCredentials = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  return fetch(url, {
    credentials: 'include', // 默认包含
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};

// 使用示例
import { fetchWithCredentials } from '@/utils/fetchWithCredentials';

const response = await fetchWithCredentials('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

### 方案2：使用全局 fetch 拦截（不推荐）

```typescript
// 在 main.tsx 或 App.tsx 中
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const [url, options = {}] = args;
  return originalFetch(url, {
    ...options,
    credentials: 'include',
  });
};
```

## 📋 检查清单

### 核心文件（已完成）
- [x] src/utils/api.ts（Axios）
- [x] src/utils/realApi.ts（Fetch）
- [x] src/utils/adminApi.ts（Admin API）

### 需要检查的文件
- [ ] src/pages/Dashboard/*.tsx
- [ ] src/pages/Admin/*.tsx
- [ ] src/utils/referralTracking.ts
- [ ] src/utils/bepusdt.ts

### 验证步骤
1. [ ] 构建项目无错误
2. [ ] 登录功能正常
3. [ ] Cookie正常发送
4. [ ] API请求成功

## 🎯 推荐做法

### 最佳实践：统一使用 api.ts

建议所有API请求都通过 `src/utils/api.ts` 或 `src/utils/realApi.ts` 进行，而不是直接使用 fetch。

**不推荐**：
```typescript
// 在组件中直接使用 fetch
const response = await fetch('/api/endpoint');
```

**推荐**：
```typescript
// 使用封装好的 API
import { api } from '@/utils/api';
const response = await api.get('/endpoint');
```

这样只需要在一个地方配置 `credentials: 'include'`，所有请求都会自动包含。

## 🔍 如何验证配置是否生效

### 1. 浏览器开发者工具

打开 Network 标签，查看请求：

```
Request Headers:
  Cookie: token=xxx  ✅ 应该包含Cookie
  
Response Headers:
  Access-Control-Allow-Credentials: true  ✅ 应该为true
```

### 2. 测试登录

```typescript
// 登录后检查
console.log(document.cookie); // 应该包含 token
```

### 3. 测试API请求

```typescript
// 在浏览器控制台测试
fetch('/api/user/profile', {
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log(data));
```

## 📝 总结

### 已完成
✅ 核心API文件已添加 `credentials: 'include'`
- api.ts（Axios: `withCredentials: true`）
- realApi.ts（Fetch: `credentials: 'include'`）
- adminApi.ts（Fetch: `credentials: 'include'`）

### 建议
1. 统一使用 api.ts 或 realApi.ts 进行API调用
2. 避免在组件中直接使用 fetch
3. 如果必须使用 fetch，记得添加 `credentials: 'include'`

### 下一步
1. 重新构建项目：`npm run build`
2. 测试登录和API请求
3. 检查浏览器控制台是否有CORS错误

配置完成后，Cookie将在所有API请求中自动发送！
