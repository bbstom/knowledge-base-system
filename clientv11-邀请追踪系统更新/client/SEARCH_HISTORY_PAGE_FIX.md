# 搜索历史页面字段映射修复

## 问题描述

用户中心的"搜索历史"页面（`/dashboard/search-history`）中：
- 搜索类型不显示
- 查询内容显示为 "N/A"
- 其他字段可能显示不正确

## 根本原因

`SearchHistory.tsx` 页面使用的字段名与API返回的字段名不匹配：

| 页面使用 | API返回 | 说明 |
|---------|---------|------|
| `searchType` | `type` | 搜索类型 |
| `searchQuery` | `query` | 查询内容 |
| `resultsCount` | `resultCount` | 结果数量 |
| `pointsCharged` | `pointsCost` | 消耗积分 |

## 修复方案

### 文件：`src/pages/Dashboard/SearchHistory.tsx`

**修复1：搜索类型和查询内容**
```typescript
// 修复前
{getSearchTypeText(record.searchType)}
{record.searchQuery || 'N/A'}

// 修复后（兼容两种字段名）
{getSearchTypeText(record.type || record.searchType)}
{record.query || record.searchQuery || 'N/A'}
```

**修复2：结果数量**
```typescript
// 修复前
{record.resultsCount > 0 ? `找到${record.resultsCount}条` : '无结果'}

// 修复后
{(record.resultCount || record.resultsCount || 0) > 0 
  ? `找到${record.resultCount || record.resultsCount}条` 
  : '无结果'}
```

**修复3：消耗积分**
```typescript
// 修复前
{record.pointsCharged > 0 ? `-${record.pointsCharged}` : '免费'}

// 修复后
{(record.pointsCost || record.pointsCharged || 0) > 0 
  ? `-${record.pointsCost || record.pointsCharged}` 
  : '免费'}
```

**修复4：统计数据**
```typescript
// 有结果次数
filteredHistory.filter((r: any) => (r.resultCount || r.resultsCount || 0) > 0).length

// 无结果次数
filteredHistory.filter((r: any) => (r.resultCount || r.resultsCount || 0) === 0).length

// 消耗积分
filteredHistory.reduce((sum: number, r: any) => sum + (r.pointsCost || r.pointsCharged || 0), 0)
```

## 兼容性

修复后的代码同时支持两种字段名格式：
- ✅ 新格式：`type`, `query`, `resultCount`, `pointsCost`
- ✅ 旧格式：`searchType`, `searchQuery`, `resultsCount`, `pointsCharged`

这确保了向后兼容性，即使数据库中有旧格式的数据也能正常显示。

## 显示效果

### 修复后

**搜索历史表格**:
| 时间 | 搜索类型 | 查询内容 | 数据库 | 结果 | 积分 | 耗时 |
|------|---------|---------|--------|------|------|------|
| 2025/10/22 17:06:29 | 身份证 | 36112320030507131X | 14 个数据库 | 找到1条 | -10 | 25143ms |
| 2025/10/22 16:12:57 | 手机号 | 18611076559 | 14 个数据库 | 无结果 | 免费 | 37520ms |

**统计卡片**:
- 总搜索次数: 2
- 有结果次数: 1
- 无结果次数: 1
- 消耗积分: 10

## 测试步骤

1. 刷新浏览器页面（Ctrl+F5）
2. 进入"用户中心" → "搜索历史"
3. 确认搜索类型显示为中文（如"身份证"、"手机号"）
4. 确认查询内容正确显示
5. 确认结果数量和积分正确显示
6. 确认统计数据正确

## 相关页面

- ✅ `src/pages/Dashboard/SearchHistory.tsx` - 搜索历史页面（已修复）
- ✅ `src/pages/Dashboard/Orders.tsx` - 订单中心消费记录（已修复）

## 完成时间

2025-10-22

## 状态

✅ 已完成
