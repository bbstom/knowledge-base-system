# 用户状态管理系统 - 需求文档

## 简介

实现全局用户状态管理，解决搜索扣除积分后前端显示不更新的问题。

## 术语表

- **UserContext**: React Context，用于全局用户状态管理
- **积分 (Points)**: 用户用于搜索的虚拟货币
- **余额 (Balance)**: 用户的账户余额
- **VIP状态**: 用户的会员状态和到期时间

## 需求

### 需求1: 创建用户Context

**用户故事**: 作为开发者，我需要一个全局的用户状态管理系统，以便在整个应用中共享和更新用户信息。

#### 验收标准

1. THE System SHALL 创建 UserContext 提供用户状态
2. THE System SHALL 提供 UserProvider 组件包裹应用
3. THE System SHALL 提供 useUser hook 访问用户状态
4. THE System SHALL 存储用户的积分、余额、VIP状态等信息

### 需求2: 实现用户信息加载

**用户故事**: 作为用户，当我登录后，系统应该自动加载我的最新信息。

#### 验收标准

1. WHEN 用户登录成功, THE System SHALL 自动加载用户信息
2. THE System SHALL 从API获取最新的用户数据
3. THE System SHALL 更新Context中的用户状态
4. THE System SHALL 处理加载失败的情况

### 需求3: 搜索后更新积分

**用户故事**: 作为用户，当我完成搜索后，系统应该立即更新显示的积分余额。

#### 验收标准

1. WHEN 搜索成功, THE System SHALL 从响应中获取剩余积分
2. THE System SHALL 更新Context中的积分数据
3. THE System SHALL 在Header中实时显示更新后的积分
4. THE System SHALL 在Dashboard中实时显示更新后的积分

### 需求4: 充值后更新余额

**用户故事**: 作为用户，当我完成充值后，系统应该立即更新显示的余额和积分。

#### 验收标准

1. WHEN 充值成功, THE System SHALL 刷新用户信息
2. THE System SHALL 更新余额、积分或VIP状态
3. THE System SHALL 在所有相关页面实时显示更新

### 需求5: 手动刷新功能

**用户故事**: 作为用户，我希望能手动刷新我的账户信息。

#### 验收标准

1. THE System SHALL 提供 refreshUser 方法
2. THE System SHALL 允许任何组件调用刷新方法
3. THE System SHALL 在刷新时显示加载状态

## 非功能需求

- 性能: Context更新不应导致不必要的组件重渲染
- 可维护性: 代码结构清晰，易于扩展
- 用户体验: 状态更新应该流畅，无闪烁
