# 实时汇率系统

## 概述

系统现已支持实时加密货币汇率，自动从多个数据源获取最新的 TRX/USD 汇率。

## 功能特性

### 1. 多数据源支持
- **CoinGecko API** (主要数据源，免费)
- **Binance API** (备用数据源，免费)
- **CoinMarketCap API** (可选，需要API密钥)

### 2. 智能缓存机制
- 汇率缓存时间: 5分钟
- 避免频繁请求API
- 缓存失效时自动刷新

### 3. 容错机制
- 多数据源自动切换
- API失败时使用缓存数据
- 最终回退到默认汇率

### 4. 用户体验
- 显示汇率更新时间
- 手动刷新汇率按钮
- 实时汇率标识

## API端点

### 获取实时汇率
```
GET /api/exchange-rate
```

响应示例:
```json
{
  "success": true,
  "rates": {
    "USDT": 1.0,
    "TRX": 6.4523
  },
  "lastUpdate": "2024-10-21T10:30:00.000Z",
  "cacheRemaining": 285,
  "message": "汇率获取成功"
}
```

### 强制刷新汇率
```
POST /api/exchange-rate/refresh
```

响应示例:
```json
{
  "success": true,
  "rates": {
    "USDT": 1.0,
    "TRX": 6.4523
  },
  "lastUpdate": "2024-10-21T10:35:00.000Z",
  "message": "汇率刷新成功"
}
```

## 前端集成

### 充值页面
- 页面加载时自动获取实时汇率
- 显示汇率更新时间
- 提供"刷新汇率"按钮
- 币种选择卡片显示实时汇率标识

### 汇率显示
```
USDT (TRC20)
汇率: $1 ≈ 1.00 USDT
✓ 实时汇率

TRX (TRC20)
汇率: $1 ≈ 6.45 TRX
✓ 实时汇率
```

## 测试

### 测试汇率服务
```bash
node server/scripts/testExchangeRate.js
```

测试内容:
1. 获取实时汇率
2. 验证缓存机制
3. 测试强制刷新
4. 汇率计算示例

### 测试API端点
```bash
# 获取汇率
curl http://localhost:3001/api/exchange-rate

# 刷新汇率
curl -X POST http://localhost:3001/api/exchange-rate/refresh
```

## 配置

### 可选: CoinMarketCap API
如果想使用 CoinMarketCap 作为数据源，在 `.env` 文件中添加:

```env
COINMARKETCAP_API_KEY=your_api_key_here
```

注册地址: https://coinmarketcap.com/api/

## 数据源说明

### CoinGecko (推荐)
- 免费使用
- 无需API密钥
- 数据准确
- 限制: 50次/分钟

### Binance
- 免费使用
- 无需API密钥
- 实时交易数据
- 限制: 1200次/分钟

### CoinMarketCap
- 需要API密钥
- 免费套餐: 10,000次/月
- 数据权威
- 适合作为备用

## 汇率计算逻辑

### USD → 加密货币
```javascript
// 例如: 充值 $100
const usdAmount = 100;

// USDT (稳定币 1:1)
const usdtAmount = usdAmount * 1.0;  // = 100 USDT

// TRX (根据实时汇率)
const trxRate = 6.45;  // 1 USD = 6.45 TRX
const trxAmount = usdAmount * trxRate;  // = 645 TRX
```

### 实际支付金额
注意: 前端显示的金额仅供参考，实际支付金额由 BEpusdt 系统决定。

## 监控和日志

### 服务器日志
```
📡 尝试从 CoinGecko 获取汇率...
✅ CoinGecko 汇率获取成功
📊 使用缓存的汇率数据
🔄 强制刷新汇率...
```

### 前端日志
```
✅ 实时汇率加载成功: {USDT: 1, TRX: 6.45}
✅ 汇率刷新成功: {USDT: 1, TRX: 6.45}
```

## 故障排除

### 问题1: 汇率获取失败
**症状**: 显示"加载汇率失败，使用默认汇率"

**解决方案**:
1. 检查网络连接
2. 验证API数据源是否可访问
3. 查看服务器日志了解具体错误

### 问题2: 汇率不更新
**症状**: 汇率长时间不变

**解决方案**:
1. 点击"刷新汇率"按钮
2. 检查缓存时间是否过长
3. 重启服务器清除缓存

### 问题3: 汇率显示异常
**症状**: 汇率数值不合理

**解决方案**:
1. 检查API响应数据格式
2. 验证汇率计算逻辑
3. 查看服务器日志

## 性能优化

### 缓存策略
- 默认缓存时间: 5分钟
- 可根据需要调整 `cacheTime` 参数
- 建议范围: 3-10分钟

### API请求优化
- 使用缓存减少API调用
- 多数据源自动切换
- 设置合理的超时时间 (5秒)

## 安全考虑

### API密钥保护
- 所有API密钥存储在 `.env` 文件
- 不要将 `.env` 提交到版本控制
- 定期更换API密钥

### 数据验证
- 验证API响应格式
- 检查汇率数值合理性
- 防止异常数据影响系统

## 未来改进

### 计划功能
- [ ] 支持更多加密货币
- [ ] 汇率历史记录
- [ ] 汇率波动提醒
- [ ] 自定义汇率数据源
- [ ] 汇率图表展示

### 优化方向
- [ ] 更智能的缓存策略
- [ ] 更多数据源支持
- [ ] 汇率预测功能
- [ ] 实时汇率推送

## 相关文件

### 后端
- `server/services/exchangeRateService.js` - 汇率服务
- `server/routes/exchangeRate.js` - API路由
- `server/scripts/testExchangeRate.js` - 测试脚本

### 前端
- `src/pages/Dashboard/Recharge.tsx` - 充值页面

## 技术栈

- **后端**: Node.js + Express
- **HTTP客户端**: Axios
- **数据源**: CoinGecko, Binance, CoinMarketCap
- **缓存**: 内存缓存

## 总结

实时汇率系统提供了准确、可靠的加密货币汇率数据，通过多数据源和智能缓存机制确保系统的稳定性和性能。用户可以随时查看最新汇率，并手动刷新以获取最新数据。
