# 订单中心功能完成

## 功能概述

新增了一个综合的订单中心页面，用户可以查看所有的消费和订单情况。

## 功能特性

### 1. 统计卡片
- **总充值**：显示用户累计充值金额
- **总消费**：显示用户累计消费积分
- **总提现**：显示用户累计提现金额
- **订单数**：显示充值订单总数

### 2. 三个标签页

#### 充值记录
- 订单号
- 订单类型（积分充值/VIP充值）
- 充值金额
- 获得内容（积分数/VIP天数）
- 订单状态（待支付/已完成/已过期）
- 创建时间

#### 消费记录
- 搜索类型
- 查询内容
- 消耗积分
- 结果数量
- 搜索时间

#### 提现记录
- 提现金额
- 钱包地址
- 提现状态（处理中/已完成/已拒绝）
- 申请时间

### 3. 状态标识
- 待支付：黄色标签 + 时钟图标
- 已完成：绿色标签 + 对勾图标
- 已过期：灰色标签 + 叉号图标
- 处理中：蓝色标签 + 刷新图标
- 已拒绝：红色标签 + 叉号图标

## 文件结构

```
src/pages/Dashboard/
  └── Orders.tsx          # 订单中心页面

src/components/Layout/
  └── Sidebar.tsx         # 侧边栏（已更新）

src/
  └── App.tsx            # 路由配置（已更新）
```

## 路由配置

```typescript
// 新增路由
<Route path="/dashboard/orders" element={<Orders />} />
```

## 侧边栏导航

```typescript
{ name: '订单中心', href: '/dashboard/orders', icon: Receipt }
```

## API端点使用

### 充值记录
```
GET /api/recharge/history/:userId?page=1&limit=50
```

### 搜索记录
```
通过 userApi.getSearchHistory(1, 50)
```

### 提现记录
```
GET /api/withdraw/history?page=1&limit=50
```

## 页面特性

### 响应式设计
- 移动端友好的表格布局
- 自适应的统计卡片网格
- 平滑的标签切换动画

### 用户体验
- 加载状态显示
- 空状态提示
- 错误提示（toast）
- 自动刷新数据

### 数据展示
- 格式化的日期时间
- 简化的钱包地址显示
- 彩色的状态标签
- 清晰的数据分类

## 使用方法

### 访问订单中心
1. 登录系统
2. 点击侧边栏"订单中心"
3. 查看各类订单记录

### 切换标签
- 点击"充值记录"查看充值订单
- 点击"消费记录"查看搜索历史
- 点击"提现记录"查看提现申请

### 查看统计
- 页面顶部显示四个统计卡片
- 实时更新统计数据
- 根据当前标签页动态计算

## 数据流程

```
用户访问页面
    ↓
加载用户信息
    ↓
根据当前标签加载数据
    ↓
├─ 充值记录：GET /api/recharge/history/:userId
├─ 消费记录：userApi.getSearchHistory()
└─ 提现记录：GET /api/withdraw/history
    ↓
计算统计数据
    ↓
显示在页面上
```

## 状态管理

```typescript
const [activeTab, setActiveTab] = useState<'recharge' | 'search' | 'withdraw'>('recharge');
const [rechargeOrders, setRechargeOrders] = useState<Order[]>([]);
const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);
const [withdrawRecords, setWithdrawRecords] = useState<WithdrawRecord[]>([]);
const [loading, setLoading] = useState(true);
const [stats, setStats] = useState({
  totalRecharge: 0,
  totalSearch: 0,
  totalWithdraw: 0,
  orderCount: 0
});
```

## 样式特性

### 深色模式支持
- 所有组件支持深色模式
- 自动适配系统主题
- 平滑的主题切换

### 图标系统
- 使用lucide-react图标库
- 统一的图标风格
- 语义化的图标选择

### 颜色方案
- 蓝色：充值相关
- 紫色：消费相关
- 绿色：成功/完成状态
- 黄色：待处理状态
- 红色：失败/拒绝状态
- 橙色：提现相关

## 扩展功能建议

### 1. 筛选和搜索
```typescript
// 可以添加日期范围筛选
const [dateRange, setDateRange] = useState({ start: '', end: '' });

// 可以添加状态筛选
const [statusFilter, setStatusFilter] = useState('all');

// 可以添加搜索功能
const [searchQuery, setSearchQuery] = useState('');
```

### 2. 导出功能
```typescript
// 导出为CSV
const exportToCSV = () => {
  // 实现导出逻辑
};

// 导出为PDF
const exportToPDF = () => {
  // 实现导出逻辑
};
```

### 3. 分页功能
```typescript
// 添加分页
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

// 加载更多
const loadMore = () => {
  setCurrentPage(prev => prev + 1);
};
```

### 4. 订单详情弹窗
```typescript
// 点击订单查看详情
const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
const [showDetailModal, setShowDetailModal] = useState(false);
```

## 测试建议

### 功能测试
1. 测试充值记录显示
2. 测试消费记录显示
3. 测试提现记录显示
4. 测试标签切换
5. 测试统计数据计算
6. 测试空状态显示
7. 测试加载状态
8. 测试错误处理

### 边界测试
1. 无订单数据
2. 大量订单数据
3. 网络错误
4. 未登录状态
5. 权限不足

### 性能测试
1. 大数据量加载
2. 频繁切换标签
3. 并发请求处理

## 总结

✅ 创建了订单中心页面
✅ 集成了充值、消费、提现记录
✅ 添加了统计卡片
✅ 实现了标签切换
✅ 添加了状态标识
✅ 更新了侧边栏导航
✅ 配置了路由
✅ 支持深色模式
✅ 响应式设计

用户现在可以在一个页面中查看所有的订单和消费历史，方便管理和追踪！
