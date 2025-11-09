# 佣金提现功能实施完成

## 完成时间
2025年10月21日

## 实施内容

### 任务3：佣金提现功能

#### 3.1 实现佣金提现到USDT ✅
- 创建了 `server/models/WithdrawOrder.js` 提现订单模型
- 更新了 `server/routes/withdraw.js` 添加佣金提现API
- 实现了 `POST /api/withdraw/commission` 路由

#### 3.2 实现佣金转入余额 ✅
- 在同一个API中实现了转余额功能（type='balance'）
- 扣除佣金，增加余额
- 记录两条日志（佣金减少、余额增加）

## 新增文件

### 1. WithdrawOrder模型 (`server/models/WithdrawOrder.js`)
```javascript
{
  userId: ObjectId,           // 用户ID
  orderNo: String,            // 订单号（唯一）
  type: String,               // 类型：commission/balance
  amount: Number,             // 提现金额
  fee: Number,                // 手续费
  actualAmount: Number,       // 实际到账金额
  walletAddress: String,      // 钱包地址
  status: String,             // 状态：pending/processing/completed/rejected/cancelled
  remark: String,             // 备注
  processedBy: ObjectId,      // 处理人
  processedAt: Date,          // 处理时间
  txHash: String,             // 交易哈希
  createdAt: Date,            // 创建时间
  updatedAt: Date             // 更新时间
}
```

## 更新文件

### 1. 提现路由 (`server/routes/withdraw.js`)

#### 新增API：POST /api/withdraw/commission

**功能**：佣金提现（支持两种方式）

**请求参数**：
```json
{
  "amount": 100,                    // 提现金额
  "type": "usdt",                   // 提现类型：usdt/balance
  "walletAddress": "0x..."          // USDT钱包地址（type=usdt时必填）
}
```

**响应示例（提现到USDT）**：
```json
{
  "success": true,
  "message": "提现申请已提交，等待审核",
  "data": {
    "orderNo": "WD1729512345ABC",
    "amount": 100,
    "fee": 5,
    "actualAmount": 95,
    "walletAddress": "0x...",
    "status": "pending",
    "createdAt": "2025-10-21T10:00:00.000Z"
  }
}
```

**响应示例（转入余额）**：
```json
{
  "success": true,
  "message": "佣金已成功转入余额",
  "data": {
    "amount": 100,
    "commission": 50,
    "balance": 100
  }
}
```

#### 更新API：GET /api/withdraw/history

**功能**：获取提现记录

**查询参数**：
- `page`: 页码（默认1）
- `limit`: 每页数量（默认10）
- `type`: 提现类型过滤（可选）

**响应示例**：
```json
{
  "success": true,
  "data": {
    "withdrawals": [
      {
        "_id": "...",
        "orderNo": "WD1729512345ABC",
        "type": "commission",
        "amount": 100,
        "fee": 5,
        "actualAmount": 95,
        "walletAddress": "0x...",
        "status": "pending",
        "createdAt": "2025-10-21T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

## 功能特性

### 1. 提现到USDT
- ✅ 验证提现金额（必须大于0）
- ✅ 检查最低提现金额（从SystemConfig读取，默认50元）
- ✅ 检查佣金余额是否足够
- ✅ 验证USDT钱包地址
- ✅ 计算手续费（从SystemConfig读取，默认5%）
- ✅ 生成唯一订单号
- ✅ 创建提现订单（状态：pending）
- ✅ 扣除用户佣金
- ✅ 记录BalanceLog日志

### 2. 转入余额
- ✅ 验证提现金额
- ✅ 检查最低提现金额
- ✅ 检查佣金余额是否足够
- ✅ 扣除佣金，增加余额
- ✅ 不收取手续费
- ✅ 记录两条BalanceLog日志（佣金减少、余额增加）
- ✅ 即时到账

### 3. 错误处理
- ✅ 金额验证（必须大于0）
- ✅ 最低提现金额检查
- ✅ 佣金余额不足提示
- ✅ 钱包地址验证
- ✅ 无效提现类型检查
- ✅ 详细的错误码和错误信息

## 数据流程

### 提现到USDT流程
```
用户发起提现请求
    ↓
验证金额和余额
    ↓
计算手续费
    ↓
创建提现订单（pending）
    ↓
扣除用户佣金
    ↓
记录日志
    ↓
返回订单信息
    ↓
等待管理员审核
```

### 转入余额流程
```
用户发起转余额请求
    ↓
验证金额和余额
    ↓
扣除佣金
    ↓
增加余额
    ↓
记录两条日志
    ↓
即时完成
```

## 配置项（SystemConfig）

使用的配置项：
- `points.minWithdrawAmount`: 最低提现金额（默认50元）
- `points.withdrawFee`: 提现手续费百分比（默认5%）

## 日志记录

### 提现到USDT
```javascript
{
  userId: ObjectId,
  type: 'withdraw',
  currency: 'commission',
  amount: -100,                    // 负数表示扣除
  balanceBefore: 150,
  balanceAfter: 50,
  orderId: 'WD1729512345ABC',
  description: '佣金提现到USDT钱包: 0x...'
}
```

### 转入余额
```javascript
// 佣金减少日志
{
  userId: ObjectId,
  type: 'commission_to_balance',
  currency: 'commission',
  amount: -100,
  balanceBefore: 150,
  balanceAfter: 50,
  description: '佣金转入余额'
}

// 余额增加日志
{
  userId: ObjectId,
  type: 'commission_to_balance',
  currency: 'balance',
  amount: 100,
  balanceBefore: 0,
  balanceAfter: 100,
  description: '佣金转入余额'
}
```

## 测试建议

### 1. 提现到USDT测试
```bash
# 正常提现
curl -X POST http://localhost:3000/api/withdraw/commission \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "type": "usdt",
    "walletAddress": "0x1234567890abcdef"
  }'

# 低于最低金额
curl -X POST http://localhost:3000/api/withdraw/commission \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10,
    "type": "usdt",
    "walletAddress": "0x1234567890abcdef"
  }'

# 佣金不足
curl -X POST http://localhost:3000/api/withdraw/commission \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "type": "usdt",
    "walletAddress": "0x1234567890abcdef"
  }'
```

### 2. 转入余额测试
```bash
curl -X POST http://localhost:3000/api/withdraw/commission \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "type": "balance"
  }'
```

### 3. 查询提现记录
```bash
curl -X GET "http://localhost:3000/api/withdraw/history?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 下一步

任务3已完成，可以继续执行：
- **任务4**：余额兑换积分功能
- **任务5**：商城页面开发
- **任务6**：导航栏更新
- **任务7**：Dashboard更新

## 注意事项

1. **手续费计算**：提现到USDT收取手续费，转入余额不收费
2. **订单状态**：提现到USDT需要管理员审核，转入余额即时完成
3. **最低金额**：两种方式都需要满足最低提现金额要求
4. **日志记录**：所有操作都会记录详细的BalanceLog
5. **原子操作**：使用await确保数据一致性
6. **错误处理**：提供详细的错误码和错误信息

## 相关文档

- 需求文档：`.kiro/specs/balance-points-commission-system/requirements.md`
- 设计文档：`.kiro/specs/balance-points-commission-system/design.md`
- 任务列表：`.kiro/specs/balance-points-commission-system/tasks.md`
