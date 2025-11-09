# 消费记录（搜索历史）显示异常修复

## 问题描述

用户订单中心的"消费记录"标签页显示异常，搜索历史数据无法正确显示。

## 问题原因

### 1. 路由定义位置错误
**文件**: `server/routes/user.js`

**问题**: 
- `/api/user/search-history` 等多个路由定义在 `module.exports = router;` 之后
- 导致这些路由没有被导出，前端无法访问

**影响的路由**:
- `/api/user/search-history` - 搜索历史
- `/api/user/commissions` - 佣金记录
- `/api/user/points-history` - 积分历史

### 2. 字段名不匹配
**问题**:
- 数据库模型（SearchLog）使用的字段名与前端期望的字段名不一致

**字段映射**:
| 数据库字段 | 前端期望字段 | 说明 |
|-----------|------------|------|
| `searchType` | `type` | 搜索类型 |
| `searchQuery` | `query` | 查询内容 |
| `pointsCharged` | `pointsCost` | 消耗积分 |
| `resultsCount` | `resultCount` | 结果数量 |

## 修复方案

### 1. 移动路由定义位置

**修改前**:
```javascript
module.exports = router;

// 这些路由定义在导出之后，不会生效
router.get('/search-history', authMiddleware, async (req, res) => {
  // ...
});
```

**修改后**:
```javascript
// 先定义所有路由
router.get('/search-history', authMiddleware, async (req, res) => {
  // ...
});

// 最后导出
module.exports = router;
```

### 2. 添加字段映射

**修改前**:
```javascript
const history = await SearchLog.find({ userId: req.user._id })
  .sort({ createdAt: -1 })
  .limit(parseInt(limit))
  .skip(skip)
  .lean();

res.json({
  success: true,
  data: { history }  // 直接返回数据库字段
});
```

**修改后**:
```javascript
const logs = await SearchLog.find({ userId: req.user._id })
  .sort({ createdAt: -1 })
  .limit(parseInt(limit))
  .skip(skip)
  .lean();

// 映射字段名以匹配前端期望的格式
const history = logs.map(log => ({
  _id: log._id,
  type: log.searchType,           // searchType -> type
  query: log.searchQuery,          // searchQuery -> query
  pointsCost: log.pointsCharged,   // pointsCharged -> pointsCost
  resultCount: log.resultsCount,   // resultsCount -> resultCount
  searchTime: log.searchTime,
  databasesSearched: log.databasesSearched,
  createdAt: log.createdAt
}));

res.json({
  success: true,
  data: { history }  // 返回映射后的数据
});
```

## 测试验证

### 测试脚本
创建了 `server/scripts/testSearchHistory.js` 用于验证数据：

```bash
node server/scripts/testSearchHistory.js
```

### 测试结果
```
✅ 测试搜索历史数据

用户信息:
==================
用户名: kailsay
用户ID: 68f591498698899917dc0f76

搜索历史记录:
==================
总记录数: 2

最近10条记录:

1. idcard 搜索
   查询内容: 36112320030507131X
   消耗积分: 10
   结果数量: 1
   搜索时间: 2025/10/22 17:06:29

2. phone 搜索
   查询内容: 18611076559
   消耗积分: 0
   结果数量: 0
   搜索时间: 2025/10/22 16:12:57
```

## API返回格式

### 搜索历史 API
**端点**: `GET /api/user/search-history`

**参数**:
- `page`: 页码（默认1）
- `limit`: 每页数量（默认50）

**返回格式**:
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "_id": "68f89e95cb0838ac954ad369",
        "type": "idcard",
        "query": "36112320030507131X",
        "pointsCost": 10,
        "resultCount": 1,
        "searchTime": 25143,
        "databasesSearched": 14,
        "createdAt": "2025-10-22T09:06:29.400Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 2,
      "pages": 1
    }
  }
}
```

## 前端显示

### 订单中心页面
**文件**: `src/pages/Dashboard/Orders.tsx`

**消费记录表格显示**:
| 搜索类型 | 查询内容 | 消耗积分 | 结果数 | 时间 |
|---------|---------|---------|--------|------|
| idcard | 36112320030507131X | 10 积分 | 1 条 | 2025/10/22 17:06:29 |
| phone | 18611076559 | 0 积分 | 0 条 | 2025/10/22 16:12:57 |

## 相关文件

### 修改的文件
- `server/routes/user.js` - 修复路由定义位置和字段映射

### 新增的文件
- `server/scripts/testSearchHistory.js` - 测试脚本

### 相关模型
- `server/models/SearchLog.js` - 搜索日志模型

## 注意事项

1. **路由顺序**: 确保所有路由定义在 `module.exports` 之前
2. **字段映射**: 如果修改数据库字段名，需要同步更新映射逻辑
3. **向后兼容**: 保持API返回格式稳定，避免破坏前端现有功能

## 完成时间

2025-10-22

## 状态

✅ 已修复并测试
