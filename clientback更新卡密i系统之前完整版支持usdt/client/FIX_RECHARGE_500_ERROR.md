# 修复充值500错误

## 问题描述

用户尝试充值时提示"创建订单失败"，F12显示：
```
POST http://172.16.254.252:5173/api/recharge/create 500 (Internal Server Error)
```

## 问题原因

1. **BEpusdt服务不可用**：配置的BEpusdt支付网关可能无法访问
2. **网络连接问题**：服务器无法连接到BEpusdt API
3. **配置错误**：API密钥或商户ID可能不正确
4. **缺少错误处理**：没有友好的错误提示

## 修复方案

### 1. 添加详细的错误日志

**server/services/rechargeService.js**
```javascript
console.log('📝 创建充值订单:', { userId, type, amount, currency, points, vipDays });
console.log('🔑 订单ID:', orderId);
console.log('🌐 BEpusdt配置:', {
  url: process.env.BEPUSDT_URL,
  hasApiKey: !!process.env.BEPUSDT_API_KEY,
  merchantId: process.env.BEPUSDT_MERCHANT_ID
});
```

**server/services/bepusdtService.js**
```javascript
console.log('🚀 调用BEpusdt API:', {
  url: `${this.baseUrl}/api/v1/order/create-transaction`,
  params: { ...params, merchant_id: this.merchantId },
  hasApiKey: !!this.apiKey
});
```

### 2. 添加测试模式

为了方便开发和测试，添加了测试模式。当BEpusdt服务不可用时，可以使用模拟数据。

**server/.env**
```env
BEPUSDT_TEST_MODE=true
```

**server/services/bepusdtService.js**
```javascript
constructor() {
  this.testMode = process.env.BEPUSDT_TEST_MODE === 'true';
  if (this.testMode) {
    console.log('⚠️  BEpusdt运行在测试模式');
  }
}

async createOrder(params) {
  // 测试模式：返回模拟数据
  if (this.testMode) {
    console.log('🧪 测试模式：返回模拟订单');
    return {
      success: true,
      order_id: params.order_id,
      payment_address: 'TTest123MockAddressForTesting456789',
      actual_amount: params.amount,
      currency: params.currency,
      expire_time: 1800,
      status: 'pending'
    };
  }
  // ... 正常流程
}
```

### 3. 改进错误处理

```javascript
catch (error) {
  console.error('❌ BEpusdt createOrder error:', {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status
  });
  
  // 网络错误的友好提示
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    throw new Error('无法连接到支付服务，请检查BEpusdt服务是否正常运行');
  }
  
  throw new Error(error.response?.data?.message || error.message || '创建订单失败');
}
```

### 4. 添加超时设置

```javascript
const response = await axios.post(url, data, {
  headers: { ... },
  timeout: 10000 // 10秒超时
});
```

## 使用方法

### 开发/测试环境（使用测试模式）

1. 在`server/.env`中设置：
```env
BEPUSDT_TEST_MODE=true
```

2. 重启服务器

3. 现在充值会使用模拟数据，不会真正调用BEpusdt API

4. 查看服务器日志，会看到：
```
⚠️  BEpusdt运行在测试模式
🧪 测试模式：返回模拟订单
```

### 生产环境（使用真实BEpusdt）

1. 确保BEpusdt服务正常运行并可访问

2. 在`server/.env`中配置正确的信息：
```env
BEPUSDT_URL=https://your-bepusdt-domain.com
BEPUSDT_API_KEY=your-real-api-key
BEPUSDT_MERCHANT_ID=your-merchant-id
BEPUSDT_SECRET_KEY=your-secret-key
BEPUSDT_TEST_MODE=false  # 或删除此行
```

3. 重启服务器

4. 充值会调用真实的BEpusdt API

## 调试步骤

### 1. 查看服务器日志

启动服务器后，尝试充值，查看控制台输出：

```bash
📝 创建充值订单: { userId: '...', type: 'points', amount: 10, ... }
🔑 订单ID: ORDER1234567890123
🌐 BEpusdt配置: { url: 'https://...', hasApiKey: true, merchantId: '1000' }
🚀 调用BEpusdt API: { url: '...', params: {...}, hasApiKey: true }
```

### 2. 检查错误信息

如果出错，会看到详细的错误信息：

```bash
❌ BEpusdt createOrder error: {
  message: 'connect ECONNREFUSED ...',
  response: undefined,
  status: undefined
}
```

### 3. 常见错误及解决方案

**错误1：ECONNREFUSED**
- 原因：无法连接到BEpusdt服务
- 解决：检查BEPUSDT_URL是否正确，服务是否运行
- 临时方案：启用测试模式

**错误2：401 Unauthorized**
- 原因：API密钥无效
- 解决：检查BEPUSDT_API_KEY是否正确

**错误3：400 Bad Request**
- 原因：请求参数错误
- 解决：检查merchant_id等参数是否正确

**错误4：ETIMEDOUT**
- 原因：请求超时
- 解决：检查网络连接，增加超时时间

## 测试模式的限制

⚠️ **注意**：测试模式仅用于开发和测试，不能用于生产环境！

测试模式的限制：
- 不会真正创建支付订单
- 不会生成真实的支付地址
- 订单状态查询会返回模拟数据
- 不会触发真实的支付流程

## 验证修复

### 1. 启用测试模式
```bash
# 在server/.env中
BEPUSDT_TEST_MODE=true
```

### 2. 重启服务器
```bash
cd server
npm start
```

### 3. 尝试充值
- 打开前端页面
- 进入充值页面
- 选择充值套餐
- 点击充值

### 4. 检查结果
- 应该能成功创建订单
- 会显示模拟的支付地址
- 服务器日志显示"测试模式"

### 5. 查看订单
- 订单应该保存到数据库
- 状态为"pending"
- 包含模拟的支付地址

## 后续步骤

1. **配置真实的BEpusdt服务**
   - 部署BEpusdt支付网关
   - 获取真实的API密钥和商户ID
   - 更新.env配置

2. **测试真实支付流程**
   - 关闭测试模式
   - 使用小额测试充值
   - 验证支付和回调

3. **监控和日志**
   - 设置日志收集
   - 监控支付成功率
   - 追踪异常订单

## 总结

✅ 添加了详细的错误日志
✅ 实现了测试模式
✅ 改进了错误处理
✅ 添加了超时设置
✅ 提供了友好的错误提示

现在可以在测试模式下正常测试充值流程，等BEpusdt服务配置好后，关闭测试模式即可使用真实支付！
