# 充值卡密购买功能

## 功能概述
在商城界面添加了充值卡密购买卡片，管理员可以在后台配置卡密的购买说明和购买链接。

## 实现内容

### 1. 后端实现

#### 数据模型 (server/models/SystemConfig.js)
在 SystemConfig 模型中添加了 `rechargeCard` 配置：
```javascript
rechargeCard: {
  enabled: Boolean,        // 是否启用
  title: String,          // 标题
  description: String,    // 描述
  purchaseUrl: String,    // 购买链接
  instructions: String    // 使用说明
}
```

#### API路由 (server/routes/systemConfig.js)
添加了两个新的API端点：
- `GET /api/system-config/recharge-card` - 获取卡密购买配置（公开）
- `PUT /api/system-config/recharge-card` - 更新卡密购买配置（管理员）

### 2. 前端实现

#### API调用 (src/utils/realApi.ts)
在 `systemConfigApi` 中添加了：
- `getRechargeCardConfig()` - 获取配置
- `updateRechargeCardConfig(config)` - 更新配置

#### 管理后台配置页面 (src/pages/Admin/RechargeCardConfig.tsx)
新建了卡密配置页面，管理员可以配置：
- 启用/禁用卡密购买功能
- 标题（最多100字符）
- 描述（最多500字符）
- 购买链接（最多500字符）
- 使用说明（最多2000字符，支持换行）
- 实时预览效果

#### 充值中心展示 (src/pages/Dashboard/RechargeCenter.tsx)
在卡密充值tab中添加了购买卡密卡片组件：
- 显示标题和描述
- 购买按钮（跳转到配置的购买链接）
- 购买说明（支持多行文本）
- 只有在管理员启用时才显示

#### 路由配置 (src/App.tsx)
添加了新路由：
- `/admin/recharge-card-config` - 卡密配置页面

#### 菜单配置 (src/components/Layout/AdminLayout.tsx)
在管理后台菜单中添加了"卡密配置"菜单项

## 使用流程

### 管理员配置
1. 登录管理后台
2. 进入"卡密配置"页面
3. 配置以下内容：
   - 启用卡密购买功能
   - 设置标题和描述
   - 填写购买链接（用户点击后跳转）
   - 编写使用说明（支持换行）
4. 查看预览效果
5. 保存配置

### 用户使用
1. 进入充值中心
2. 切换到"卡密充值"tab
3. 看到购买卡密卡片（如果管理员已启用）
4. 点击"购买卡密"按钮跳转到购买页面
5. 查看购买说明了解如何购买和使用
6. 购买后在下方输入卡密进行充值

## 配置示例

```javascript
{
  enabled: true,
  title: "充值卡密购买",
  description: "购买充值卡密，快速充值积分或开通VIP",
  purchaseUrl: "https://example.com/buy-card",
  instructions: "1. 点击购买链接\n2. 选择需要的卡密类型\n3. 完成支付后获取卡密\n4. 在充值页面输入卡密即可使用"
}
```

## 特性

✅ 管理员可完全控制卡密购买入口的显示
✅ 支持自定义标题、描述和购买链接
✅ 使用说明支持多行文本
✅ 实时预览配置效果
✅ 购买链接在新标签页打开
✅ 响应式设计，适配移动端

## 注意事项

1. 购买链接需要以 `http://` 或 `https://` 开头
2. 使用说明支持换行，每行一条说明
3. 关闭启用开关后，用户将看不到购买卡密卡片
4. 配置保存后立即生效，无需重启服务器
