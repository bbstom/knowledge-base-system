# 用户状态管理系统 - 设计文档

## 概述

使用React Context API实现全局用户状态管理，解决搜索扣除积分后前端显示不更新的问题。

## 架构

### 组件结构

```
src/
├── contexts/
│   └── UserContext.tsx          # 用户Context定义和Provider
├── hooks/
│   └── useUser.ts               # 自定义hook，简化Context使用
├── App.tsx                      # 用UserProvider包裹应用
└── pages/
    └── Search.tsx               # 搜索页面，搜索后更新积分
```

## 核心组件

### 1. UserContext

**文件**: `src/contexts/UserContext.tsx`

**状态结构**:
```typescript
interface UserState {
  user: {
    id: string;
    username: string;
    email: string;
    points: number;
    balance: number;
    commission: number;
    isVip: boolean;
    vipExpireAt: string | null;
  } | null;
  loading: boolean;
  error: string | null;
}
```

**方法**:
- `loadUser()`: 从API加载用户信息
- `updateUser(data)`: 更新用户信息
- `updatePoints(points)`: 更新积分
- `updateBalance(balance)`: 更新余额
- `refreshUser()`: 刷新用户信息
- `logout()`: 清除用户状态

### 2. useUser Hook

**文件**: `src/hooks/useUser.ts`

简化Context的使用，提供类型安全的访问方式。

## 数据流

### 登录流程
```
用户登录 → 保存token → UserProvider加载用户信息 → 更新Context
```

### 搜索流程
```
用户搜索 → API扣除积分 → 返回剩余积分 → 更新Context → UI自动更新
```

### 充值流程
```
用户充值 → 充值成功 → 调用refreshUser() → 更新Context → UI自动更新
```

## 实现细节

### Context初始化

在App.tsx中用UserProvider包裹整个应用：

```typescript
<UserProvider>
  <BrowserRouter>
    <Routes>
      {/* 路由配置 */}
    </Routes>
  </BrowserRouter>
</UserProvider>
```

### 搜索页面集成

在Search.tsx中，搜索成功后更新积分：

```typescript
const { updatePoints } = useUser();

// 搜索成功后
if (response?.success && response.data.remainingPoints !== undefined) {
  updatePoints(response.data.remainingPoints);
}
```

### Header显示

在Header.tsx中显示实时积分：

```typescript
const { user } = useUser();

// 显示
<span>{user?.points || 0} 积分</span>
```

## 性能优化

1. 使用useMemo缓存Context value，避免不必要的重渲染
2. 只在必要时调用API刷新用户信息
3. 使用局部更新方法（updatePoints）而不是完整刷新

## 错误处理

1. API调用失败时，保持当前状态不变
2. 显示错误提示，但不影响用户继续使用
3. 提供手动刷新选项

## 测试策略

1. 测试Context Provider正确提供状态
2. 测试搜索后积分更新
3. 测试充值后余额更新
4. 测试登出后状态清除
