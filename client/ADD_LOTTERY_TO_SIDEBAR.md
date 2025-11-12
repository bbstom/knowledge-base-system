# 添加抽奖中心到用户侧边栏

## 修改文件: `src/components/Layout/Sidebar.tsx`

### 步骤1: 导入Gift图标

**在文件顶部，找到图标导入行**：
```typescript
import { X, Home, Database, User, BarChart3, Users, CreditCard, MessageSquare, Wallet, ShoppingBag, Receipt } from 'lucide-react';
```

**添加 Gift 图标**：
```typescript
import { X, Home, Database, User, BarChart3, Users, CreditCard, MessageSquare, Wallet, ShoppingBag, Receipt, Gift } from 'lucide-react';
```

---

### 步骤2: 在navigation数组中添加抽奖中心

**找到 navigation 数组**（大约在第12行）：
```typescript
const navigation = [
  { name: '概览', href: '/dashboard', icon: Home },
  { name: '商城', href: '/shop', icon: ShoppingBag },
  { name: '订单中心', href: '/dashboard/orders', icon: Receipt },
  { name: '搜索历史', href: '/dashboard/history', icon: Database },
  { name: '充值中心', href: '/dashboard/recharge-center', icon: Wallet },
  { name: '推荐奖励', href: '/dashboard/referral', icon: Users },
  { name: '佣金管理', href: '/dashboard/commission', icon: CreditCard },
  { name: '积分中心', href: '/dashboard/points', icon: BarChart3 },
  { name: '在线工单', href: '/dashboard/tickets', icon: MessageSquare },
  { name: '个人资料', href: '/dashboard/profile', icon: User },
];
```

**在"在线工单"和"个人资料"之间添加抽奖中心**：
```typescript
const navigation = [
  { name: '概览', href: '/dashboard', icon: Home },
  { name: '商城', href: '/shop', icon: ShoppingBag },
  { name: '订单中心', href: '/dashboard/orders', icon: Receipt },
  { name: '搜索历史', href: '/dashboard/history', icon: Database },
  { name: '充值中心', href: '/dashboard/recharge-center', icon: Wallet },
  { name: '推荐奖励', href: '/dashboard/referral', icon: Users },
  { name: '佣金管理', href: '/dashboard/commission', icon: CreditCard },
  { name: '积分中心', href: '/dashboard/points', icon: BarChart3 },
  { name: '在线工单', href: '/dashboard/tickets', icon: MessageSquare },
  { name: '抽奖中心', href: '/dashboard/lottery', icon: Gift },
  { name: '个人资料', href: '/dashboard/profile', icon: User },
];
```

---

## 完整的修改后代码

```typescript
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Home, Database, User, BarChart3, Users, CreditCard, MessageSquare, Wallet, ShoppingBag, Receipt, Gift } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: '概览', href: '/dashboard', icon: Home },
    { name: '商城', href: '/shop', icon: ShoppingBag },
    { name: '订单中心', href: '/dashboard/orders', icon: Receipt },
    { name: '搜索历史', href: '/dashboard/history', icon: Database },
    { name: '充值中心', href: '/dashboard/recharge-center', icon: Wallet },
    { name: '推荐奖励', href: '/dashboard/referral', icon: Users },
    { name: '佣金管理', href: '/dashboard/commission', icon: CreditCard },
    { name: '积分中心', href: '/dashboard/points', icon: BarChart3 },
    { name: '在线工单', href: '/dashboard/tickets', icon: MessageSquare },
    { name: '抽奖中心', href: '/dashboard/lottery', icon: Gift },
    { name: '个人资料', href: '/dashboard/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:ml-4 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            用户中心
          </h2>
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-4 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-500"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};
```

---

## 删除顶部导航栏的抽奖链接

### 修改文件: `src/components/Layout/Header.tsx`

**查找并删除抽奖相关的导航链接**

如果在Header.tsx中有类似这样的代码：
```typescript
<Link to="/dashboard/lottery">抽奖</Link>
```

**删除它**，因为抽奖只在用户中心侧边栏显示。

---

## 测试步骤

1. 保存修改后的文件
2. 刷新浏览器
3. 登录用户账号
4. 访问任何用户中心页面（如 `/dashboard`）
5. 应该在左侧边栏看到"抽奖中心"菜单项
6. 点击"抽奖中心"应该跳转到 `/dashboard/lottery`

---

## 效果预览

侧边栏菜单顺序：
1. 概览
2. 商城
3. 订单中心
4. 搜索历史
5. 充值中心
6. 推荐奖励
7. 佣金管理
8. 积分中心
9. 在线工单
10. **🎁 抽奖中心** ← 新增
11. 个人资料

---

## 完成！

修改完成后，用户可以通过侧边栏访问抽奖中心，顶部导航栏不再显示抽奖链接。
