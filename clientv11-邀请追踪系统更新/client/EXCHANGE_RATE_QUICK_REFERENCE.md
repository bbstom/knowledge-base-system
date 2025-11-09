# 实时汇率 - 快速参考

## 🚀 快速启动

```bash
# 1. 启动后端
cd server && npm start

# 2. 启动前端
npm run dev

# 3. 测试汇率服务
node server/scripts/testExchangeRate.js
```

## 📡 API端点

### 获取汇率
```bash
GET /api/exchange-rate

# 响应
{
  "success": true,
  "rates": { "USDT": 1.0, "TRX": 3.14 },
  "lastUpdate": "2024-10-21T13:25:43.000Z",
  "cacheRemaining": 299
}
```

### 刷新汇率
```bash
POST /api/exchange-rate/refresh

# 响应
{
  "success": true,
  "rates": { "USDT": 1.0, "TRX": 3.14 },
  "lastUpdate": "2024-10-21T13:30:00.000Z"
}
```

## 💻 代码示例

### 前端获取汇率
```typescript
const loadExchangeRates = async () => {
  const response = await fetch('/api/exchange-rate');
  const data = await response.json();
  if (data.success) {
    setExchangeRates(data.rates);
  }
};
```

### 使用汇率组件
```tsx
import { ExchangeRateDisplay } from '../components/ExchangeRateDisplay';

<ExchangeRateDisplay 
  onRatesUpdate={(rates) => console.log(rates)}
  showRefreshButton={true}
/>
```

### 后端获取汇率
```javascript
const exchangeRateService = require('./services/exchangeRateService');

const rates = await exchangeRateService.getExchangeRates();
// { USDT: 1.0, TRX: 3.14 }
```

## 🔧 配置

### 可选: CoinMarketCap
```env
# .env
COINMARKETCAP_API_KEY=your_api_key_here
```

### 调整缓存时间
```javascript
// server/services/exchangeRateService.js
this.cache = {
  cacheTime: 5 * 60 * 1000  // 修改这里（毫秒）
};
```

## 📊 数据源

| 数据源 | 状态 | 限制 | 密钥 |
|--------|------|------|------|
| CoinGecko | ✅ 主要 | 50次/分钟 | 不需要 |
| Binance | ✅ 备用 | 1200次/分钟 | 不需要 |
| CoinMarketCap | ⚙️ 可选 | 10k次/月 | 需要 |

## 🧪 测试命令

```bash
# 测试汇率服务
node server/scripts/testExchangeRate.js

# 测试API（需要服务器运行）
curl http://localhost:3001/api/exchange-rate
curl -X POST http://localhost:3001/api/exchange-rate/refresh

# 查看健康状态
curl http://localhost:3001/health
```

## 📈 性能指标

- **缓存响应**: < 10ms
- **API响应**: 200-500ms
- **缓存时间**: 5分钟
- **缓存命中率**: > 90%

## 🔍 故障排除

### 问题: 404 Not Found
```bash
# 解决: 重启服务器
cd server && npm start
```

### 问题: 汇率不更新
```bash
# 解决: 手动刷新
curl -X POST http://localhost:3001/api/exchange-rate/refresh
```

### 问题: API失败
```bash
# 检查网络
ping api.coingecko.com

# 查看日志
# 在服务器控制台查看错误信息
```

## 📁 关键文件

```
server/
├── services/exchangeRateService.js  # 汇率服务
├── routes/exchangeRate.js           # API路由
└── scripts/testExchangeRate.js      # 测试脚本

src/
├── components/ExchangeRateDisplay.tsx  # 汇率组件
└── pages/Dashboard/Recharge.tsx        # 充值页面
```

## 🎯 功能清单

- [x] 实时汇率获取
- [x] 多数据源支持
- [x] 智能缓存
- [x] 手动刷新
- [x] 容错机制
- [x] 更新时间显示
- [x] 可复用组件

## 📚 相关文档

- [详细技术文档](./REAL_TIME_EXCHANGE_RATE.md)
- [启动指南](./START_WITH_REAL_TIME_RATE.md)
- [实现总结](./EXCHANGE_RATE_IMPLEMENTATION_SUMMARY.md)

## 💡 使用提示

1. **首次使用**: 直接启动，无需配置
2. **提高可靠性**: 配置 CoinMarketCap API密钥
3. **调整性能**: 修改缓存时间
4. **监控运行**: 查看服务器日志

## ⚡ 快速验证

```bash
# 一键测试
node server/scripts/testExchangeRate.js

# 预期输出
🎉 所有测试通过！
```

---

**版本**: 1.0.0  
**更新**: 2024-10-21  
**状态**: ✅ 生产就绪
