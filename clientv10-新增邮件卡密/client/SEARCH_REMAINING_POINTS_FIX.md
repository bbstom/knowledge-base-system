# 搜索页面剩余积分显示修复

## 问题描述

搜索结果页面显示"剩余积分"时，实际显示的是余额（balance）数据，而不是积分（points）数据。

## 问题原因

前端代码使用了错误的字段名：
```jsx
// 错误：显示余额
剩余积分: {result.remainingBalance}
```

## 修复内容

**文件**: `src/pages/Search.tsx` (第267行)

**修改前**:
```jsx
剩余积分: <span className="font-semibold">{result.remainingBalance}</span>
```

**修改后**:
```jsx
剩余积分: <span className="font-semibold">{result.remainingPoints}</span>
```

## 后端API确认

后端API (`server/routes/search.js`) 已经正确返回了两个字段：
```javascript
{
  remainingBalance: user.balance,  // 剩余余额
  remainingPoints: user.points,    // 剩余积分
}
```

## 测试验证

1. 登录用户账号
2. 进行搜索操作
3. 查看搜索结果中的"剩余积分"
4. 确认显示的是积分数量，而不是余额

## 示例

假设用户有：
- 积分：660
- 余额：120

搜索消耗10积分后：
- ✅ 正确显示：剩余积分: 650
- ❌ 之前错误：剩余积分: 120（显示的是余额）

## 相关字段说明

- `points`: 用户积分，用于搜索消费
- `balance`: 用户余额，用于充值和提现
- `cost`: 本次搜索消耗的积分
- `remainingPoints`: 搜索后剩余的积分
- `remainingBalance`: 搜索后剩余的余额

## 修复状态

✅ 已修复并验证
