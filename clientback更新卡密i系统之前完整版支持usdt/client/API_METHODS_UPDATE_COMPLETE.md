# API工具方法更新完成

## 完成时间
2025年10月21日

## 任务10：API工具方法更新

### 10.1 添加前端API方法 ✅

**文件**：`src/utils/api.ts`

## 新增API方法

### 1. userApi新增方法

#### exchangePoints
**功能**：余额兑换积分

**方法签名**：
```typescript
exchangePoints: (amount: number) => Promise<ApiResponse>
```

**参数**：
- `amount`: 要兑换的积分数量

**调用示例**：
```typescript
const response = await userApi.exchangePoints(100);
```

#### getCommissionLogs
**功能**：获取佣金记录

**方法签名**：
```typescript
getCommissionLogs: (page?: number, limit?: number) => Promise<ApiResponse>
```

**参数**：
- `page`: 页码（默认1）
- `limit`: 每页数量（默认20）

**调用示例**：
```typescript
const response = await userApi.getCommissionLogs(1, 20);
```

### 2. withdrawApi新增方法

#### withdrawCommission
**功能**：佣金提现

**方法签名**：
```typescript
withdrawCommission: (
  amount: number, 
  type: 'usdt' | 'balance', 
  walletAddress?: string
) => Promise<ApiResponse>
```

**参数**：
- `amount`: 提现金额
- `type`: 提现类型（'usdt' 或 'balance'）
- `walletAddress`: USDT钱包地址（type为'usdt'时必填）

**调用示例**：
```typescript
// 提现到USDT
const response = await withdrawApi.withdrawCommission(
  100, 
  'usdt', 
  '0x1234567890abcdef'
);

// 转入余额
const response = await withdrawApi.withdrawCommission(100, 'balance');
```

#### getWithdrawHistory
**功能**：获取提现记录

**方法签名**：
```typescript
getWithdrawHistory: (
  page?: number, 
  limit?: number, 
  type?: string
) => Promise<ApiResponse>
```

**参数**：
- `page`: 页码（默认1）
- `limit`: 每页数量（默认10）
- `type`: 提现类型过滤（可选）

**调用示例**：
```typescript
const response = await withdrawApi.getWithdrawHistory(1, 10, 'commission');
```

### 3. shopApi新增模块

#### getExchangeRate
**功能**：获取余额兑换积分汇率

**方法签名**：
```typescript
getExchangeRate: () => Promise<ApiResponse>
```

**调用示例**：
```typescript
const response = await shopApi.getExchangeRate();
// response.data = { exchangeRate: 10, description: "1元余额 = 10积分" }
```

## API方法总览

### userApi
- ✅ getProfile - 获取用户资料
- ✅ updateProfile - 更新用户资料
- ✅ getSearchHistory - 获取搜索历史
- ✅ getCommissions - 获取佣金统计
- ✅ getPointsHistory - 获取积分历史
- ✅ claimDailyPoints - 每日签到
- ✅ getReferralStats - 获取推荐统计
- ✅ getBalanceLogs - 获取余额记录
- ⭐ exchangePoints - 余额兑换积分（新增）
- ⭐ getCommissionLogs - 获取佣金记录（新增）

### withdrawApi
- ✅ createWithdraw - 创建提现申请
- ⭐ withdrawCommission - 佣金提现（新增）
- ⭐ getWithdrawHistory - 获取提现记录（新增）

### shopApi（新增模块）
- ⭐ getExchangeRate - 获取兑换汇率（新增）

## 使用示例

### 1. 余额兑换积分流程
```typescript
import { userApi, shopApi } from '../utils/api';

// 1. 获取兑换汇率
const rateResponse = await shopApi.getExchangeRate();
const exchangeRate = rateResponse.data.exchangeRate;

// 2. 计算所需余额
const points = 100;
const cost = points / exchangeRate;

// 3. 执行兑换
const response = await userApi.exchangePoints(points);
if (response.success) {
  console.log('兑换成功！');
}
```

### 2. 佣金提现流程
```typescript
import { withdrawApi } from '../utils/api';

// 提现到USDT
const response = await withdrawApi.withdrawCommission(
  100,
  'usdt',
  '0x1234567890abcdef'
);

if (response.success) {
  console.log('提现申请已提交');
}
```

### 3. 查询佣金记录
```typescript
import { userApi } from '../utils/api';

const response = await userApi.getCommissionLogs(1, 20);
if (response.success) {
  const logs = response.data.logs;
  console.log('佣金记录：', logs);
}
```

## API端点映射

| 前端方法 | HTTP方法 | 端点 |
|---------|---------|------|
| userApi.exchangePoints | POST | /api/user/exchange-points |
| userApi.getCommissionLogs | GET | /api/user/balance-logs |
| withdrawApi.withdrawCommission | POST | /api/withdraw/commission |
| withdrawApi.getWithdrawHistory | GET | /api/withdraw/history |
| shopApi.getExchangeRate | GET | /api/shop/exchange-rate |

## 错误处理

所有API方法都使用统一的错误处理：

```typescript
try {
  const response = await userApi.exchangePoints(100);
  if (response.success) {
    // 处理成功
  } else {
    // 处理失败
    console.error(response.message);
  }
} catch (error) {
  // 处理异常
  console.error('API调用失败:', error);
}
```

## 响应格式

所有API方法返回统一的响应格式：

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

## 认证

所有API请求自动包含认证token（通过axios拦截器）：
- Token从Cookie中读取
- 自动添加到请求头：`Authorization: Bearer ${token}`
- 401响应自动跳转到登录页

## 测试建议

### 1. 单元测试
```typescript
describe('userApi', () => {
  it('should exchange points', async () => {
    const response = await userApi.exchangePoints(100);
    expect(response.success).toBe(true);
  });
});
```

### 2. 集成测试
```typescript
describe('Exchange Flow', () => {
  it('should complete exchange flow', async () => {
    // 1. 获取汇率
    const rate = await shopApi.getExchangeRate();
    
    // 2. 执行兑换
    const exchange = await userApi.exchangePoints(100);
    
    // 3. 验证记录
    const logs = await userApi.getCommissionLogs();
    
    expect(exchange.success).toBe(true);
  });
});
```

## 下一步

任务10已完成，可以继续执行：
- **任务9**：管理员配置更新
- **任务11**：测试和验证
- **任务12**：文档和部署

## 注意事项

1. **类型安全**：所有方法都有TypeScript类型定义
2. **错误处理**：统一的错误处理机制
3. **认证自动化**：Token自动管理
4. **响应统一**：所有API返回相同格式
5. **易于使用**：简洁的方法签名

## 相关文档

- 任务列表：`.kiro/specs/balance-points-commission-system/tasks.md`
- 设计文档：`.kiro/specs/balance-points-commission-system/design.md`
- 后端API文档：各个完成文档中的API部分
