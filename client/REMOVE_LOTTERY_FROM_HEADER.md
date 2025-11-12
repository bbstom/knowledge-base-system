# 从顶部导航栏删除抽奖中心链接

## 问题
顶部导航栏显示"抽奖中心"链接，但我们只需要在用户中心侧边栏显示。

## 修改文件: `src/components/Layout/Header.tsx`

### 找到并删除以下代码

**位置**: 大约在第141-147行

**要删除的代码**:
```tsx
<Link
  to="/dashboard/lottery"
  className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
>
  抽奖中心
</Link>
```

### 完整的修改前后对比

**修改前** (第134-149行):
```tsx
{isAuthenticated() && (
  <>
    <Link
      to="/dashboard"
      className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
    >
      {t('nav.dashboard')}
    </Link>
    <Link
      to="/dashboard/lottery"
      className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
    >
      抽奖中心
    </Link>
  </>
)}
```

**修改后**:
```tsx
{isAuthenticated() && (
  <Link
    to="/dashboard"
    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
  >
    {t('nav.dashboard')}
  </Link>
)}
```

---

## 完整修改步骤

1. 打开文件 `src/components/Layout/Header.tsx`
2. 找到第134行附近的代码
3. 删除整个抽奖中心的 `<Link>` 标签（第141-147行）
4. 同时删除外层的 `<>` 和 `</>`，因为只剩一个Link了
5. 保存文件
6. 刷新浏览器（Ctrl+F5 强制刷新）

---

## 修改后的完整导航部分

```tsx
{/* Navigation */}
<nav className="hidden md:flex space-x-8">
  <Link
    to="/"
    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
  >
    {t('nav.home')}
  </Link>
  <Link
    to="/search"
    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
  >
    {t('nav.search')}
  </Link>
  <Link
    to="/databases"
    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
  >
    {t('nav.databases')}
  </Link>
  <Link
    to="/faq"
    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
  >
    {t('nav.faq')}
  </Link>
  <Link
    to="/hot-topics"
    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
  >
    {t('nav.hotTopics')}
  </Link>
  {isAuthenticated() && (
    <Link
      to="/dashboard"
      className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
    >
      {t('nav.dashboard')}
    </Link>
  )}
</nav>
```

---

## 验证修改

修改完成后：

1. **顶部导航栏**应该显示：
   - 首页
   - 搜索
   - 数据库
   - FAQ
   - 热门话题
   - 用户中心（登录后）
   - ❌ 不再显示"抽奖中心"

2. **用户中心侧边栏**应该显示：
   - 概览
   - 商城
   - 订单中心
   - 搜索历史
   - 充值中心
   - 推荐奖励
   - 佣金管理
   - 积分中心
   - 在线工单
   - ✅ 抽奖中心（新增）
   - 个人资料

---

## 注意事项

1. **清除浏览器缓存**: 修改后按 Ctrl+F5 强制刷新
2. **检查移动端**: 在移动端视图也不应该显示抽奖链接
3. **确认侧边栏**: 确保侧边栏已经添加了抽奖中心入口

---

## 完成！

修改完成后，抽奖中心只会在用户中心侧边栏显示，顶部导航栏不再显示。
