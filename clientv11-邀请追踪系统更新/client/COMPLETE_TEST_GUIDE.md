# 🚀 完整测试指南

## ✅ 已完成的功能

### 1. 后端API系统
- ✅ 用户注册/登录（JWT认证）
- ✅ 每日签到领积分
- ✅ 用户资料管理
- ✅ 余额记录追踪
- ✅ 充值订单系统
- ✅ 推荐统计

### 2. 前端功能
- ✅ Dashboard显示真实用户数据
- ✅ 每日签到按钮和功能
- ✅ VIP状态显示
- ✅ 余额记录页面
- ✅ 积分中心完整功能
- ✅ 充值中心集成

---

## 🎯 测试步骤

### 第一步：启动后端服务器

```bash
cd server
npm install
npm start
```

**预期结果：**
```
✅ 用户数据库连接成功
✅ 查询数据库连接成功
🚀 知识库系统后端服务器启动成功
📡 服务器地址: http://localhost:3001
```

### 第二步：启动前端服务器

在新的终端窗口：

```bash
npm run dev
```

**预期结果：**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 📝 功能测试清单

### 1. 用户注册测试

**步骤：**
1. 访问 http://localhost:5173/register
2. 填写信息：
   - 用户名: `testuser`
   - 邮箱: `test@example.com`
   - 密码: `123456`
3. 点击"注册"

**预期结果：**
- ✅ 自动跳转到登录页面
- ✅ 后端日志显示：`✅ 用户注册成功: testuser`
- ✅ 数据库中创建用户记录
- ✅ 初始积分：100
- ✅ 生成推荐码

**验证数据库：**
```javascript
// MongoDB Shell
use userdata
db.users.find({ email: "test@example.com" }).pretty()
```

---

### 2. 用户登录测试

**步骤：**
1. 访问 http://localhost:5173/login
2. 输入：
   - 邮箱: `test@example.com`
   - 密码: `123456`
3. 点击"登录"

**预期结果：**
- ✅ 跳转到Dashboard
- ✅ 显示用户名："欢迎回来，testuser！"
- ✅ 显示积分：100
- ✅ 显示余额：¥0.00
- ✅ 后端日志：`✅ 用户登录成功: testuser`

---

### 3. Dashboard功能测试

**访问：** http://localhost:5173/dashboard

**检查项：**
- ✅ 显示用户名
- ✅ 显示真实积分（100）
- ✅ 显示真实余额（¥0.00）
- ✅ 显示推荐用户数（0）
- ✅ 显示搜索次数（0）
- ✅ 每日签到卡片可见
- ✅ "立即签到"按钮可点击

---

### 4. 每日签到测试

**步骤：**
1. 在Dashboard页面
2. 找到"每日签到"卡片
3. 点击"立即签到"按钮

**预期结果：**
- ✅ 显示成功提示："签到成功！获得 10 积分"
- ✅ 积分从100增加到110
- ✅ 按钮变为"已签到"且不可点击
- ✅ 后端日志：`✅ 用户 testuser 签到成功，获得 10 积分`

**验证数据库：**
```javascript
// 检查用户积分
db.users.find({ email: "test@example.com" }, { points: 1, lastDailyClaimAt: 1 })

// 检查余额日志
db.balancelogs.find({ userId: ObjectId("...") }).sort({ createdAt: -1 }).limit(1)
```

**重复签到测试：**
- ✅ 再次点击应显示："今天已经签到过了"
- ✅ 积分不再增加

---

### 5. 积分中心测试

**访问：** http://localhost:5173/dashboard/points

**检查项：**
- ✅ 显示总积分：110
- ✅ 显示可用积分：110
- ✅ 显示已使用：0
- ✅ 显示获取积分方式
- ✅ 显示积分用途
- ✅ 显示积分记录（签到记录）
- ✅ "查看完整记录"链接可点击

---

### 6. 余额记录测试

**访问：** http://localhost:5173/dashboard/balance-logs

**检查项：**
- ✅ 显示页面标题："余额记录"
- ✅ 显示签到记录
- ✅ 记录显示：
  - 类型：充值（绿色）
  - 金额：+10
  - 描述：每日签到
  - 时间：正确的时间戳
  - 余额变化：100 → 110

**测试刷新：**
- ✅ 点击"刷新"按钮
- ✅ 数据重新加载

---

### 7. 充值功能测试

**步骤：**
1. 访问 http://localhost:5173/dashboard/recharge-center
2. 选择"100积分/¥10"套餐
3. 点击"立即充值"

**预期结果：**
- ✅ 跳转到支付页面
- ✅ 显示订单信息
- ✅ 显示支付地址
- ✅ 显示二维码
- ✅ 后端日志：`📝 创建订单请求`
- ✅ 使用真实用户ID

**验证数据库：**
```javascript
// 检查充值订单
db.rechargeorders.find().sort({ createdAt: -1 }).limit(1).pretty()
```

**订单应包含：**
- ✅ userId: 真实用户ID
- ✅ orderId: 唯一订单号
- ✅ type: "points"
- ✅ amount: 10
- ✅ points: 100
- ✅ status: "pending"
- ✅ paymentAddress: USDT地址

---

### 8. VIP状态测试

**手动设置VIP（测试用）：**

```javascript
// MongoDB Shell
use userdata
db.users.updateOne(
  { email: "test@example.com" },
  { 
    $set: { 
      isVip: true,
      vipExpireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天后
    }
  }
)
```

**刷新Dashboard：**
- ✅ 右上角显示"VIP会员"徽章（金色）
- ✅ 带皇冠图标

---

## 🔍 数据库验证

### 查看所有用户
```javascript
use userdata
db.users.find().pretty()
```

### 查看余额日志
```javascript
db.balancelogs.find().sort({ createdAt: -1 }).pretty()
```

### 查看充值订单
```javascript
db.rechargeorders.find().sort({ createdAt: -1 }).pretty()
```

### 统计数据
```javascript
// 用户总数
db.users.count()

// 今日签到人数
db.users.count({ 
  lastDailyClaimAt: { 
    $gte: new Date(new Date().setHours(0,0,0,0)) 
  }
})

// 待支付订单
db.rechargeorders.count({ status: "pending" })

// 已完成订单
db.rechargeorders.count({ status: "completed" })
```

---

## 🐛 常见问题排查

### 问题1：注册后没有跳转

**检查：**
1. 浏览器Console是否有错误
2. Network标签查看API响应
3. 后端是否返回token
4. localStorage是否保存了token和user

**解决：**
```javascript
// 浏览器Console
localStorage.getItem('token')
localStorage.getItem('user')
```

---

### 问题2：签到后积分没有更新

**检查：**
1. 后端日志是否显示签到成功
2. 数据库中用户积分是否更新
3. 前端是否调用了loadUserData()

**解决：**
```javascript
// 检查数据库
db.users.find({ email: "test@example.com" }, { points: 1 })

// 检查余额日志
db.balancelogs.find({ description: "每日签到" })
```

---

### 问题3：充值订单创建失败

**检查：**
1. 用户是否已登录
2. localStorage中是否有user.id
3. BEpusdt配置是否正确
4. 后端日志错误信息

**解决：**
```javascript
// 检查用户ID
const user = JSON.parse(localStorage.getItem('user'))
console.log('User ID:', user.id)

// 检查后端配置
// server/.env
BEPUSDT_API_URL=https://api.bepusdt.com
BEPUSDT_MERCHANT_ID=your_merchant_id
BEPUSDT_API_KEY=your_api_key
```

---

### 问题4：数据库连接失败

**检查：**
1. MongoDB服务是否运行
2. 连接字符串是否正确
3. 用户名密码是否正确

**解决：**
```bash
# 检查MongoDB状态
mongosh

# 测试连接
mongosh "mongodb://username:password@localhost:27017/userdata"
```

---

## 📊 性能测试

### 1. 并发登录测试
- 创建10个测试账号
- 同时登录
- 检查响应时间

### 2. 签到压力测试
- 100个用户同时签到
- 检查数据库写入
- 验证积分正确性

### 3. 订单创建测试
- 连续创建10个订单
- 检查订单号唯一性
- 验证数据一致性

---

## ✅ 测试通过标准

### 基础功能
- [x] 用户可以注册
- [x] 用户可以登录
- [x] Dashboard显示真实数据
- [x] 每日签到功能正常
- [x] 积分正确增加
- [x] 余额记录正确保存

### 数据一致性
- [x] 前端显示与数据库一致
- [x] 积分变动有日志记录
- [x] 订单状态正确追踪
- [x] 用户信息实时同步

### 用户体验
- [x] 页面加载流畅
- [x] 操作响应及时
- [x] 错误提示友好
- [x] 数据刷新正常

---

## 🎉 测试成功标志

如果看到以下情况，说明系统运行正常：

1. ✅ 用户注册成功并保存到数据库
2. ✅ 用户登录后显示真实数据
3. ✅ 每日签到增加积分（100 → 110）
4. ✅ 积分变动记录在余额日志中
5. ✅ 充值订单成功创建
6. ✅ VIP状态正确显示
7. ✅ 所有页面数据实时同步
8. ✅ 数据库记录完整准确

---

## 📝 测试报告模板

```
测试日期：2024-10-19
测试人员：[姓名]
测试环境：
- 操作系统：Windows/Mac/Linux
- Node版本：v18.x.x
- MongoDB版本：v6.x.x

测试结果：
✅ 用户注册：通过
✅ 用户登录：通过
✅ 每日签到：通过
✅ 积分显示：通过
✅ 余额记录：通过
✅ 充值功能：通过
✅ VIP显示：通过

问题记录：
1. [如有问题，在此记录]

总结：
系统运行正常，所有核心功能测试通过。
```

---

## 🚀 下一步

测试通过后，可以：

1. **部署到生产环境**
   - 配置生产数据库
   - 设置环境变量
   - 配置域名和SSL

2. **添加更多功能**
   - 邮箱验证
   - 密码重置
   - 二次验证
   - 推荐奖励

3. **优化性能**
   - 添加缓存
   - 优化查询
   - 压缩资源

4. **监控和日志**
   - 添加错误追踪
   - 性能监控
   - 用户行为分析

---

更新时间：2024-10-19
状态：✅ 可以开始测试
