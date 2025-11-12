# 抽奖系统需求文档

## 功能概述
实现一个完整的抽奖系统，管理员可以创建和管理抽奖活动，用户可以参与抽奖。

## 核心功能

### 1. 管理员功能
- 创建抽奖活动
- 设置奖品（名称、数量、中奖概率、奖品类型）
- 设置抽奖规则（消耗积分、每日次数限制、活动时间）
- 查看抽奖记录和统计
- 手动开奖/作废中奖记录
- 启用/禁用抽奖活动

### 2. 用户功能
- 查看可用的抽奖活动
- 消耗积分参与抽奖
- 查看中奖记录
- 领取奖品（积分、VIP天数等）

### 3. 奖品类型
- 积分奖励
- VIP天数
- 优惠券
- 实物奖品（需要填写收货信息）
- 谢谢参与

## 数据模型

### LotteryActivity（抽奖活动）
```javascript
{
  name: String,              // 活动名称
  description: String,       // 活动描述
  costPoints: Number,        // 每次抽奖消耗积分
  dailyLimit: Number,        // 每日抽奖次数限制（0=无限制）
  startTime: Date,           // 活动开始时间
  endTime: Date,             // 活动结束时间
  isActive: Boolean,         // 是否启用
  prizes: [{                 // 奖品列表
    name: String,            // 奖品名称
    type: String,            // 类型：points/vip/coupon/physical/thanks
    value: Number,           // 奖品价值（积分数/VIP天数等）
    quantity: Number,        // 奖品数量（-1=无限）
    probability: Number,     // 中奖概率（0-100）
    image: String,           // 奖品图片
    description: String      // 奖品描述
  }],
  totalDraws: Number,        // 总抽奖次数
  totalWinners: Number,      // 总中奖人数
  createdBy: ObjectId,       // 创建者
  createdAt: Date,
  updatedAt: Date
}
```

### LotteryRecord（抽奖记录）
```javascript
{
  userId: ObjectId,          // 用户ID
  activityId: ObjectId,      // 活动ID
  prizeId: String,           // 奖品ID
  prizeName: String,         // 奖品名称
  prizeType: String,         // 奖品类型
  prizeValue: Number,        // 奖品价值
  status: String,            // 状态：pending/claimed/expired/cancelled
  costPoints: Number,        // 消耗积分
  claimedAt: Date,           // 领取时间
  shippingInfo: {            // 收货信息（实物奖品）
    name: String,
    phone: String,
    address: String
  },
  createdAt: Date
}
```

## 业务规则

### 抽奖规则
1. 用户必须有足够的积分才能参与
2. 检查每日抽奖次数限制
3. 检查活动是否在有效期内
4. 检查奖品库存是否充足
5. 根据概率随机抽取奖品

### 概率计算
- 所有奖品概率总和应该 ≤ 100%
- 如果总和 < 100%，剩余概率为"谢谢参与"
- 使用加权随机算法确保公平性

### 奖品发放
- 积分奖励：自动发放到用户账户
- VIP天数：自动延长用户VIP
- 优惠券：生成优惠券码
- 实物奖品：需要用户填写收货信息，管理员确认发货

## 安全考虑
1. 防止刷奖：每日次数限制、IP限制
2. 防止作弊：服务端计算中奖结果
3. 记录审计：所有抽奖记录可追溯
4. 库存控制：实时更新奖品库存

## UI/UX
- 抽奖动画效果（转盘/九宫格/老虎机）
- 中奖提示和庆祝动画
- 奖品展示和规则说明
- 抽奖记录查询

## 统计报表
- 活动参与人数
- 中奖率统计
- 奖品发放统计
- 积分消耗统计
