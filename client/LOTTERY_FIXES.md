# 抽奖系统问题修复

## 问题1: API endpoint not found ✅

### 原因
前端API路径错误：
- 前端调用: `/api/admin/lottery/activities`
- 实际路径: `/api/lottery/admin/activities`

### 解决方案
修改 `src/utils/adminApi.ts` 中的所有抽奖API路径：
```typescript
// 修改前
'/api/admin/lottery/activities'

// 修改后
'/api/lottery/admin/activities'
```

## 问题2: 奖品配置输入框说明不清 ✅

### 原因
奖品配置有3个数值输入框，没有标签说明：
1. 价值（积分数/VIP天数）
2. 库存数量（-1表示无限）
3. 中奖概率（百分比）

### 解决方案
改进 `src/pages/Admin/LotteryManagement.tsx` 的奖品配置界面：
- ✅ 添加清晰的标签
- ✅ 根据奖品类型动态显示标签（积分数/VIP天数/价值）
- ✅ 添加占位符提示
- ✅ 添加 title 属性说明
- ✅ 改进布局，使用网格布局

### 奖品配置字段说明

| 字段 | 说明 | 示例 |
|------|------|------|
| 奖品名称 | 显示给用户的名称 | "100积分"、"7天VIP" |
| 奖品类型 | 积分/VIP天数/优惠券/实物/谢谢参与 | 积分 |
| 价值 | 积分数量或VIP天数 | 100（积分）、7（天数） |
| 库存数量 | 奖品总数量，-1表示无限 | 100、-1 |
| 中奖概率 | 百分比，所有奖品总和≤100% | 10（表示10%） |

## 问题3: 只有充值过的用户才能抽奖 ✅

### 实现方案
修改 `server/services/lotteryService.js`，在抽奖前检查用户充值记录：

```javascript
// 检查是否充值过
if (!user.totalRecharged || user.totalRecharged <= 0) {
  throw new Error('仅限充值用户参与抽奖');
}
```

### 前端优化
修改 `src/pages/Dashboard/Lottery.tsx`，显示友好的错误提示：
```typescript
if (response.message?.includes('充值用户')) {
  toast.error('仅限充值用户参与抽奖，请先充值！', { duration: 4000 });
}
```

## 📝 使用说明

### 创建抽奖活动示例

1. **基本信息**
   - 活动名称: "新年抽奖"
   - 消耗积分: 100
   - 每日限制: 5次（0=无限制）
   - 活动时间: 设置开始和结束日期

2. **奖品配置**
   ```
   奖品1:
   - 名称: "500积分"
   - 类型: 积分
   - 积分数: 500
   - 库存: 10
   - 概率: 5%

   奖品2:
   - 名称: "7天VIP"
   - 类型: VIP天数
   - VIP天数: 7
   - 库存: 5
   - 概率: 3%

   奖品3:
   - 名称: "谢谢参与"
   - 类型: 谢谢参与
   - 价值: 0
   - 库存: -1（无限）
   - 概率: 92%
   ```

3. **概率设置建议**
   - 总概率应该 = 100%
   - 建议中奖率: 5-15%
   - "谢谢参与"概率: 85-95%

## 🔧 测试步骤

1. **管理员创建活动**
   - 访问 /admin/lottery
   - 点击"添加活动"
   - 填写信息并配置奖品
   - 保存（应该成功）

2. **用户参与抽奖**
   - 访问 /dashboard/lottery
   - 查看可用活动
   - 点击"立即抽奖"
   - 如果未充值，显示提示
   - 如果已充值，正常抽奖

3. **验证权限**
   - 未充值用户: 提示"仅限充值用户参与"
   - 已充值用户: 可以正常抽奖

## ✅ 修改的文件

1. `src/utils/adminApi.ts` - 修复API路径
2. `src/pages/Admin/LotteryManagement.tsx` - 改进奖品配置界面
3. `server/services/lotteryService.js` - 添加充值检查
4. `src/pages/Dashboard/Lottery.tsx` - 优化错误提示

---

修复完成时间: 2025-11-11
状态: ✅ 所有问题已解决
