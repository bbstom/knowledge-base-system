# 抽奖动画类型支持 ✅

## 功能说明

抽奖系统现在支持两种动画类型，可以在管理后台为每个活动单独设置：

### 1. 老虎机模式（slot）
- 经典的老虎机滚动动画
- 三个滚轮同时滚动
- 最终停在中奖奖品上
- 适合快节奏的抽奖体验

### 2. 转盘模式（wheel）
- 大转盘旋转动画
- 指针指向中奖奖品
- 视觉效果更华丽
- 适合重要活动和大奖抽取

## 技术实现

### 动画类型判断
```typescript
{currentActivity.animationType === 'wheel' ? (
  // 显示转盘
  <LotteryWheel ... />
) : (
  // 显示老虎机（默认）
  <SlotMachine ... />
)}
```

### 转盘组件增强
- 添加了 `targetPrize` 属性
- 支持指定中奖奖品
- 转盘会自动停在指定的奖品位置

### 抽奖流程
1. 用户点击"立即抽奖"按钮
2. 前端调用后端API获取抽奖结果
3. 根据活动的 `animationType` 显示对应动画
4. 动画结束后显示中奖结果

## 管理后台设置

在管理后台的抽奖管理页面：
1. 创建或编辑抽奖活动
2. 选择"动画类型"字段
3. 可选择：
   - `slot` - 老虎机
   - `wheel` - 转盘
4. 保存后前端会自动使用对应的动画

## 组件接口

### SlotMachine 组件
```typescript
interface SlotMachineProps {
  prizes: Prize[];
  result: Prize | null;
  isSpinning: boolean;
  onComplete: () => void;
  onStartDraw?: () => void;
  showStartButton?: boolean;
}
```

### LotteryWheel 组件
```typescript
interface LotteryWheelProps {
  prizes: Prize[];
  onComplete: (prize: Prize) => void;
  isSpinning: boolean;
  targetPrize?: Prize | null; // 指定的中奖奖品
}
```

## 奖品数据结构

```typescript
interface Prize {
  name: string;        // 奖品名称
  type: string;        // 奖品类型：points/vip/coupon/physical/thanks
  value: number;       // 奖品价值
  probability: number; // 中奖概率（转盘需要）
  color?: string;      // 显示颜色（转盘自动分配）
}
```

## 使用示例

### 创建老虎机活动
```javascript
{
  name: "每日签到抽奖",
  animationType: "slot",
  prizes: [
    { name: "10积分", type: "points", value: 10, probability: 30 },
    { name: "谢谢参与", type: "thanks", value: 0, probability: 70 }
  ]
}
```

### 创建转盘活动
```javascript
{
  name: "周年庆大转盘",
  animationType: "wheel",
  prizes: [
    { name: "100积分", type: "points", value: 100, probability: 10 },
    { name: "50积分", type: "points", value: 50, probability: 20 },
    { name: "10积分", type: "points", value: 10, probability: 30 },
    { name: "谢谢参与", type: "thanks", value: 0, probability: 40 }
  ]
}
```

## 注意事项

1. **默认类型**：如果活动没有设置 `animationType`，默认使用老虎机模式
2. **奖品数量**：转盘建议4-8个奖品，老虎机建议3-6个奖品
3. **扇区分配**：转盘的所有奖品扇区平均分配，不根据中奖概率调整大小
4. **颜色分配**：转盘会自动为奖品分配不同的颜色
5. **动画时长**：转盘动画约4秒，老虎机动画约3秒
6. **活动展示**：活动卡片只显示奖品数量，不显示具体奖品列表

## 文件变更

- ✅ `src/pages/Dashboard/Lottery.tsx` - 添加动画类型判断
- ✅ `src/components/LotteryWheel.tsx` - 支持指定中奖奖品
- ✅ `src/components/SlotMachine.tsx` - 保持不变

## 测试建议

1. 在管理后台创建两个活动，分别设置不同的动画类型
2. 在前端抽奖页面选择不同的活动
3. 验证显示的动画类型是否正确
4. 测试抽奖流程是否正常
5. 检查中奖结果是否准确显示
