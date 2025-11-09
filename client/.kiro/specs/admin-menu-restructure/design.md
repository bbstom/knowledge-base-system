# 管理后台菜单重构 - 设计文档

## 概述

本文档描述了如何将管理后台的菜单结构从扁平化改造为支持子菜单的层级结构，重点是将"网站配置"和"充值配置"整合到"系统设置"父级菜单下。

---

## 架构设计

### 组件层次结构

```
AdminLayout
├── TopNavBar (顶部导航栏)
├── Sidebar (侧边栏)
│   ├── MenuSection (菜单区域)
│   │   ├── MenuItem (普通菜单项)
│   │   └── MenuItemWithSubmenu (带子菜单的菜单项)
│   │       ├── MenuItemHeader (父级菜单头)
│   │       └── SubmenuList (子菜单列表)
│   │           └── SubmenuItem (子菜单项)
└── MainContent (主内容区)
```

### 数据结构

```typescript
interface MenuItem {
  title: string;
  icon: LucideIcon;
  path?: string;          // 普通菜单项有path
  exact?: boolean;
  submenu?: SubMenuItem[]; // 有子菜单则没有path
}

interface SubMenuItem {
  title: string;
  path: string;
  description?: string;   // 可选的描述文本
}

interface MenuState {
  expandedMenus: string[]; // 展开的菜单标题列表
}
```

---

## 组件设计

### 1. MenuItemWithSubmenu 组件

**职责**: 渲染带有子菜单的菜单项，处理展开/收起逻辑

**Props**:
```typescript
interface MenuItemWithSubmenuProps {
  item: MenuItem;
  isExpanded: boolean;
  onToggle: () => void;
  currentPath: string;
  onNavigate?: () => void; // 移动端导航后关闭侧边栏
}
```

**状态管理**:
- 展开状态由父组件 (AdminLayout) 管理
- 通过 `onToggle` 回调通知父组件状态变化

**渲染逻辑**:
```typescript
<div>
  {/* 父级菜单头 */}
  <button onClick={onToggle}>
    <Icon />
    <span>{title}</span>
    <ChevronIcon direction={isExpanded ? 'down' : 'right'} />
  </button>
  
  {/* 子菜单列表 - 使用动画展开/收起 */}
  <AnimatePresence>
    {isExpanded && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {submenu.map(subItem => (
          <SubmenuItem key={subItem.path} {...subItem} />
        ))}
      </motion.div>
    )}
  </AnimatePresence>
</div>
```

### 2. SubmenuItem 组件

**职责**: 渲染单个子菜单项

**Props**:
```typescript
interface SubmenuItemProps {
  title: string;
  path: string;
  description?: string;
  isActive: boolean;
  onClick?: () => void;
}
```

**样式特点**:
- 左侧缩进 16px
- 字体大小 13px (比父级小)
- 激活时使用浅蓝色背景
- Hover 时显示浅灰色背景

### 3. AdminLayout 状态管理

**状态**:
```typescript
const [sidebarOpen, setSidebarOpen] = useState(false);
const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
```

**初始化逻辑**:
```typescript
useEffect(() => {
  // 1. 从 localStorage 读取保存的状态
  const savedState = localStorage.getItem('adminMenuState');
  if (savedState) {
    const { expandedMenus } = JSON.parse(savedState);
    setExpandedMenus(expandedMenus);
  }
  
  // 2. 根据当前路由自动展开对应的父级菜单
  const currentMenu = findParentMenuByPath(location.pathname);
  if (currentMenu && !expandedMenus.includes(currentMenu.title)) {
    setExpandedMenus(prev => [...prev, currentMenu.title]);
  }
}, [location.pathname]);
```

**状态持久化**:
```typescript
useEffect(() => {
  // 防抖保存到 localStorage
  const timeoutId = setTimeout(() => {
    localStorage.setItem('adminMenuState', JSON.stringify({
      expandedMenus
    }));
  }, 300);
  
  return () => clearTimeout(timeoutId);
}, [expandedMenus]);
```

---

## 菜单配置

### 新的菜单数据结构

```typescript
const menuItems: MenuItem[] = [
  {
    title: '仪表盘',
    icon: LayoutDashboard,
    path: '/admin',
    exact: true
  },
  {
    title: '用户管理',
    icon: Users,
    path: '/admin/users'
  },
  {
    title: '内容管理',
    icon: Database,
    path: '/admin/content'
  },
  {
    title: '提现管理',
    icon: DollarSign,
    path: '/admin/withdraw'
  },
  {
    title: '工单管理',
    icon: MessageSquare,
    path: '/admin/tickets'
  },
  {
    title: '通知管理',
    icon: Bell,
    path: '/admin/notifications'
  },
  {
    title: '充值卡管理',
    icon: CreditCard,
    path: '/admin/recharge-cards'
  },
  {
    title: '系统设置',
    icon: Settings,
    submenu: [
      {
        title: '网站配置',
        path: '/admin/site-config',
        description: '网站基本信息、联系方式'
      },
      {
        title: '充值配置',
        path: '/admin/recharge-config',
        description: '充值套餐、支付方式'
      }
      // 预留扩展空间
      // {
      //   title: '系统参数',
      //   path: '/admin/system-params',
      //   description: '系统运行参数配置'
      // }
    ]
  }
];
```

---

## 样式设计

### 颜色方案

```css
/* 父级菜单 */
--parent-menu-bg: transparent;
--parent-menu-bg-hover: #f3f4f6;
--parent-menu-bg-active: #3b82f6;
--parent-menu-bg-expanded: #f9fafb;
--parent-menu-text: #374151;
--parent-menu-text-active: #ffffff;

/* 子菜单 */
--submenu-bg: #f9fafb;
--submenu-bg-hover: #f3f4f6;
--submenu-bg-active: #dbeafe;
--submenu-text: #6b7280;
--submenu-text-active: #2563eb;
--submenu-border-left: #e5e7eb;
```

### 父级菜单项样式

```css
.menu-item-parent {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
}

.menu-item-parent:hover {
  background-color: var(--parent-menu-bg-hover);
}

.menu-item-parent.expanded {
  background-color: var(--parent-menu-bg-expanded);
}

.menu-item-parent.active {
  background-color: var(--parent-menu-bg-active);
  color: var(--parent-menu-text-active);
}

.menu-item-parent .chevron {
  margin-left: auto;
  transition: transform 0.2s;
}

.menu-item-parent.expanded .chevron {
  transform: rotate(90deg);
}
```

### 子菜单样式

```css
.submenu-container {
  overflow: hidden;
  border-left: 2px solid var(--submenu-border-left);
  margin-left: 20px;
  margin-top: 4px;
}

.submenu-item {
  display: flex;
  flex-direction: column;
  padding: 8px 12px 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--submenu-text);
  transition: all 0.2s;
  cursor: pointer;
}

.submenu-item:hover {
  background-color: var(--submenu-bg-hover);
}

.submenu-item.active {
  background-color: var(--submenu-bg-active);
  color: var(--submenu-text-active);
  font-weight: 500;
}

.submenu-item-title {
  font-weight: 500;
}

.submenu-item-description {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}
```

---

## 动画设计

### 展开/收起动画

使用 `framer-motion` 实现流畅的动画：

```typescript
<motion.div
  initial={{ height: 0, opacity: 0 }}
  animate={{ height: 'auto', opacity: 1 }}
  exit={{ height: 0, opacity: 0 }}
  transition={{
    height: { duration: 0.2, ease: 'easeInOut' },
    opacity: { duration: 0.15, ease: 'easeInOut' }
  }}
  className="submenu-container"
>
  {/* 子菜单项 */}
</motion.div>
```

### 图标旋转动画

```css
.chevron-icon {
  transition: transform 0.2s ease-in-out;
}

.expanded .chevron-icon {
  transform: rotate(90deg);
}
```

---

## 路由处理

### 路由匹配逻辑

```typescript
// 检查当前路由是否匹配某个菜单项
function isMenuActive(menuItem: MenuItem, currentPath: string): boolean {
  if (menuItem.path) {
    return menuItem.exact 
      ? currentPath === menuItem.path
      : currentPath.startsWith(menuItem.path);
  }
  
  if (menuItem.submenu) {
    return menuItem.submenu.some(sub => 
      currentPath.startsWith(sub.path)
    );
  }
  
  return false;
}

// 查找包含当前路由的父级菜单
function findParentMenuByPath(path: string): MenuItem | null {
  return menuItems.find(item => 
    item.submenu?.some(sub => path.startsWith(sub.path))
  ) || null;
}
```

### 自动展开逻辑

```typescript
useEffect(() => {
  const parentMenu = findParentMenuByPath(location.pathname);
  
  if (parentMenu && !expandedMenus.includes(parentMenu.title)) {
    setExpandedMenus(prev => [...prev, parentMenu.title]);
  }
}, [location.pathname]);
```

---

## 移动端适配

### 响应式行为

1. **侧边栏打开时**:
   - 点击父级菜单 → 展开/收起子菜单
   - 点击子菜单项 → 导航并关闭侧边栏

2. **触摸优化**:
   - 增加点击区域（最小 44x44px）
   - 使用 `touch-action: manipulation` 避免双击缩放

```css
@media (max-width: 1024px) {
  .menu-item-parent,
  .submenu-item {
    min-height: 44px;
    touch-action: manipulation;
  }
}
```

---

## 无障碍设计

### ARIA 属性

```tsx
<button
  onClick={handleToggle}
  aria-expanded={isExpanded}
  aria-label={`${title} 菜单，${isExpanded ? '已展开' : '已收起'}`}
  aria-controls={`submenu-${title}`}
>
  {/* 菜单内容 */}
</button>

<div
  id={`submenu-${title}`}
  role="menu"
  aria-label={`${title} 子菜单`}
>
  {submenu.map(item => (
    <Link
      key={item.path}
      to={item.path}
      role="menuitem"
      aria-current={isActive ? 'page' : undefined}
    >
      {item.title}
    </Link>
  ))}
</div>
```

### 键盘导航

```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault();
      handleToggle();
      break;
    case 'ArrowDown':
      // 聚焦到下一个菜单项
      break;
    case 'ArrowUp':
      // 聚焦到上一个菜单项
      break;
  }
};
```

---

## 性能优化

### 1. 防抖保存

```typescript
const debouncedSave = useMemo(
  () => debounce((state: MenuState) => {
    localStorage.setItem('adminMenuState', JSON.stringify(state));
  }, 300),
  []
);

useEffect(() => {
  debouncedSave({ expandedMenus });
}, [expandedMenus, debouncedSave]);
```

### 2. 条件渲染

```typescript
// 只渲染展开的子菜单
{isExpanded && (
  <AnimatePresence>
    <SubmenuList items={submenu} />
  </AnimatePresence>
)}
```

### 3. 记忆化

```typescript
const activeParentMenu = useMemo(
  () => findParentMenuByPath(location.pathname),
  [location.pathname]
);
```

---

## 错误处理

### localStorage 不可用

```typescript
function saveMenuState(state: MenuState) {
  try {
    localStorage.setItem('adminMenuState', JSON.stringify(state));
  } catch (error) {
    console.warn('无法保存菜单状态:', error);
    // 优雅降级：仅在内存中保持状态
  }
}

function loadMenuState(): MenuState | null {
  try {
    const saved = localStorage.getItem('adminMenuState');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('无法加载菜单状态:', error);
    return null;
  }
}
```

---

## 测试策略

### 单元测试

1. **菜单状态管理**
   - 测试展开/收起逻辑
   - 测试状态持久化
   - 测试路由匹配

2. **组件渲染**
   - 测试子菜单正确渲染
   - 测试激活状态正确显示
   - 测试动画正常工作

### 集成测试

1. **导航流程**
   - 点击父级菜单展开子菜单
   - 点击子菜单项导航到对应页面
   - 刷新页面后状态保持

2. **移动端测试**
   - 侧边栏打开/关闭
   - 子菜单展开/收起
   - 导航后侧边栏关闭

### E2E 测试

使用 Playwright 测试完整用户流程：

```typescript
test('管理员可以通过子菜单导航到网站配置', async ({ page }) => {
  await page.goto('/admin');
  await page.click('text=系统设置');
  await expect(page.locator('text=网站配置')).toBeVisible();
  await page.click('text=网站配置');
  await expect(page).toHaveURL('/admin/site-config');
});
```

---

## 迁移计划

### 阶段1: 准备工作
- 创建新的菜单组件
- 更新类型定义
- 准备测试用例

### 阶段2: 实现核心功能
- 实现 MenuItemWithSubmenu 组件
- 实现状态管理
- 实现动画效果

### 阶段3: 集成和测试
- 集成到 AdminLayout
- 运行测试套件
- 修复发现的问题

### 阶段4: 优化和发布
- 性能优化
- 无障碍优化
- 文档更新

---

## 依赖项

### 新增依赖

```json
{
  "framer-motion": "^10.16.0"  // 用于动画效果
}
```

### 现有依赖

- react-router-dom (导航)
- lucide-react (图标)
- tailwindcss (样式)

---

## 风险和缓解

### 风险1: 动画性能问题
**缓解**: 使用 CSS transform 和 opacity，避免触发 reflow

### 风险2: localStorage 配额限制
**缓解**: 只保存必要的状态，定期清理旧数据

### 风险3: 浏览器兼容性
**缓解**: 使用 polyfill，提供降级方案

---

**创建日期**: 2025-10-22  
**状态**: 待审核
