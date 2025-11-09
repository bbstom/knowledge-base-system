# 环境变量和配置变量文档

## 📋 环境变量 (.env)

### 服务器配置
```env
PORT=3001                    # 服务器端口
HOST=0.0.0.0                # 监听地址（0.0.0.0 允许局域网访问）
NODE_ENV=development        # 运行环境（development/production）
```

### 数据库配置
```env
# 用户数据库（存储用户账号、积分、订单等）
USER_MONGO_URI=mongodb://username:password@host:port/database?authSource=admin

# 查询数据库（存储可搜索的数据）- 可选，优先使用管理员后台配置
QUERY_MONGO_URI=mongodb://username:password@host:port/database?authSource=admin
```

### JWT 配置
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### BEpusdt 支付配置
```env
BEPUSDT_URL=https://usd.vpno.eu.org
BEPUSDT_API_KEY=your-api-key
BEPUSDT_MERCHANT_ID=1000
BEPUSDT_SECRET_KEY=your-secret-key
BEPUSDT_TEST_MODE=false
```

### 前后端地址
```env
# 前端地址
FRONTEND_URL=http://localhost:5173

# 后端地址（用于 Webhook 回调）
BACKEND_URL=http://your-domain:3001
```

### 邮件服务配置
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SITE_NAME=信息查询系统
```

---

## 🗄️ 数据库配置变量 (SystemConfig)

这些配置存储在 MongoDB 的 `systemconfigs` 集合中，可以在管理员后台修改。

### 数据库连接配置
```javascript
databases: {
  user: {
    name: String,              // 数据库名称
    type: String,              // 数据库类型（mongodb）
    host: String,              // 主机地址
    port: Number,              // 端口号
    username: String,          // 用户名
    password: String,          // 密码（加密存储）
    database: String,          // 数据库名
    authSource: String,        // 认证数据库（默认：admin）
    connectionPool: Number,    // 连接池大小（默认：10）
    timeout: Number,           // 超时时间（默认：30000ms）
    enabled: Boolean           // 是否启用
  },
  query: [{
    id: String,                // 唯一标识
    name: String,              // 数据库名称
    type: String,              // 数据库类型
    host: String,              // 主机地址
    port: Number,              // 端口号
    username: String,          // 用户名
    password: String,          // 密码（加密存储）
    database: String,          // 数据库名
    authSource: String,        // 认证数据库
    connectionPool: Number,    // 连接池大小
    timeout: Number,           // 超时时间
    enabled: Boolean,          // 是否启用
    description: String        // 描述
  }]
}
```

### 积分系统配置
```javascript
points: {
  // 搜索消耗
  searchCost: Number,              // 每次搜索消耗积分（默认：10）
  enableSearchCost: Boolean,       // 是否启用搜索扣费（默认：true）
  exchangeRate: Number,            // 余额兑换积分汇率（默认：100，1元=100积分）
  
  // 每日签到
  dailyCheckIn: Number,            // 每日签到奖励（默认：10）
  consecutiveBonus: {
    day7: Number,                  // 连续7天奖励（默认：50）
    day30: Number                  // 连续30天奖励（默认：200）
  },
  enableDailyCheckIn: Boolean,     // 是否启用签到（默认：true）
  
  // 推荐奖励
  referralReward: Number,          // 推荐人奖励（默认：100）
  referredUserReward: Number,      // 被推荐人奖励（默认：50）
  enableReferralReward: Boolean,   // 是否启用推荐奖励（默认：true）
  
  // 注册奖励
  registerReward: Number,          // 注册奖励（默认：100）
  enableRegisterReward: Boolean,   // 是否启用注册奖励（默认：true）
  
  // 佣金系统
  commissionRate: Number,          // 一级佣金比例（默认：15%）
  secondLevelCommissionRate: Number, // 二级佣金比例（默认：5%）
  thirdLevelCommissionRate: Number,  // 三级佣金比例（默认：2%）
  commissionLevels: Number,        // 佣金层级（默认：1）
  commissionSettlement: String,    // 结算方式（instant/daily/weekly/monthly）
  enableCommission: Boolean,       // 是否启用佣金（默认：true）
  
  // 提现配置
  minWithdrawAmountBalance: Number, // 提现到余额最低金额（默认：1）
  minWithdrawAmount: Number,       // 提现到USDT最低金额（默认：10）
  withdrawFee: Number,             // 提现手续费比例（默认：5%）
  usdtRate: Number,                // USDT汇率（默认：0.14）
  withdrawApproval: String,        // 审核方式（manual/auto）
  autoApprovalLimit: Number,       // 自动审核限额（默认：100）
  
  // 积分有效期
  pointsExpireDays: Number,        // 积分过期天数（0=永久有效）
  maxPoints: Number,               // 最大积分限制（0=无限制）
  
  // 积分说明
  descriptions: {
    earnMethods: [{
      id: String,
      title: String,
      description: String,
      reward: String,
      icon: String,
      color: String,
      order: Number
    }],
    usageMethods: [{
      id: String,
      title: String,
      description: String,
      order: Number
    }]
  }
}
```

### 邮件配置
```javascript
email: {
  smtpHost: String,              // SMTP 服务器
  smtpPort: Number,              // SMTP 端口
  smtpSecure: Boolean,           // 是否使用 SSL
  smtpUser: String,              // SMTP 用户名
  smtpPassword: String,          // SMTP 密码（加密存储）
  fromName: String,              // 发件人名称
  fromEmail: String,             // 发件人邮箱
  templates: [{                  // 邮件模板
    id: String,
    name: String,
    subject: String,
    content: String,
    enabled: Boolean
  }]
}
```

### 搜索类型配置
```javascript
searchTypes: [{
  id: String,                    // 搜索类型ID（idcard/phone/name等）
  label: String,                 // 显示名称
  enabled: Boolean,              // 是否启用
  order: Number                  // 排序
}]
```

### 卡密购买配置
```javascript
rechargeCard: {
  enabled: Boolean,              // 是否启用（默认：true）
  title: String,                 // 标题
  description: String,           // 描述
  purchaseUrl: String,           // 购买链接
  instructions: String           // 使用说明
}
```

---

## 🔐 加密存储的字段

以下字段在数据库中使用 AES-256-CBC 加密存储：

1. **数据库密码**
   - `databases.user.password`
   - `databases.query[].password`

2. **邮件密码**
   - `email.smtpPassword`

3. **支付密钥**（如果存储在数据库中）
   - 支付相关的敏感信息

---

## 📝 配置优先级

### 数据库连接
1. **管理员后台配置**（优先）- `SystemConfig.databases`
2. **环境变量配置**（备用）- `.env` 文件

### 其他配置
- 大部分配置都存储在 `SystemConfig` 中
- 可以在管理员后台动态修改
- 修改后立即生效（部分需要重启服务器）

---

## 🔄 需要重启服务器的配置

以下配置修改后需要重启服务器：

1. ✅ **数据库连接配置** - 需要重新初始化连接
2. ✅ **环境变量** - `.env` 文件修改
3. ❌ **积分配置** - 不需要重启
4. ❌ **邮件配置** - 不需要重启
5. ❌ **搜索类型** - 不需要重启

---

## 🎯 新增变量（本次会话）

### 搜索优化相关
```javascript
// server/routes/search.js
const startTime = Date.now();           // 搜索开始时间
const searchTime = Date.now() - startTime; // 搜索耗时

// 查询超时设置
.maxTimeMS(5000)  // 5秒超时
```

### 数据库连接相关
```javascript
// server/config/database.js
const database = require('../config/database');
const queryConnection = database.queryConnection; // 动态获取连接
```

### 提现配置相关
```javascript
// SystemConfig.points
minWithdrawAmountBalance: Number  // 提现到余额最低金额（新增）
minWithdrawAmount: Number         // 提现到USDT最低金额（已有）
```

---

## 📚 相关文档

- 数据库配置指南：`DATABASE_CONFIG_GUIDE.md`
- 搜索优化文档：`SEARCH_OPTIMIZATION_COMPLETE.md`
- 提现配置修复：`WITHDRAW_CONFIG_FIX.md`
- 数据库配置保存修复：`DATABASE_CONFIG_SAVE_FIX.md`
