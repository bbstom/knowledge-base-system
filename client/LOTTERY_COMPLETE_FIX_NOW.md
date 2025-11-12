# 抽奖系统完整修复 - 立即执行

## 问题1: 删除顶部导航栏的抽奖链接

### 文件: `src/components/Layout/Header.tsx`

**找到第134-149行的代码**，应该是这样的：

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

**完整替换为**：

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

**注意**: 删除了整个抽奖链接，同时删除了 `<>` 和 `</>`。

---

## 问题2: 抽奖活动不显示

### 步骤1: 检查数据库中的活动

运行检查脚本：
```bash
node server/scripts/checkLotteryActivities.js
```

如果显示"没有可用的抽奖活动"，继续下一步。

---

### 步骤2: 检查后端API

**文件**: `server/routes/lottery.js`

找到获取活动列表的API（大约在第45行），确保代码是这样的：

```javascript
router.get('/activities', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    
    const activities = await LotteryActivity.find({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now }
    }).sort({ createdAt: -1 });

    // 为每个活动计算剩余抽奖次数
    const activitiesWithDraws = await Promise.all(
      activities.map(async (activity) => {
        let remainingDraws = -1; // -1 表示无限制
        
        if (activity.dailyLimit > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const todayDraws = await LotteryRecord.countDocuments({
            userId: req.user._id,
            activityId: activity._id,
            createdAt: { $gte: today }
          });
          
          remainingDraws = Math.max(0, activity.dailyLimit - todayDraws);
        }
        
        return {
          ...activity.toObject(),
          remainingDraws
        };
      })
    );

    res.json({
      success: true,
      data: activitiesWithDraws
    });
  } catch (error) {
    console.error('获取活动列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取活动列表失败'
    });
  }
});
```

---

### 步骤3: 在管理后台创建测试活动

1. 登录管理后台
2. 访问 `/admin/lottery`
3. 点击"添加活动"
4. 填写信息：
   - **活动名称**: 测试抽奖
   - **活动描述**: 这是一个测试活动
   - **消耗积分**: 10
   - **每日限制**: 10（0表示无限）
   - **动画类型**: 🎰 老虎机
   - **开始时间**: 选择今天或之前的日期
   - **结束时间**: 选择明天或之后的日期

5. 添加奖品：
   ```
   奖品1:
   - 名称: 100积分
   - 类型: 积分
   - 积分数: 100
   - 库存: 10
   - 概率: 10

   奖品2:
   - 名称: 谢谢参与
   - 类型: 谢谢参与
   - 价值: 0
   - 库存: -1
   - 概率: 90
   ```

6. 点击"保存"

---

### 步骤4: 确保用户已充值

**重要**: 只有 `totalRecharged > 0` 的用户才能看到抽奖活动并参与抽奖。

#### 方法1: 通过管理后台设置

1. 访问 `/admin/users`
2. 找到测试用户
3. 编辑用户，设置充值金额 > 0

#### 方法2: 通过数据库直接设置

在MongoDB中执行：
```javascript
db.users.updateOne(
  { username: "你的用户名" },
  { $set: { totalRecharged: 100 } }
)
```

#### 方法3: 使用脚本设置

创建文件 `server/scripts/setUserRecharged.js`:

```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function setRecharged() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const username = process.argv[2] || 'testuser';
    const amount = parseInt(process.argv[3]) || 100;
    
    const user = await User.findOneAndUpdate(
      { username },
      { $set: { totalRecharged: amount } },
      { new: true }
    );
    
    if (user) {
      console.log(`✅ 用户 ${username} 的充值金额已设置为 ${amount}`);
    } else {
      console.log(`❌ 找不到用户 ${username}`);
    }
  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

setRecharged();
```

运行：
```bash
node server/scripts/setUserRecharged.js 你的用户名 100
```

---

### 步骤5: 检查前端API调用

**文件**: `src/pages/Dashboard/Lottery.tsx`

确保 `loadActivities` 函数正确：

```typescript
const loadActivities = async () => {
  try {
    const response = await lotteryApi.getActivities();
    console.log('API响应:', response); // 添加调试日志
    if (response.success) {
      setActivities(response.data || []);
      console.log('活动列表:', response.data); // 添加调试日志
    }
  } catch (error) {
    console.error('加载活动失败:', error);
  }
};
```

---

### 步骤6: 检查API路径

**文件**: `src/utils/api.ts`

确保抽奖API路径正确：

```typescript
export const lotteryApi = {
  // 获取可用的抽奖活动
  getActivities: () => api.get('/api/lottery/activities'),
  
  // 参与抽奖
  draw: (activityId: string) => api.post('/api/lottery/draw', { activityId }),
  
  // 获取我的抽奖记录
  getMyRecords: (params?: { page?: number; limit?: number }) =>
    api.get('/api/lottery/my-records', { params }),
  
  // 领取奖品
  claimPrize: (recordId: string) => api.post(`/api/lottery/claim/${recordId}`)
};
```

---

## 完整测试流程

### 1. 修改代码
- [ ] 删除Header.tsx中的抽奖链接
- [ ] 添加Sidebar.tsx中的抽奖入口（如果还没有）

### 2. 重启服务
```bash
# 停止前端
Ctrl+C

# 停止后端
Ctrl+C

# 重新启动后端
cd server
npm start

# 重新启动前端（新终端）
cd client
npm run dev
```

### 3. 检查数据库
```bash
node server/scripts/checkLotteryActivities.js
```

### 4. 创建测试活动
- 登录管理后台
- 创建一个测试活动
- 确保时间范围正确

### 5. 设置用户充值
```bash
node server/scripts/setUserRecharged.js 你的用户名 100
```

### 6. 测试前端
1. 清除浏览器缓存（Ctrl+Shift+Delete）
2. 强制刷新（Ctrl+F5）
3. 登录用户账号
4. 检查顶部导航栏（不应该有抽奖链接）
5. 访问 `/dashboard`
6. 检查侧边栏（应该有抽奖中心）
7. 点击抽奖中心
8. 应该看到活动列表

---

## 调试技巧

### 1. 浏览器控制台

按F12打开开发者工具，查看：

**Console标签**:
```javascript
// 应该看到这些日志
API响应: {success: true, data: [...]}
活动列表: [...]
```

**Network标签**:
- 查找 `/api/lottery/activities` 请求
- 检查响应状态（应该是200）
- 检查响应数据

### 2. 后端日志

在终端查看服务器输出，应该看到：
```
GET /api/lottery/activities 200
```

### 3. 常见问题

**Q: 活动列表为空**
- 检查活动的 `isActive` 是否为 true
- 检查活动时间是否在范围内
- 检查用户是否已充值

**Q: 提示"仅限充值用户"**
- 用户的 `totalRecharged` 必须 > 0
- 运行脚本设置充值金额

**Q: 顶部还是显示抽奖链接**
- 确认已修改Header.tsx
- 清除浏览器缓存
- 强制刷新（Ctrl+F5）

---

## 完成检查清单

- [ ] 删除Header.tsx中的抽奖链接
- [ ] 添加Sidebar.tsx中的抽奖入口
- [ ] 重启前后端服务
- [ ] 运行checkLotteryActivities.js
- [ ] 在管理后台创建测试活动
- [ ] 设置用户充值金额
- [ ] 清除浏览器缓存
- [ ] 测试顶部导航栏（无抽奖）
- [ ] 测试侧边栏（有抽奖）
- [ ] 测试活动列表显示
- [ ] 测试抽奖功能

---

**完成所有步骤后，抽奖系统应该完全正常工作！** 🎰✨
