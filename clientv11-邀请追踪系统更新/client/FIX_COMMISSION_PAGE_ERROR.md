# 修复佣金管理页面白屏错误

## 问题描述

用户点击"佣金管理"时，前端出现白屏，F12控制台报错：
```
Uncaught TypeError: Cannot read properties of undefined (reading 'filter')
at Commission (Commission.tsx:79:60)
```

## 问题原因

1. **数据结构不匹配**：前端期望的数据结构与后端返回的数据结构不一致
   - 前端期望：`{ commissionHistory: [], availableCommission: 0, ... }`
   - 后端返回：`{ commissions: [], totalCommission: 0, ... }`

2. **缺少空值检查**：当API返回数据异常时，`commissionHistory`可能为undefined，直接调用`.filter()`导致错误

3. **缺少用户佣金数据**：前端需要显示"可提现"金额，但只调用了`getCommissions()`，没有获取用户的当前佣金余额

## 修复方案

### 1. 添加类型定义和默认值
```typescript
const [commissionData, setCommissionData] = useState<{
  totalCommission: number;
  availableCommission: number;
  pendingCommission: number;
  totalWithdrawn: number;
  commissionHistory: any[];
}>({
  totalCommission: 0,
  availableCommission: 0,
  pendingCommission: 0,
  totalWithdrawn: 0,
  commissionHistory: []
});
```

### 2. 修复数据加载逻辑
```typescript
const loadCommissionData = async () => {
  try {
    // 同时获取佣金记录和用户信息
    const [commissionResponse, profileResponse] = await Promise.all([
      userApi.getCommissions() as any,
      userApi.getProfile() as any
    ]);

    if (commissionResponse?.success && profileResponse?.success) {
      const data = commissionResponse.data || {};
      const user = profileResponse.data?.user || {};
      
      setCommissionData({
        totalCommission: data.totalCommission || 0,
        availableCommission: user.commission || 0, // 从用户信息获取
        pendingCommission: data.pendingCommission || 0,
        totalWithdrawn: (data.totalCommission || 0) - (user.commission || 0),
        commissionHistory: Array.isArray(data.commissions) ? data.commissions : [] // 注意字段名
      });
    }
  } catch (error) {
    console.error('Failed to load commission data:', error);
    toast.error('加载佣金数据失败');
  } finally {
    setLoading(false);
  }
};
```

### 3. 添加安全的filter操作
```typescript
const filteredHistory = (commissionData.commissionHistory || []).filter((record: any) => {
  if (filter === 'all') return true;
  if (filter === 'income') return record.amount > 0;
  if (filter === 'withdraw') return record.amount < 0;
  return true;
});
```

### 4. 适配后端数据格式
后端返回的是BalanceLog格式，包含以下字段：
- `_id`: 记录ID
- `type`: 类型（commission）
- `amount`: 金额
- `description`: 描述
- `relatedUserId`: 关联用户ID
- `createdAt`: 创建时间

前端显示逻辑已调整为：
```typescript
<td className="py-3 px-4">
  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
    {record.description || '佣金收入'}
  </span>
</td>
<td className="py-3 px-4 text-gray-900">
  {record.relatedUserId ? '推荐用户' : '系统'}
</td>
<td className="py-3 px-4">
  <span className={`font-medium ${record.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
    {record.amount > 0 ? '+' : ''}¥{Math.abs(record.amount || 0).toFixed(2)}
  </span>
</td>
```

### 5. 简化筛选选项
由于后端数据没有status字段，将筛选选项改为：
- 全部
- 收入（amount > 0）
- 支出（amount < 0）

## 修复的文件

- `src/pages/Dashboard/Commission.tsx`

## 测试验证

✅ 页面不再白屏
✅ 正确显示佣金统计数据
✅ 正确显示佣金记录列表
✅ 筛选功能正常工作
✅ 错误处理完善（显示toast提示）

## 数据流程

1. 用户访问佣金管理页面
2. 前端同时调用两个API：
   - `GET /api/user/commissions` - 获取佣金记录
   - `GET /api/user/profile` - 获取用户当前佣金余额
3. 前端整合数据：
   - 总佣金 = 后端返回的totalCommission
   - 可提现 = 用户当前commission字段
   - 已提现 = 总佣金 - 可提现
   - 佣金记录 = 后端返回的commissions数组
4. 显示数据并支持筛选

## 注意事项

- 后端返回的字段名是`commissions`（复数），不是`commissionHistory`
- 需要从用户profile中获取当前可用佣金（`user.commission`）
- 所有数组操作前都要检查是否为数组类型
- 添加了错误提示，提升用户体验
