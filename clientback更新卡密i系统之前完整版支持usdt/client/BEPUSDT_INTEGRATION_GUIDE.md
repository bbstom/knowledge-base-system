# BEpusdt 支付集成指南

## 📋 概述

系统已集成BEpusdt支付网关，支持USDT (TRC20) 和 TRX (TRC20) 充值功能。

**BEpusdt项目地址：** https://github.com/v03413/BEpusdt

---

## 🚀 功能特点

### 支持的币种
- **USDT (TRC20)** - 稳定币，汇率相对稳定
- **TRX (TRC20)** - 波场原生代币，手续费低

### 支付流程
1. 用户选择充值金额和币种
2. 系统创建支付订单
3. 生成收款地址和二维码
4. 用户转账到指定地址
5. 系统自动检测到账
6. 余额自动充值到用户账户

---

## 🔧 技术实现

### 1. API集成

**BEpusdt API工具类：** `src/utils/bepusdt.ts`

```typescript
// 创建订单
const order = await bepusdtAPI.createOrder({
  order_id: 'ORDER123456789',
  amount: 100, // 人民币金额
  currency: 'USDT',
  notify_url: 'https://yourdomain.com/api/payment/notify',
  redirect_url: 'https://yourdomain.com/dashboard/recharge'
});

// 查询订单状态
const status = await bepusdtAPI.queryOrder('ORDER123456789');
```

### 2. 环境配置

**环境变量设置：**
```env
# BEpusdt配置
REACT_APP_BEPUSDT_URL=https://your-bepusdt-domain.com
REACT_APP_BEPUSDT_API_KEY=your-api-key
REACT_APP_BEPUSDT_MERCHANT_ID=your-merchant-id
```

### 3. 页面结构

**充值页面：** `/dashboard/recharge`

---

## 🔄 API接口说明

### 1. 创建订单

**接口：** `POST /api/v1/order/create-transaction`

**请求参数：**
```json
{
  "order_id": "ORDER1729328400123",
  "amount": 100,
  "currency": "USDT",
  "notify_url": "https://yourdomain.com/api/payment/notify",
  "redirect_url": "https://yourdomain.com/dashboard/recharge",
  "merchant_id": "your-merchant-id"
}
```

**响应数据：**
```json
{
  "success": true,
  "order_id": "ORDER1729328400123",
  "payment_address": "TXxx1234567890abcdefghijklmnopqrst",
  "amount": 100,
  "actual_amount": 13.89,
  "currency": "USDT",
  "expire_time": 900
}
```

### 2. 查询订单

**接口：** `GET /api/v1/order/query-order-info`

**请求参数：**
```
order_id=ORDER1729328400123
```

**响应数据：**
```json
{
  "success": true,
  "order_id": "ORDER1729328400123",
  "status": "paid",
  "amount": 100,
  "actual_amount": 13.89,
  "currency": "USDT",
  "payment_address": "TXxx1234567890abcdefghijklmnopqrst",
  "tx_hash": "0xabcdef1234567890",
  "block_number": 12345678,
  "created_at": "2024-10-19T10:30:00Z",
  "updated_at": "2024-10-19T10:35:00Z"
}
```

### 3. Webhook通知

**接口：** `POST /api/payment/notify`

**通知数据：**
```json
{
  "order_id": "ORDER1729328400123",
  "amount": 100,
  "actual_amount": 13.89,
  "currency": "USDT",
  "status": "paid",
  "tx_hash": "0xabcdef1234567890",
  "block_number": 12345678,
  "created_at": "2024-10-19T10:30:00Z",
  "updated_at": "2024-10-19T10:35:00Z",
  "sign": "md5_signature"
}
```

---

## 🔐 安全机制

### 1. 签名验证

**签名生成规则：**
```
sign = MD5(order_id + amount + actual_amount + currency + status + secret_key)
```

**验证代码：**
```typescript
const isValid = bepusdtAPI.verifyWebhookSignature(webhookData, secretKey);
if (!isValid) {
  throw new Error('Invalid webhook signature');
}
```

### 2. 订单状态管理

**状态流转：**
```
pending → paid
pending → expired
pending → failed
```

**状态说明：**
- `pending`: 等待支付
- `paid`: 支付成功
- `expired`: 订单过期
- `failed`: 支付失败

### 3. 地址验证

**TRC20地址验证：**
```typescript
const isValidAddress = validateTRC20Address(address);
// 验证规则：以T开头，长度34位，只包含字母和数字
```

---

## 💰 汇率和金额

### 汇率获取

**实时汇率API：**
```typescript
const rates = await bepusdtAPI.getExchangeRates();
// { USDT: 7.2, TRX: 0.8 }
```

**汇率更新频率：**
- 建议每5分钟更新一次
- 支付时使用实时汇率
- 显示汇率更新时间

### 金额计算

**人民币转加密货币：**
```typescript
const cryptoAmount = cnyAmount / exchangeRate;
// 例：100 CNY / 7.2 = 13.89 USDT
```

**精度处理：**
- USDT: 保留6位小数
- TRX: 保留6位小数
- 显示时保留2位小数

---

## 📊 数据库设计

### 充值订单表

```sql
CREATE TABLE recharge_orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  order_id VARCHAR(64) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL COMMENT '人民币金额',
  actual_amount DECIMAL(20,8) NOT NULL COMMENT '加密货币金额',
  currency VARCHAR(10) NOT NULL COMMENT '币种',
  payment_address VARCHAR(64) NOT NULL COMMENT '收款地址',
  status ENUM('pending','paid','expired','failed') DEFAULT 'pending',
  tx_hash VARCHAR(128) NULL COMMENT '交易哈希',
  block_number BIGINT NULL COMMENT '区块高度',
  expire_at TIMESTAMP NOT NULL COMMENT '过期时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_order_id (order_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

---

## 🧪 测试指南

### 手动测试清单

**充值流程测试：**
- [ ] 选择预设金额
- [ ] 输入自定义金额
- [ ] 切换币种（USDT/TRX）
- [ ] 查看汇率显示
- [ ] 创建订单
- [ ] 显示支付信息
- [ ] 复制收款地址
- [ ] 复制支付金额
- [ ] 扫描二维码
- [ ] 倒计时显示
- [ ] 检查支付状态
- [ ] 支付成功后余额更新
- [ ] 订单过期处理
- [ ] 取消订单

---

## 📚 常见问题

### Q1: 如何获取BEpusdt API密钥？

**A:** 
1. 部署BEpusdt服务
2. 访问管理后台
3. 在设置中生成API密钥
4. 配置到环境变量中

### Q2: 支付后多久到账？

**A:** 
- TRC20网络确认时间：约1-3分钟
- 系统检测到账时间：实时
- 余额更新时间：即时

### Q3: 订单过期时间是多久？

**A:** 
- 默认15分钟（900秒）
- 可在创建订单时自定义
- 过期后订单自动关闭

---

## 🎯 最佳实践

### 1. 安全建议

- ✅ 使用HTTPS协议
- ✅ 验证所有webhook签名
- ✅ 设置IP白名单
- ✅ 定期更新API密钥
- ✅ 记录所有支付日志
- ✅ 监控异常订单
- ✅ 设置金额上限

### 2. 性能优化

- ✅ 使用Redis缓存汇率
- ✅ 异步处理webhook通知
- ✅ 批量查询订单状态
- ✅ 使用CDN加速二维码
- ✅ 优化数据库索引
- ✅ 实现请求限流

### 3. 用户体验

- ✅ 显示实时汇率
- ✅ 提供支付倒计时
- ✅ 支持一键复制
- ✅ 显示支付进度
- ✅ 提供支付帮助
- ✅ 支持多语言
- ✅ 移动端适配

---

## 📞 技术支持

### BEpusdt项目
- GitHub: https://github.com/v03413/BEpusdt
- 文档: https://github.com/v03413/BEpusdt/wiki
- Issues: https://github.com/v03413/BEpusdt/issues

### 相关资源
- TRC20文档: https://developers.tron.network/
- TRON浏览器: https://tronscan.org/
- USDT官网: https://tether.to/

---

## 📝 总结

BEpusdt集成为系统提供了完整的加密货币充值解决方案，支持USDT/TRX充值、实时汇率转换、自动到账检测等核心功能。

祝您使用愉快！🎉
