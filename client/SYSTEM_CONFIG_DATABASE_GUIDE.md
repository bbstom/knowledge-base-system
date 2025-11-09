# 🔧 系统配置数据库保存指南

## 🎯 问题

以下配置修改后提示保存成功，但刷新后丢失：
- ✅ 内容管理
- ✅ 数据库列表
- ✅ 常见问题
- ✅ 热门话题
- ✅ 广告管理
- ✅ 佣金配置
- ✅ 搜索管理
- ✅ 数据库配置
- ✅ 邮件配置
- ✅ 积分配置
- ✅ 通知管理

## 🔧 解决方案

已创建完整的后端API支持，现在需要更新前端页面。

---

## 📦 已创建的后端支持

### 1. 数据库模型

**SystemConfig模型** (`server/models/SystemConfig.js`)
- 搜索类型配置
- 数据库配置
- 邮件配置
- 积分配置

**其他模型：**
- `CommissionConfig` - 佣金配置
- `Content` - 内容管理
- `Notification` - 通知管理

### 2. API端点

**系统配置：**
- `GET /api/system-config` - 获取所有配置
- `PUT /api/system-config` - 更新所有配置
- `PUT /api/system-config/search-types` - 更新搜索类型
- `PUT /api/system-config/databases` - 更新数据库配置
- `PUT /api/system-config/email` - 更新邮件配置
- `PUT /api/system-config/points` - 更新积分配置

**其他API：**
- `/api/commission/config` - 佣金配置
- `/api/content` - 内容管理
- `/api/notifications` - 通知管理

---

## 🚀 前端更新步骤

### 方法1：快速修复（推荐）

在每个配置组件中添加API调用：

```typescript
// 示例：PointsConfig.tsx

const handleSave = async () => {
  try {
    const response = await fetch('/api/system-config/points', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
      },
      body: JSON.stringify({ points: pointsConfig })
    });

    const data = await response.json();
    
    if (data.success) {
      toast.success('配置已保存到数据库');
    } else {
      toast.error(data.message || '保存失败');
    }
  } catch (error) {
    console.error('保存失败:', error);
    toast.error('保存失败，请重试');
  }
};
```

### 方法2：统一更新

更新 `SystemSettings.tsx` 主组件：

```typescript
// 加载配置
const loadSettings = async () => {
  try {
    const response = await fetch('/api/system-config', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      setSearchTypes(data.data.searchTypes || []);
      setUserDatabase(data.data.databases?.user || {});
      setQueryDatabases(data.data.databases?.query || []);
      setEmailConfig(data.data.email || {});
      setPointsConfig(data.data.points || {});
    }
  } catch (error) {
    console.error('加载配置失败:', error);
  }
};

// 保存配置
const saveConfig = async (type: string, config: any) => {
  try {
    const response = await fetch(`/api/system-config/${type}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ [type]: config })
    });
    
    const data = await response.json();
    
    if (data.success) {
      toast.success('配置已保存');
    }
  } catch (error) {
    toast.error('保存失败');
  }
};
```

---

## 📝 需要更新的文件

### 主要文件
1. `src/pages/Admin/SystemSettings.tsx` - 主配置页面
2. `src/pages/Admin/SearchTypeConfig.tsx` - 搜索类型配置
3. `src/pages/Admin/DatabaseConfig.tsx` - 数据库配置
4. `src/pages/Admin/EmailConfig.tsx` - 邮件配置
5. `src/pages/Admin/PointsConfig.tsx` - 积分配置

### 其他文件
6. `src/pages/Admin/ContentManagement.tsx` - 内容管理
7. `src/pages/Admin/NotificationManagement.tsx` - 通知管理

---

## 🧪 测试步骤

### 1. 重启后端
```bash
cd server
npm start
```

### 2. 测试API
```bash
# 获取配置
curl -X GET http://localhost:3001/api/system-config \
  -H "Authorization: Bearer YOUR_TOKEN"

# 更新积分配置
curl -X PUT http://localhost:3001/api/system-config/points \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"points":{"searchCost":20}}'
```

### 3. 验证数据库
```bash
mongosh "mongodb://..."
db.systemconfigs.find().pretty()
```

---

## 📊 数据库结构

### systemconfigs集合
```javascript
{
  _id: ObjectId("..."),
  searchTypes: [
    { id: "idcard", label: "身份证", enabled: true, order: 1 },
    // ...
  ],
  databases: {
    user: { /* 用户数据库配置 */ },
    query: [ /* 查询数据库配置 */ ]
  },
  email: {
    smtpHost: "...",
    smtpPort: 587,
    // ...
  },
  points: {
    searchCost: 10,
    dailyCheckIn: 10,
    // ...
  },
  updatedBy: ObjectId("..."),
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

---

## 🎯 快速修复示例

### PointsConfig组件

在 `src/pages/Admin/PointsConfig.tsx` 中添加：

```typescript
import toast from 'react-hot-toast';

// 在组件中添加保存函数
const handleSave = async () => {
  try {
    const token = document.cookie.split('token=')[1]?.split(';')[0];
    
    const response = await fetch('/api/system-config/points', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ points: pointsConfig })
    });

    const data = await response.json();
    
    if (data.success) {
      toast.success('配置已保存到数据库');
    } else {
      toast.error(data.message || '保存失败');
    }
  } catch (error) {
    console.error('保存失败:', error);
    toast.error('保存失败，请重试');
  }
};

// 在保存按钮的onClick中调用
<button onClick={handleSave}>保存配置</button>
```

### 加载配置

```typescript
useEffect(() => {
  loadConfig();
}, []);

const loadConfig = async () => {
  try {
    const token = document.cookie.split('token=')[1]?.split(';')[0];
    
    const response = await fetch('/api/system-config', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (data.success && data.data.points) {
      setPointsConfig(data.data.points);
    }
  } catch (error) {
    console.error('加载配置失败:', error);
  }
};
```

---

## ✅ 验证清单

### 后端
- [x] 创建SystemConfig模型
- [x] 创建API路由
- [x] 注册路由
- [x] 添加权限控制

### 前端（待完成）
- [ ] 更新SystemSettings主组件
- [ ] 更新SearchTypeConfig
- [ ] 更新DatabaseConfig
- [ ] 更新EmailConfig
- [ ] 更新PointsConfig
- [ ] 更新ContentManagement
- [ ] 更新NotificationManagement

---

## 🎉 完成后的效果

1. ✅ 所有配置保存到MongoDB
2. ✅ 刷新页面配置保持
3. ✅ 多设备配置同步
4. ✅ 配置历史可追溯
5. ✅ 数据永久保存

---

## 📞 需要帮助？

如果需要我帮助更新具体的前端组件，请告诉我：
1. 哪个组件需要更新
2. 组件的当前代码
3. 保存按钮在哪里

我会提供具体的修改代码。

---

**创建时间：** 2024-10-19  
**状态：** ✅ 后端完成，前端待更新  
**优先级：** 🔴 高
