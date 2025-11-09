# 余额兑换积分页面数据显示修复

## 问题描述

"商城 - 余额兑换积分"页面中，当前余额和当前积分显示不正确，都显示为0或undefined。

## 问题原因

API数据结构不匹配：

1. **后端API返回**: `{ success: true, user: {...} }`
2. **realApi.ts处理**: 返回 `{ success: true, data: data.data.user }`
3. **前端页面期望**: `profileRes.user`

导致数据路径错误，无法正确获取用户信息。

## 修复内容

### 1. 修复 realApi.ts 中的 getProfile 方法

**文件**: `src/utils/realApi.ts`

**修改前**:
```typescript
async getProfile() {
  const data = await request('/user/profile');
  return {
    success: true,
    data: data.data.user,  // ❌ 错误：多了一层data
  };
}
```

**修改后**:
```typescript
async getProfile() {
  const data = await request('/user/profile');
  return {
    success: true,
    user: data.user,  // ✅ 正确：直接使用data.user
  };
}
```

### 2. 修复 realApi.ts 中的 updateProfile 方法

**文件**: `src/utils/realApi.ts`

**修改前**:
```typescript
async updateProfile(profileData: { username?: string; email?: string }) {
  const data = await request('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  Object.assign(user, data.data.user);  // ❌ 错误
  localStorage.setItem('user', JSON.stringify(user));
  
  return {
    success: true,
    data: data.data.user,  // ❌ 错误
  };
}
```

**修改后**:
```typescript
async updateProfile(profileData: { username?: string; email?: string }) {
  const data = await request('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  Object.assign(user, data.user);  // ✅ 正确
  localStorage.setItem('user', JSON.stringify(user));
  
  return {
    success: true,
    user: data.user,  // ✅ 正确
  };
}
```

### 3. 前端页面已修复

**文件**: `src/pages/Shop/ExchangePoints.tsx`

已在之前修复为使用 `profileRes.user`。

## 数据流程

```
后端API (/api/user/profile)
  ↓
返回: { success: true, user: { balance: 120, points: 660, ... } }
  ↓
realApi.ts (getProfile)
  ↓
返回: { success: true, user: { balance: 120, points: 660, ... } }
  ↓
ExchangePoints.tsx
  ↓
使用: profileRes.user.balance, profileRes.user.points
  ↓
显示: 当前余额: ¥120.00, 当前积分: 660
```

## 影响范围

此修复影响所有使用 `userApi.getProfile()` 和 `userApi.updateProfile()` 的页面：

- ✅ 余额兑换积分页面
- ✅ 个人资料页面
- ✅ 用户中心页面
- ✅ 其他使用用户信息的页面

## 测试验证

1. 登录用户账号
2. 进入"商城 - 余额兑换积分"页面
3. 检查"当前余额"是否显示正确的余额数值
4. 检查"当前积分"是否显示正确的积分数值
5. 尝试兑换积分，确认功能正常

## 预期结果

假设用户有：
- 余额：120
- 积分：660

页面应显示：
- 当前余额：¥120.00
- 当前积分：660

## 修复状态

✅ 已修复并验证
- realApi.ts 的 getProfile 方法已修复
- realApi.ts 的 updateProfile 方法已修复
- ExchangePoints.tsx 页面已修复
