# 余额、积分、佣金系统实施指南

## ✅ 已完成的核心功能

### 1. 数据模型（任务1）✅

**User模型** - 已添加commission字段
```javascript
commission: {
  type: Number,
  default: 0,
  index: true
}
```

**BalanceLog模型** - 已支持三种货币
```javascript
currency: {
  type: String,
  enum: ['points', 'balance', 'commission'],
  default: 'points'
},
relatedUserId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  default: null
}
```

### 2. 佣金计算服务（任务2）✅

**文件**: `server/services/commissionService.js`

**功能**:
- 自动计算推荐佣金（支持多级）
- 充值时自动触发
- 记录佣金日志

**使用方法**:
```javascript
const commissionService = require('./services/commissionService');
await commissionService.calculateCommission(user, order, 'points');
```

## 🚧 待实施的功能

### 任务3：佣金提现功能

#### 3.1 实现佣金提现到USDT

**文件**: `server/routes/withdraw.js`

**需要添加的路由**:
```javascript
router.post('/commission', authMiddleware, async (req, res) => {
  const { amount, type, address } = req.body;
  // type: 'usdt' 或 'balance'
  
  if (type === 'usdt') {
    // 创建USDT提现订单
    // 扣除佣金
    // 记录日志
  } else if (type === 'balance') {
    // 转入余额
    user.commission -= amount;
    user.balance += amount;
    // 记录日志
  }
});
```

#### 3.2 实现佣金转入余额

在上面的路由中已包含，当`type === 'balance'`时执行。

### 任务4：余额兑换积分功能

#### 4.1 实现余额兑换积分API

**文件**: `server/routes/user.js`

**已有基础代码**（需要验证）:
```javascript
router.post('/exchange-points', authMiddleware, async (req, res) => {
  const { amount } = req.body;
  const config = await SystemConfig.findOne();
  const rate = config.points.exchangeRate || 10;
  
  const cost = amount / rate;
  
  if (user.balance < cost) {
    return res.status(400).json({ message: '余额不足' });
  }
  
  user.balance -= cost;
  user.points += amount;
  await user.save();
  
  // 记录日志
});
```

### 任务5：商城页面开发

#### 5.1 创建商城主页

**文件**: `src/pages/Shop/Shop.tsx`

```typescript
import React from 'react';
import { Layout } from '../../components/Layout/Layout';
import { Coins, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Shop: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">商城</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            className="card cursor-pointer hover:shadow-lg"
            onClick={() => navigate('/shop/exchange')}
          >
            <Coins className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">余额兑换积分</h3>
            <p className="text-gray-600">使用余额兑换积分用于搜索</p>
          </div>
          
          {/* 其他商品 */}
        </div>
      </div>
    </Layout>
  );
};
```

#### 5.2 创建余额兑换积分页面

**文件**: `src/pages/Shop/ExchangePoints.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout/Layout';
import { userApi } from '../../utils/api';
import toast from 'react-hot-toast';

export const ExchangePoints: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState(10);
  const [user, setUser] = useState<any>(null);
  
  const cost = amount ? (parseInt(amount) / rate).toFixed(2) : '0.00';
  
  const handleExchange = async () => {
    try {
      const response = await userApi.exchangePoints(parseInt(amount));
      if (response.success) {
        toast.success(`成功兑换${amount}积分`);
        // 刷新用户数据
      }
    } catch (error: any) {
      toast.error(error.message || '兑换失败');
    }
  };
  
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">余额兑换积分</h1>
        
        <div className="card max-w-md">
          <div className="mb-4">
            <label>兑换数量</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field"
            />
          </div>
          
          <div className="bg-gray-50 p-4 rounded mb-4">
            <div>兑换汇率: 1元 = {rate}积分</div>
            <div>需要余额: ¥{cost}</div>
          </div>
          
          <button onClick={handleExchange} className="btn-primary w-full">
            确认兑换
          </button>
        </div>
      </div>
    </Layout>
  );
};
```

### 任务6：导航栏更新

**文件**: `src/components/Layout/Header.tsx`

在menuItems数组中添加：
```typescript
{ name: '商城', path: '/shop' }
```

### 任务7：Dashboard更新

**文件**: `src/pages/Dashboard/Dashboard.tsx`

更新stats数组：
```typescript
const stats = [
  {
    title: '积分',
    value: user?.points || 0,
    icon: Award,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  {
    title: '余额',
    value: `¥${(user?.balance || 0).toFixed(2)}`,
    icon: Wallet,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: '佣金',
    value: `¥${(user?.commission || 0).toFixed(2)}`,
    icon: Gift,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];
```

### 任务8：积分记录页面更新

**文件**: `src/pages/Dashboard/BalanceLogs.tsx`

更新getTypeInfo函数以支持commission类型：
```typescript
case 'commission':
  return { label: '推荐佣金', color: 'text-purple-600', icon: TrendingUp };
case 'commission_to_balance':
  return { label: '佣金转余额', color: 'text-blue-600', icon: RefreshCw };
```

### 任务10：API工具方法更新

**文件**: `src/utils/api.ts`

添加新的API方法：
```typescript
export const userApi = {
  // ... 现有方法
  
  async exchangePoints(amount: number) {
    return apiRequest('/api/user/exchange-points', {
      method: 'POST',
      body: JSON.stringify({ amount })
    });
  },
  
  async withdrawCommission(amount: number, type: string, address?: string) {
    return apiRequest('/api/withdraw/commission', {
      method: 'POST',
      body: JSON.stringify({ amount, type, address })
    });
  },
  
  async getCommissionLogs(page = 1, limit = 20) {
    return apiRequest(`/api/user/commission-logs?page=${page}&limit=${limit}`);
  }
};
```

## 📝 实施步骤

### 第一阶段：完成后端API（优先）

1. **佣金提现API** - 更新`server/routes/withdraw.js`
2. **余额兑换API** - 验证`server/routes/user.js`中的exchange-points路由
3. **佣金记录API** - 添加获取佣金记录的路由

### 第二阶段：创建前端页面

1. **商城主页** - 创建`src/pages/Shop/Shop.tsx`
2. **兑换页面** - 创建`src/pages/Shop/ExchangePoints.tsx`
3. **更新路由** - 在`src/App.tsx`中添加商城路由
4. **更新导航** - 在Header中添加商城菜单

### 第三阶段：更新现有页面

1. **Dashboard** - 显示三种货币
2. **BalanceLogs** - 支持显示佣金记录
3. **API工具** - 添加新的API方法

### 第四阶段：测试

1. 测试充值流程和佣金计算
2. 测试佣金提现
3. 测试余额兑换
4. 测试商城页面

## 🔧 配置说明

### SystemConfig配置项

确保以下配置存在：
```javascript
points: {
  exchangeRate: 10,  // 余额兑换积分汇率
  commissionRate: 15,  // 一级佣金比例
  secondLevelCommissionRate: 5,  // 二级佣金比例
  thirdLevelCommissionRate: 2,  // 三级佣金比例
  enableCommission: true,  // 启用佣金功能
  commissionLevels: 1,  // 佣金级别数
  minWithdrawAmount: 50,  // 最低提现金额
  withdrawFee: 5  // 提现手续费
}
```

## 🎯 快速开始

### 1. 测试已完成的功能

```bash
# 启动服务器
cd server
npm start

# 测试充值和佣金计算
# 1. 注册两个用户A和B
# 2. B使用A的推荐码注册
# 3. B充值积分
# 4. 检查A的commission字段是否增加
```

### 2. 继续开发

打开新的Kiro会话，告诉我：
"继续实施余额积分佣金系统，从任务3开始"

我会根据这个指南继续实施剩余功能。

## 📚 相关文档

- `requirements.md` - 需求文档
- `design.md` - 设计文档
- `tasks.md` - 任务列表
- `PROGRESS.md` - 进度跟踪

## ✨ 总结

已完成的核心功能：
- ✅ 三种货币的数据模型
- ✅ 推荐佣金自动计算
- ✅ 充值时自动发放佣金

待完成的功能：
- 🚧 佣金提现（后端API）
- 🚧 余额兑换（后端API）
- 🚧 商城页面（前端）
- 🚧 Dashboard更新（前端）
- 🚧 测试和文档

系统的核心逻辑已经实现，剩余的主要是API端点和前端页面的开发工作。
