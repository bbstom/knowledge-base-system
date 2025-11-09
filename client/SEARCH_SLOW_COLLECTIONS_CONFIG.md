# ⚙️ 慢速集合配置指南

## 📊 问题说明

部分集合查询超时的原因：
- 数据量极大（数百万条记录）
- 服务器性能限制
- 网络延迟
- 并发查询压力

即使有索引，这些集合仍可能超时。

## 🎯 解决方案

提供两种配置方式来处理慢速集合：

### 方案 1: 跳过慢速集合（推荐）

**适用场景**: 这些集合经常超时且不是必需的

**配置步骤**:

1. 编辑 `server/.env` 文件，添加：
```env
# 跳过慢速集合
SKIP_SLOW_COLLECTIONS=true
```

2. 编辑 `server/routes/search.js`，取消注释慢速集合：
```javascript
const SLOW_COLLECTIONS = [
  'ZB顺丰快递C',    // 取消注释
  'ZB酒店开房',     // 取消注释
  'ZB微博数据',     // 取消注释
  'ZB公积金',       // 取消注释
  'ZB顺丰快递'      // 取消注释
];
```

3. 重启服务器：
```bash
cd server
npm start
```

**效果**:
- ✅ 搜索速度更快
- ✅ 不会出现超时错误
- ⚠️ 这些集合的数据不会被搜索

### 方案 2: 保持现状（当前）

**适用场景**: 需要搜索所有集合，接受部分超时

**特点**:
- ✅ 搜索所有集合
- ✅ 有容错机制
- ⚠️ 部分集合会超时
- ✅ 不影响其他集合的结果

**无需配置**: 系统默认使用此方案

## 📝 详细配置说明

### 环境变量配置

在 `server/.env` 中：

```env
# 是否跳过慢速集合
# true = 跳过慢速集合，搜索更快
# false = 搜索所有集合（默认）
SKIP_SLOW_COLLECTIONS=false
```

### 慢速集合列表配置

在 `server/routes/search.js` 中：

```javascript
// 慢速集合列表
const SLOW_COLLECTIONS = [
  'ZB顺丰快递C',
  'ZB酒店开房',
  'ZB微博数据',
  'ZB公积金',
  'ZB顺丰快递',
  // 可以添加其他慢速集合
];
```

**如何确定慢速集合**:
1. 查看服务器日志
2. 找到经常超时的集合
3. 添加到 SLOW_COLLECTIONS 列表

## 🔍 性能对比

### 方案 1: 跳过慢速集合

```
搜索集合数: 15 个（减少 5 个）
平均耗时: 8-12 秒
超时次数: 0 次
结果完整性: 85%（缺少 5 个集合）
```

### 方案 2: 搜索所有集合（当前）

```
搜索集合数: 20 个
平均耗时: 16-18 秒
超时次数: 3-5 次
结果完整性: 100%（但部分超时）
```

## 💡 推荐配置

### 生产环境（推荐跳过）

```env
# .env
SKIP_SLOW_COLLECTIONS=true
```

```javascript
// search.js
const SLOW_COLLECTIONS = [
  'ZB顺丰快递C',
  'ZB酒店开房',
  'ZB微博数据',
  'ZB公积金',
  'ZB顺丰快递'
];
```

**理由**:
- 用户体验更好（更快）
- 减少服务器压力
- 大部分数据仍可搜索

### 测试环境（保持现状）

```env
# .env
SKIP_SLOW_COLLECTIONS=false
```

**理由**:
- 测试所有集合
- 发现性能问题
- 评估数据完整性

## 🎯 其他优化建议

### 1. 限制搜索集合数量

只搜索最相关的集合：

```javascript
// 限制最多搜索 10 个集合
const sortedCollections = [...priorityCollections, ...normalCollections].slice(0, 10);
```

### 2. 增加超时时间

如果网络较慢，可以增加超时：

```javascript
// 在 search.js 中
const QUERY_TIMEOUT = 20000; // 20 秒
```

### 3. 实现缓存

缓存热门搜索结果：

```bash
npm install node-cache
```

```javascript
const NodeCache = require('node-cache');
const searchCache = new NodeCache({ stdTTL: 300 }); // 5 分钟

// 搜索前检查缓存
const cacheKey = `${type}-${query}`;
const cached = searchCache.get(cacheKey);
if (cached) return cached;

// 搜索后保存缓存
searchCache.set(cacheKey, results);
```

### 4. 分批查询

不要同时查询所有集合：

```javascript
// 每次查询 5 个集合
const batchSize = 5;
for (let i = 0; i < collections.length; i += batchSize) {
  const batch = collections.slice(i, i + batchSize);
  const results = await Promise.allSettled(batch.map(c => searchCollection(c)));
  // 处理结果
}
```

## 📊 监控和调优

### 添加性能监控

```javascript
// 记录每个集合的查询时间
const collectionStats = {};

collections.forEach(async (collection) => {
  const startTime = Date.now();
  try {
    const results = await searchCollection(collection);
    const duration = Date.now() - startTime;
    
    collectionStats[collection.name] = {
      duration,
      success: true,
      count: results.length
    };
    
    // 如果超过 10 秒，记录警告
    if (duration > 10000) {
      console.warn(`⚠️  慢查询: ${collection.name} (${duration}ms)`);
    }
  } catch (error) {
    collectionStats[collection.name] = {
      duration: Date.now() - startTime,
      success: false,
      error: error.message
    };
  }
});

// 定期分析统计数据
console.log('📊 查询统计:', collectionStats);
```

### 定期审查慢速集合

每周检查日志，更新慢速集合列表：

```bash
# 查找超时的集合
grep "operation exceeded time limit" server/logs/*.log | \
  grep -oP 'Basedata\.\K[^:]+' | \
  sort | uniq -c | sort -rn
```

## 🔧 快速配置命令

### 启用跳过慢速集合

```bash
# 1. 添加环境变量
echo "SKIP_SLOW_COLLECTIONS=true" >> server/.env

# 2. 编辑 search.js（手动取消注释）

# 3. 重启服务器
cd server
npm start
```

### 禁用跳过慢速集合

```bash
# 1. 修改环境变量
sed -i 's/SKIP_SLOW_COLLECTIONS=true/SKIP_SLOW_COLLECTIONS=false/' server/.env

# 2. 重启服务器
cd server
npm start
```

## ✅ 总结

### 当前状态
- ✅ 系统有容错机制
- ⚠️ 部分集合会超时
- ✅ 不影响正常使用

### 推荐方案
1. **生产环境**: 启用 SKIP_SLOW_COLLECTIONS
2. **测试环境**: 保持默认配置
3. **定期审查**: 更新慢速集合列表

### 配置文件
- `server/.env` - 环境变量配置
- `server/routes/search.js` - 慢速集合列表

### 重启生效
修改配置后需要重启服务器：
```bash
cd server
npm start
```

---

**注意**: 跳过慢速集合会减少搜索结果，但能显著提升用户体验。根据实际需求选择合适的方案。
