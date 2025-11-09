# 推荐奖励页面修复

## 问题描述
用户中心-推荐奖励页面数据显示异常，同时不需要显示佣金记录。

## 问题原因
1. 页面从 `userApi.getProfile()` 获取数据，但缺少推荐相关的字段
2. 使用了错误的API方法（getReferrals应该是getReferralStats）
3. 页面底部显示了"佣金记录"，但这部分应该在佣金管理页面显示

## 修复内容

### 1. 修正API调用
**修改前**
```typescript
const response = await userApi.getProfile();
// 从profile中获取不存在的字段
```

**修改后**
```typescript
const [profileResponse, referralStatsResponse] = await Promise.all([
  userApi.getProfile(),
  userApi.getReferralStats()
]);
// 从正确的API获取推荐统计数据
```

### 2. 移除佣金记录部分
- ✅ 移除了"佣金记录"卡片
- ✅ 移除了commissionHistory相关代码
- ✅ 将布局从两列改为单列，只显示"推荐用户列表"

### 3. 优化统计卡片
**修改前**
- 推荐用户
- 总佣金
- 待结算（数据不准确）
- 佣金比例

**修改后**
- 推荐用户
- 当前佣金（显示用户的实际佣金余额）
- 佣金比例

### 4. 改进推荐用户列表
**修改前**
- 卡片式布局
- 显示简单信息

**修改后**
- 表格式布局
- 显示详细信息：
  - 用户名
  - 注册时间
  - 状态
  - 累计消费
  - 我的佣金

### 5. 代码清理
- ✅ 移除未使用的导入（TrendingUp, getUser）
- ✅ 移除未使用的函数（copyReferralCode）
- ✅ 修复toast.info为toast（兼容性）
- ✅ 移除pendingCommission相关代码

## 修复后的页面结构

### 统计卡片（3个）
1. **推荐用户** - 显示推荐的用户总数
2. **当前佣金** - 显示用户当前可用的佣金余额
3. **佣金比例** - 显示15%的佣金比例

### 推荐工具
- 专属推荐链接
- 复制链接按钮
- 社交分享按钮（微信、QQ、微博）

### 推荐用户列表（表格）
- 用户名
- 注册时间
- 状态（已激活）
- 累计消费
- 我的佣金

### 推荐奖励规则
- 分享推荐
- 好友注册
- 获得奖励

## 数据来源

### userApi.getProfile()
- referralCode - 推荐码
- commission - 当前佣金余额

### userApi.getReferralStats()
- totalReferrals - 推荐用户总数
- referrals - 推荐用户列表
  - username - 用户名
  - createdAt - 注册时间
  - totalSpent - 累计消费
  - commissionEarned - 产生的佣金

## 文件修改
- ✅ `src/pages/Dashboard/Referral.tsx`
  - 修正API调用
  - 移除佣金记录部分
  - 优化统计卡片
  - 改进推荐用户列表
  - 代码清理

## 总结
推荐奖励页面现在只显示推荐相关的信息，不再显示佣金记录。佣金记录已经在佣金管理页面（Commission.tsx）中显示。页面数据来源更加准确，使用了正确的API方法。
