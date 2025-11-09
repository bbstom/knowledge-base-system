# Design Document

## Overview

积分说明配置功能允许管理员通过后台界面自定义积分中心页面的"获取积分方式"和"积分用途"内容。该功能采用配置化设计，将静态内容转换为可动态管理的数据。

## Architecture

### System Components

```
┌─────────────────┐
│  Admin UI       │ ← 管理员配置界面
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Backend API    │ ← 配置管理API
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Database       │ ← SystemConfig集合
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  User UI        │ ← 用户查看界面
└─────────────────┘
```

## Components and Interfaces

### 1. Data Model

#### SystemConfig.points.descriptions

```javascript
{
  points: {
    // 现有配置...
    descriptions: {
      earnMethods: [
        {
          id: String,           // 唯一标识
          title: String,        // 标题（如"每日签到"）
          description: String,  // 描述（如"每天签到获得积分"）
          reward: String,       // 奖励值（如"+10"、"1:1"、"不定期"）
          icon: String,         // 图标类型（calendar, users, shopping-cart, gift, star）
          color: String,        // 颜色类（如"blue", "green", "purple"）
          order: Number         // 排序
        }
      ],
      usageMethods: [
        {
          id: String,           // 唯一标识
          title: String,        // 标题（如"搜索抵扣"）
          description: String,  // 描述
          order: Number         // 排序
        }
      ]
    }
  }
}
```

### 2. Backend API

#### GET /api/system-config/points-descriptions
获取积分说明配置

**Response:**
```json
{
  "success": true,
  "data": {
    "earnMethods": [...],
    "usageMethods": [...]
  }
}
```

#### PUT /api/system-config/points-descriptions
更新积分说明配置

**Request:**
```json
{
  "earnMethods": [...],
  "usageMethods": [...]
}
```

**Response:**
```json
{
  "success": true,
  "message": "配置已保存"
}
```

### 3. Admin UI Component

**Location:** `src/pages/Admin/PointsDescriptionConfig.tsx`

**Features:**
- 获取方式列表管理（添加、编辑、删除、排序）
- 积分用途列表管理（添加、编辑、删除、排序）
- 实时预览
- 图标选择器
- 颜色选择器

**UI Layout:**
```
┌─────────────────────────────────────┐
│  积分说明配置                        │
├─────────────────────────────────────┤
│  获取积分方式                        │
│  ┌───────────────────────────────┐  │
│  │ [+] 添加新方式                │  │
│  │                               │  │
│  │ 1. 每日签到                   │  │
│  │    [编辑] [删除] [↑] [↓]     │  │
│  │                               │  │
│  │ 2. 推荐好友                   │  │
│  │    [编辑] [删除] [↑] [↓]     │  │
│  └───────────────────────────────┘  │
│                                     │
│  积分用途                            │
│  ┌───────────────────────────────┐  │
│  │ [+] 添加新用途                │  │
│  │                               │  │
│  │ 1. 搜索抵扣                   │  │
│  │    [编辑] [删除] [↑] [↓]     │  │
│  └───────────────────────────────┘  │
│                                     │
│  [保存配置]                         │
└─────────────────────────────────────┘
```

### 4. User UI Component

**Location:** `src/pages/Dashboard/Points.tsx`

**Changes:**
- 从API加载配置数据
- 动态渲染获取方式列表
- 动态渲染用途列表
- 保留默认配置作为fallback

## Data Models

### EarnMethod Interface
```typescript
interface EarnMethod {
  id: string;
  title: string;
  description: string;
  reward: string;
  icon: 'calendar' | 'users' | 'shopping-cart' | 'gift' | 'star' | 'coins';
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'orange';
  order: number;
}
```

### UsageMethod Interface
```typescript
interface UsageMethod {
  id: string;
  title: string;
  description: string;
  order: number;
}
```

### PointsDescriptions Interface
```typescript
interface PointsDescriptions {
  earnMethods: EarnMethod[];
  usageMethods: UsageMethod[];
}
```

## Error Handling

### Validation Rules
1. 标题不能为空，最大50字符
2. 描述不能为空，最大200字符
3. 奖励值最大20字符
4. 图标类型必须在预定义列表中
5. 颜色必须在预定义列表中
6. 至少保留一个获取方式和一个用途

### Error Messages
- "标题不能为空"
- "描述不能为空"
- "至少需要一个获取方式"
- "至少需要一个积分用途"
- "保存失败，请重试"

## Testing Strategy

### Unit Tests
- 配置数据验证
- 排序逻辑
- 图标映射

### Integration Tests
- API端点测试
- 数据库读写测试
- 配置更新流程测试

### UI Tests
- 管理界面操作测试
- 用户界面显示测试
- 响应式布局测试

## Default Configuration

系统提供默认配置，当数据库中没有配置时使用：

```javascript
const defaultDescriptions = {
  earnMethods: [
    {
      id: 'daily-checkin',
      title: '每日签到',
      description: '每天签到获得积分',
      reward: '+10',
      icon: 'calendar',
      color: 'blue',
      order: 1
    },
    {
      id: 'referral',
      title: '推荐好友',
      description: '好友注册并验证邮箱',
      reward: '+50',
      icon: 'users',
      color: 'green',
      order: 2
    },
    {
      id: 'purchase',
      title: '消费返积分',
      description: '每消费1元返1积分',
      reward: '1:1',
      icon: 'shopping-cart',
      color: 'purple',
      order: 3
    },
    {
      id: 'activity',
      title: '活动奖励',
      description: '参与平台活动',
      reward: '不定期',
      icon: 'gift',
      color: 'yellow',
      order: 4
    }
  ],
  usageMethods: [
    {
      id: 'search',
      title: '搜索抵扣',
      description: '使用积分进行数据搜索',
      order: 1
    },
    {
      id: 'exchange',
      title: '兑换商品',
      description: '积分可兑换平台商品',
      order: 2
    },
    {
      id: 'vip',
      title: 'VIP升级',
      description: '使用积分升级VIP会员',
      order: 3
    }
  ]
};
```

## Performance Considerations

1. **Caching**: 配置数据变化不频繁，可在前端缓存
2. **Lazy Loading**: 仅在访问积分中心时加载配置
3. **Batch Updates**: 批量保存配置，减少API调用
4. **Optimistic UI**: 管理界面使用乐观更新提升体验

## Security Considerations

1. **Authentication**: 仅管理员可访问配置API
2. **Authorization**: 使用adminMiddleware验证权限
3. **Input Validation**: 严格验证所有输入数据
4. **XSS Prevention**: 对用户输入进行转义
5. **Rate Limiting**: 限制API调用频率
