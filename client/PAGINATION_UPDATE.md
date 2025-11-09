# 分页设置统一更新

**更新时间**: 2025-10-22  
**状态**: ✅ 完成

---

## 📋 更新内容

### 统一分页设置
- **每页显示行数**: 20行 → **15行**
- **适用范围**: 前端和后端所有表格

---

## 📦 新增配置文件

### 后端配置
**文件**: `server/config/pagination.js`
```javascript
module.exports = {
  PAGE_SIZE: 15,           // 每页显示15行
  DEFAULT_PAGE: 1,         // 默认第1页
  MAX_PAGE_SIZE: 100       // 最大每页100行
};
```

### 前端配置
**文件**: `src/config/pagination.ts`
```typescript
export const PAGINATION_CONFIG = {
  PAGE_SIZE: 15,                          // 每页显示15行
  DEFAULT_PAGE: 1,                        // 默认第1页
  PAGE_SIZE_OPTIONS: [10, 15, 20, 50, 100]  // 可选项
};
```

---

## 🔧 修改的文件

### 后端 (9个文件)
1. ✅ `server/config/pagination.js` - 新增配置文件
2. ✅ `server/services/rechargeCardService.js` - 充值卡服务
3. ✅ `server/routes/user.js` - 用户路由（3处）
   - 搜索历史
   - 余额日志
   - 积分历史
   - 佣金记录
4. ✅ `server/routes/rechargeCard.js` - 充值卡路由
5. ✅ `server/routes/withdraw.js` - 提现路由
6. ✅ `server/routes/recharge.js` - 充值路由
7. ✅ `server/routes/notification.js` - 通知路由
8. ✅ `server/routes/content.js` - 内容路由

### 前端 (3个文件)
1. ✅ `src/config/pagination.ts` - 新增配置文件
2. ✅ `src/pages/Admin/RechargeCardManagement.tsx` - 充值卡管理
3. ✅ `src/pages/Dashboard/Orders.tsx` - 订单中心（2处）
   - 充值订单
   - 提现订单

---

## 📊 影响的功能

### 管理后台
- ✅ 充值卡管理 - 每页15条
- ✅ 通知管理 - 每页15条
- ✅ 内容管理 - 每页15条

### 用户中心
- ✅ 订单中心（充值） - 每页15条
- ✅ 订单中心（提现） - 每页15条
- ✅ 搜索历史 - 每页15条
- ✅ 余额日志 - 每页15条
- ✅ 积分历史 - 每页15条
- ✅ 佣金记录 - 每页15条

---

## 🎯 效果

### 之前
```
每页显示: 10-50行不等（不统一）
- 有的10行
- 有的20行
- 有的50行
- 有的100行
```

### 现在
```
每页显示: 统一15行
- 所有表格都是15行
- 超出部分自动分页
- 可以通过翻页查看更多
```

---

## 💡 优势

### 1. 统一体验
- ✅ 所有表格显示行数一致
- ✅ 用户体验更统一
- ✅ 界面更整洁

### 2. 性能优化
- ✅ 减少单次加载数据量
- ✅ 页面渲染更快
- ✅ 降低服务器压力

### 3. 易于维护
- ✅ 集中配置管理
- ✅ 修改一处即可
- ✅ 代码更规范

---

## 🔄 未来扩展

### 可配置的每页行数
如果需要让用户自定义每页显示行数，可以：

1. 使用前端配置中的 `PAGE_SIZE_OPTIONS`
2. 添加下拉选择器
3. 保存用户偏好设置

示例代码：
```typescript
<select value={pageSize} onChange={(e) => setPageSize(e.target.value)}>
  {PAGINATION_CONFIG.PAGE_SIZE_OPTIONS.map(size => (
    <option key={size} value={size}>{size}条/页</option>
  ))}
</select>
```

---

## ✅ 测试建议

### 测试步骤
1. 启动后端服务器
2. 访问各个表格页面
3. 验证每页显示15行
4. 测试翻页功能
5. 检查数据加载正常

### 测试页面
- 管理后台 → 充值卡管理
- 管理后台 → 通知管理
- 用户中心 → 订单中心
- 用户中心 → 余额日志
- 用户中心 → 搜索历史

---

## 📝 注意事项

### 后端
- 使用 `require('../config/pagination')` 引入配置
- 保持 `PAGE_SIZE` 常量命名统一
- 确保分页计算正确

### 前端
- 使用 `import { PAGINATION_CONFIG }` 引入配置
- API请求时使用 `limit=15`
- 分页组件显示正确的页码

---

**状态**: ✅ 所有分页设置已统一为15行/页
