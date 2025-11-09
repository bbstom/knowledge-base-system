# 两个问题的修复方案

## 问题1：邀请奖励积分数量与后台配置不一致

### 问题描述
管理员后台设置了邀请奖励机制，但是用户获取的积分数量和后台配置的不一致。

### 可能原因
1. 配置没有正确保存到数据库
2. 代码读取了默认值而不是配置值
3. 配置更新后服务器没有重启

### 检查步骤

#### 1. 检查当前配置
运行脚本查看当前配置：
```bash
node server/scripts/checkSystemConfig.js
```

这会显示：
- 注册奖励 (registerReward)
- 推荐奖励 (referralReward)
- 每日签到 (dailyReward)
- 最低提现 (minWithdrawAmount)
- 提现手续费 (withdrawFee)

#### 2. 验证配置读取
在 `server/routes/auth.js` 中，注册时读取配置的代码：
```javascript
const config = await SystemConfig.getConfig();
const registerReward = config.points?.registerReward || 100;  // 默认100
const referralReward = config.points?.referralReward || 100;  // 默认100
```

如果配置中没有设置值，会使用默认值100。

#### 3. 检查配置保存
在管理后台的积分配置页面，确保：
- 点击"保存"按钮
- 看到"保存成功"提示
- 刷新页面后配置仍然存在

### 解决方案

#### 方案1：重新保存配置
1. 登录管理后台
2. 进入"系统设置" → "积分配置"
3. 设置注册奖励和推荐奖励
4. 点击"保存"
5. 运行检查脚本验证：`node server/scripts/checkSystemConfig.js`

#### 方案2：直接在数据库中设置
```javascript
// MongoDB命令
mongo knowbase

// 更新配置
db.systemconfigs.updateOne(
  {},
  {
    $set: {
      "points.registerReward": 200,      // 注册奖励
      "points.referralReward": 150       // 推荐奖励
    }
  },
  { upsert: true }
)

// 验证
db.systemconfigs.findOne()
```

#### 方案3：检查代码逻辑
确保注册代码正确读取配置：

```javascript
// server/routes/auth.js
const config = await SystemConfig.getConfig();
console.log('配置:', config.points);  // 添加日志

const registerReward = config.points?.registerReward || 100;
console.log('注册奖励:', registerReward);  // 添加日志

const referralReward = config.points?.referralReward || 100;
console.log('推荐奖励:', referralReward);  // 添加日志
```

### 注意事项
- 修改配置后需要重启服务器
- 已注册的用户不会追溯调整积分
- 新注册的用户会使用新配置

---

## 问题2：用户登录时右上角一直显示加载中

### 问题描述
用户登录时右上角用户图标处一直显示加载中，必须重新刷新界面后才正常。

### 问题原因
登录后UserContext没有正确更新用户信息，导致loading状态一直为true。

### 解决方案

#### 方案1：登录后刷新UserContext（推荐）

修改 `src/pages/Auth/Login.tsx`：

```typescript
import { useUser } from '../../hooks/useUser';  // 添加导入

export const Login: React.FC = () => {
  const { refreshUser } = useUser();  // 获取refreshUser函数
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await authApi.login(email, password) as any;
      
      if (response?.success && response?.data) {
        // 保存token和用户信息
        if (response.data.token) {
          setToken(response.data.token);
        }
        if (response.data.user) {
          setUser(response.data.user);
        }
        
        // 刷新UserContext
        await refreshUser();  // 添加这行
        
        toast.success('登录成功');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };
}
```

#### 方案2：修改UserContext初始loading状态

修改 `src/contexts/UserContext.tsx`：

```typescript
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);  // 改为true
  const [error, setError] = useState<string | null>(null);

  // 从API加载用户信息
  const loadUser = async () => {
    const token = document.cookie.split('token=')[1]?.split(';')[0];
    if (!token) {
      setUser(null);
      setLoading(false);  // 没有token时设置为false
      return;
    }

    setLoading(true);
    // ... 其余代码
  };
}
```

#### 方案3：添加超时处理

修改 `src/contexts/UserContext.tsx`：

```typescript
const loadUser = async () => {
  const token = document.cookie.split('token=')[1]?.split(';')[0];
  if (!token) {
    setUser(null);
    setLoading(false);
    return;
  }

  setLoading(true);
  setError(null);

  // 添加超时处理
  const timeout = setTimeout(() => {
    setLoading(false);
    setError('加载超时');
  }, 10000);  // 10秒超时

  try {
    const response = await fetch('/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    clearTimeout(timeout);  // 清除超时

    const data = await response.json();
    
    if (data.success && data.user) {
      setUser({
        // ... 用户数据
      });
    } else {
      setUser(null);
    }
  } catch (err) {
    clearTimeout(timeout);  // 清除超时
    console.error('Load user error:', err);
    setError('加载用户信息失败');
    setUser(null);
  } finally {
    setLoading(false);
  }
};
```

### 推荐方案
使用**方案1**：登录后刷新UserContext，这是最简单和最可靠的方法。

### 实施步骤
1. 修改 `src/pages/Auth/Login.tsx`
2. 添加 `refreshUser()` 调用
3. 测试登录流程
4. 验证右上角用户信息正常显示

### 验证
登录后应该：
- ✅ 立即显示用户名和头像
- ✅ 不显示加载状态
- ✅ 不需要刷新页面

---

## 总结

### 问题1：配置不一致
- 检查配置是否正确保存
- 运行检查脚本验证
- 必要时直接在数据库中设置

### 问题2：登录加载中
- 登录后刷新UserContext
- 添加 `await refreshUser()` 调用
- 确保用户信息正确加载

两个问题都需要修改代码，修改后需要重新编译前端代码。
