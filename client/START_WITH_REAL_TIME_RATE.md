# 启动实时汇率系统

## 快速启动

### 1. 启动后端服务器
```bash
cd server
npm start
```

或者使用启动脚本:
```bash
# Windows
server\start.bat

# Linux/Mac
bash server/start.sh
```

### 2. 启动前端
```bash
npm run dev
```

### 3. 访问系统
- 前端: http://localhost:5173
- 后端: http://localhost:3001
- 健康检查: http://localhost:3001/health

## 验证实时汇率功能

### 方法1: 通过前端界面
1. 登录系统
2. 进入"充值中心"
3. 查看币种选择区域
4. 应该看到:
   - 实时汇率显示
   - 汇率更新时间
   - "刷新汇率"按钮
   - "✓ 实时汇率"标识

### 方法2: 通过API测试
```bash
# 获取汇率
curl http://localhost:3001/api/exchange-rate

# 刷新汇率
curl -X POST http://localhost:3001/api/exchange-rate/refresh
```

### 方法3: 运行测试脚本
```bash
node server/scripts/testExchangeRate.js
```

## 预期结果

### API响应示例
```json
{
  "success": true,
  "rates": {
    "USDT": 1.0,
    "TRX": 3.1434
  },
  "lastUpdate": "2024-10-21T13:25:43.000Z",
  "cacheRemaining": 299,
  "message": "汇率获取成功"
}
```

### 前端显示
```
选择支付币种                    [刷新汇率]
汇率更新时间: 2024/10/21 13:25:43

┌─────────────────────┐  ┌─────────────────────┐
│ USDT (TRC20)        │  │ TRX (TRC20)         │
│ 汇率: $1 ≈ 1.00 USDT│  │ 汇率: $1 ≈ 3.14 TRX │
│ ✓ 实时汇率          │  │ ✓ 实时汇率          │
└─────────────────────┘  └─────────────────────┘
```

## 功能特性

### ✅ 已实现
- [x] 从 CoinGecko 获取实时汇率
- [x] 从 Binance 获取实时汇率（备用）
- [x] 5分钟智能缓存
- [x] 手动刷新汇率
- [x] 显示更新时间
- [x] 多数据源自动切换
- [x] 容错机制
- [x] 实时汇率标识

### 🎯 汇率数据源
1. **CoinGecko** (主要)
   - 免费API
   - 无需密钥
   - 50次/分钟限制

2. **Binance** (备用)
   - 免费API
   - 无需密钥
   - 1200次/分钟限制

3. **CoinMarketCap** (可选)
   - 需要API密钥
   - 10,000次/月
   - 在 .env 中配置 `COINMARKETCAP_API_KEY`

## 测试场景

### 场景1: 正常获取汇率
1. 访问充值页面
2. 查看币种选择区域
3. 应显示实时汇率

**预期**: 显示从 CoinGecko 获取的实时汇率

### 场景2: 手动刷新汇率
1. 点击"刷新汇率"按钮
2. 等待刷新完成

**预期**: 
- 按钮显示"更新中..."
- 刷新图标旋转
- 显示成功提示
- 汇率更新时间改变

### 场景3: 缓存机制
1. 第一次访问页面（获取新汇率）
2. 5分钟内刷新页面（使用缓存）
3. 5分钟后刷新页面（获取新汇率）

**预期**: 
- 第一次: 从API获取
- 5分钟内: 使用缓存（快速响应）
- 5分钟后: 重新从API获取

### 场景4: 容错测试
1. 断开网络连接
2. 访问充值页面

**预期**: 
- 使用缓存数据（如果有）
- 或使用默认汇率
- 显示错误提示

## 服务器日志

### 正常运行
```
🚀 知识库系统后端服务器启动成功
📡 本地访问: http://localhost:3001
🔄 获取最新汇率...
📡 尝试从 CoinGecko 获取汇率...
✅ CoinGecko 汇率获取成功
✅ 汇率更新成功: { USDT: 1, TRX: 3.1434 }
```

### 使用缓存
```
GET /api/exchange-rate
📊 使用缓存的汇率数据
```

### 强制刷新
```
POST /api/exchange-rate/refresh
🔄 强制刷新汇率...
✅ 汇率更新成功: { USDT: 1, TRX: 3.1434 }
```

## 故障排除

### 问题1: 404 Not Found
**症状**: 访问 `/api/exchange-rate` 返回 404

**解决方案**:
```bash
# 1. 确认服务器已重启
# 2. 检查路由是否正确注册
# 3. 查看 server/index.js 是否包含:
#    const exchangeRateRoutes = require('./routes/exchangeRate');
#    app.use('/api/exchange-rate', exchangeRateRoutes);
```

### 问题2: 汇率获取失败
**症状**: 返回默认汇率或错误

**解决方案**:
```bash
# 1. 检查网络连接
# 2. 测试API可访问性
curl https://api.coingecko.com/api/v3/simple/price?ids=tron&vs_currencies=usd

# 3. 查看服务器日志
```

### 问题3: 前端不显示实时汇率
**症状**: 前端显示旧的硬编码汇率

**解决方案**:
```bash
# 1. 清除浏览器缓存
# 2. 重启前端开发服务器
# 3. 检查浏览器控制台错误
# 4. 确认API调用成功
```

## 性能指标

### API响应时间
- 使用缓存: < 10ms
- 从CoinGecko获取: 200-500ms
- 从Binance获取: 100-300ms

### 缓存命中率
- 目标: > 90%
- 缓存时间: 5分钟
- 自动刷新: 缓存过期时

### 可用性
- 目标: 99.9%
- 多数据源保障
- 容错机制

## 监控建议

### 关键指标
1. API调用成功率
2. 缓存命中率
3. 响应时间
4. 汇率更新频率

### 日志监控
```bash
# 查看汇率相关日志
tail -f server/logs/app.log | grep "汇率"

# 或在服务器控制台查看实时日志
```

## 下一步

### 建议测试流程
1. ✅ 启动服务器
2. ✅ 运行测试脚本
3. ✅ 测试API端点
4. ✅ 访问前端界面
5. ✅ 测试手动刷新
6. ✅ 验证缓存机制

### 可选配置
- 配置 CoinMarketCap API密钥（提高可靠性）
- 调整缓存时间（根据需求）
- 添加更多数据源

## 相关文档
- [实时汇率系统详细文档](./REAL_TIME_EXCHANGE_RATE.md)
- [BEpusdt集成指南](./BEPUSDT_INTEGRATION_GUIDE.md)
- [支付系统文档](./PAYMENT_SYSTEM_DOCUMENTATION.md)
