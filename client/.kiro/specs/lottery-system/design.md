# 抽奖系统设计文档

## 技术架构

### 后端
- **Models**: LotteryActivity, LotteryRecord
- **Routes**: /api/lottery (用户), /api/admin/lottery (管理员)
- **Services**: lotteryService.js (抽奖逻辑)
- **Middleware**: 权限验证、次数限制

### 前端
- **管理页面**: src/pages/Admin/LotteryManagement.tsx
- **用户页面**: src/pages/Dashboard/Lottery.tsx
- **组件**: LotteryWheel.tsx (转盘动画)

## API 设计

### 用户端 API

#### GET /api/lottery/activities
获取可用的抽奖活动列表
```javascript
Response: {
  success: true,
  data: [{
    id: String,
    name: String,
    description: String,
    costPoints: Number,
    dailyLimit: Number,
    remainingDraws: Number,  // 今日剩余次数
    prizes: Array,
    isActive: Boolean
  }]
}
```

#### POST /api/lottery/draw/:activityId
参与抽奖
```javascript
Request: {
  activityId: String
}
Response: {
  success: true,
  data: {
    prize: {
      id: String,
      name: String,
      type: String,
      value: Number,
      image: String
    },
    record: {
      id: String,
      status: String
    }
  }
}
```

#### GET /api/lottery/records
获取我的抽奖记录
```javascript
Response: {
  success: true,
  data: {
    records: Array,
    pagination: Object
  }
}
```

#### POST /api/lottery/claim/:recordId
领取奖品
```javascript
Request: {
  recordId: String,
  shippingInfo: Object  // 实物奖品需要
}
Response: {
  success: true,
  message: String
}
```

### 管理端 API

#### GET /api/admin/lottery/activities
获取所有抽奖活动

#### POST /api/admin/lottery/activities
创建抽奖活动

#### PUT /api/admin/lottery/activities/:id
更新抽奖活动

#### DELETE /api/admin/lottery/activities/:id
删除抽奖活动

#### GET /api/admin/lottery/records
获取所有抽奖记录

#### PUT /api/admin/lottery/records/:id/status
更新记录状态（发货、作废等）

#### GET /api/admin/lottery/statistics/:activityId
获取活动统计数据

## 抽奖算法

### 加权随机算法
```javascript
function drawPrize(prizes) {
  // 1. 过滤有库存的奖品
  const availablePrizes = prizes.filter(p => 
    p.quantity === -1 || p.quantity > 0
  );
  
  // 2. 计算总概率
  const totalProbability = availablePrizes.reduce(
    (sum, p) => sum + p.probability, 0
  );
  
  // 3. 生成随机数
  const random = Math.random() * 100;
  
  // 4. 根据概率区间确定中奖奖品
  let cumulative = 0;
  for (const prize of availablePrizes) {
    cumulative += prize.probability;
    if (random <= cumulative) {
      return prize;
    }
  }
  
  // 5. 未中奖返回"谢谢参与"
  return thanksPrize;
}
```

## 数据库索引

### LotteryActivity
```javascript
{
  isActive: 1,
  startTime: 1,
  endTime: 1
}
```

### LotteryRecord
```javascript
{
  userId: 1,
  activityId: 1,
  createdAt: -1
}
{
  status: 1,
  createdAt: -1
}
```

## 前端组件设计

### LotteryWheel 转盘组件
```typescript
interface LotteryWheelProps {
  prizes: Prize[];
  onDraw: () => Promise<Prize>;
  costPoints: number;
  remainingDraws: number;
}
```

特性：
- CSS3 旋转动画
- 中奖结果展示
- 音效和视觉反馈
- 防止重复点击

### LotteryManagement 管理页面
功能模块：
1. 活动列表
2. 创建/编辑活动表单
3. 奖品配置
4. 抽奖记录查询
5. 统计报表

## 性能优化

1. **缓存策略**
   - 活动列表缓存 5 分钟
   - 用户抽奖次数缓存到 Redis

2. **并发控制**
   - 使用事务确保库存准确
   - 乐观锁防止超卖

3. **查询优化**
   - 分页加载记录
   - 索引优化查询

## 安全措施

1. **防刷机制**
   - IP 限制
   - 设备指纹
   - 验证码（可选）

2. **数据验证**
   - 服务端验证所有参数
   - 防止概率篡改
   - 防止库存负数

3. **审计日志**
   - 记录所有抽奖操作
   - 管理员操作日志
   - 异常行为监控
