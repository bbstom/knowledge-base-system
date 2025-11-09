# 邀请追踪系统 - 设计文档

## 概述

邀请追踪系统采用混合方案，结合前端存储（Cookie + LocalStorage）和后端数据库记录，实现跨会话、跨浏览器的邀请关系追踪。系统设计重点在于可靠性、性能和隐私保护。

## 架构

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         用户浏览器                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Cookie     │  │ LocalStorage │  │ 设备指纹生成  │      │
│  │  (30天)      │  │   (30天)     │  │   模块       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                  │               │
│         └─────────────────┴──────────────────┘               │
│                           │                                   │
│                  ┌────────▼────────┐                         │
│                  │ referralTracking │                         │
│                  │   工具模块       │                         │
│                  └────────┬────────┘                         │
└───────────────────────────┼──────────────────────────────────┘
                            │ HTTP API
┌───────────────────────────▼──────────────────────────────────┐
│                      后端服务器                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Referral API Routes                        │   │
│  │  - POST /api/referral/track                          │   │
│  │  - POST /api/referral/get-code                       │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                         │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │           ReferralVisit Model                        │   │
│  │  - 邀请码、设备指纹、IP、访问记录                     │   │
│  │  - 转化状态、过期时间                                 │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                         │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │              MongoDB                                 │   │
│  │  - referralvisits 集合                               │   │
│  │  - TTL索引自动清理                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 数据流程

#### 1. 邀请链接访问流程

```
用户点击邀请链接 (https://site.com?ref=ABC123)
    │
    ▼
App.tsx useEffect 检测到 ref 参数
    │
    ▼
调用 trackReferralVisit(referralCode)
    │
    ├─► 生成设备指纹
    │
    ├─► 保存到 Cookie (30天)
    │
    ├─► 保存到 LocalStorage (30天)
    │
    └─► POST /api/referral/track
            │
            ├─► 验证邀请码是否存在
            │
            ├─► 查找现有访问记录
            │
            └─► 创建/更新 ReferralVisit 记录
```

#### 2. 注册时获取邀请码流程

```
用户进入注册页面
    │
    ▼
Register.tsx useEffect 调用 getReferralCode()
    │
    ├─► 1. 尝试从 Cookie 获取
    │   └─► 成功 → 返回邀请码
    │
    ├─► 2. 尝试从 LocalStorage 获取
    │   └─► 成功 → 返回邀请码
    │
    └─► 3. POST /api/referral/get-code (fingerprint)
            │
            ├─► 按设备指纹查询数据库
            │   └─► 成功 → 返回邀请码
            │
            └─► 按IP地址查询数据库（降级）
                └─► 成功/失败 → 返回邀请码/null
```

#### 3. 注册转化标记流程

```
用户提交注册表单
    │
    ▼
POST /api/auth/register
    │
    ├─► 创建用户账号
    │
    └─► 标记邀请访问为已转化
            │
            └─► ReferralVisit.updateMany({
                    referralCode,
                    converted: false,
                    $or: [
                      { fingerprint },
                      { ip }
                    ]
                  }, {
                    converted: true,
                    convertedUserId: user._id
                  })
```

## 组件和接口

### 前端组件

#### 1. referralTracking.ts 工具模块

**职责：** 提供邀请追踪的所有前端功能

**导出函数：**

```typescript
// 生成设备指纹
export const generateFingerprint = (): string

// Cookie操作
export const setReferralCookie = (referralCode: string): void
export const getReferralCookie = (): string | null

// LocalStorage操作
export const setReferralStorage = (referralCode: string): void
export const getReferralStorage = (): string | null

// 追踪邀请访问
export const trackReferralVisit = async (referralCode: string): Promise<void>

// 获取邀请码（注册时使用）
export const getReferralCode = async (): Promise<string | null>
```

**设备指纹生成算法：**

```typescript
fingerprint = hash(
  canvas.toDataURL() +
  screen.width + 'x' + screen.height +
  screen.colorDepth +
  navigator.language +
  navigator.userAgentData.platform +  // 使用新API替代deprecated的platform
  navigator.userAgent
)
```

**改进点：**
- 使用 `navigator.userAgentData.platform` 替代已废弃的 `navigator.platform`
- 添加时区信息增强唯一性
- 使用更强的哈希算法（如 SHA-256）

#### 2. App.tsx 集成

**职责：** 自动处理邀请链接

```typescript
useEffect(() => {
  const handleReferralLink = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');
    
    if (referralCode) {
      try {
        await trackReferralVisit(referralCode);
        
        // 清除URL参数
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('ref');
        window.history.replaceState({}, '', newUrl.toString());
      } catch (error) {
        console.error('处理邀请链接失败:', error);
      }
    }
  };
  
  handleReferralLink();
}, []);
```

#### 3. Register.tsx 集成

**职责：** 自动获取并填充邀请码

```typescript
useEffect(() => {
  const loadReferralCode = async () => {
    try {
      const code = await getReferralCode();
      if (code && !formData.referralCode) {
        setFormData(prev => ({ ...prev, referralCode: code }));
      }
    } catch (error) {
      console.error('获取邀请码失败:', error);
    }
  };
  
  loadReferralCode();
}, []);
```

### 后端组件

#### 1. ReferralVisit 数据模型

**Schema定义：**

```javascript
{
  referralCode: String,      // 邀请码
  fingerprint: String,       // 设备指纹
  ip: String,               // IP地址
  userAgent: String,        // User Agent
  firstVisit: Date,         // 首次访问时间
  lastVisit: Date,          // 最后访问时间
  visitCount: Number,       // 访问次数
  converted: Boolean,       // 是否已转化
  convertedUserId: ObjectId, // 转化用户ID
  expiresAt: Date          // 过期时间（30天）
}
```

**索引策略：**

```javascript
// 单字段索引
referralCode: 1
fingerprint: 1
expiresAt: 1 (TTL索引)

// 复合索引
{ fingerprint: 1, referralCode: 1 }
{ ip: 1, referralCode: 1 }
{ converted: 1, expiresAt: 1 }
```

#### 2. Referral API Routes

**POST /api/referral/track**

追踪邀请访问

```javascript
Request Body:
{
  referralCode: string,
  fingerprint: string
}

Response:
{
  success: boolean,
  message: string
}
```

**逻辑流程：**
1. 验证参数完整性
2. 验证邀请码是否存在（查询User表）
3. 查找现有访问记录（fingerprint + referralCode + converted=false）
4. 如果存在：更新lastVisit、visitCount、ip
5. 如果不存在：创建新记录
6. 返回成功响应

**POST /api/referral/get-code**

获取邀请码

```javascript
Request Body:
{
  fingerprint: string
}

Response:
{
  success: boolean,
  referralCode: string | null
}
```

**逻辑流程：**
1. 按设备指纹查询（fingerprint + converted=false + expiresAt>now）
2. 如果找到：返回邀请码
3. 如果未找到：按IP查询（降级方案）
4. 返回邀请码或null

#### 3. Auth Routes 集成

**POST /api/auth/register 修改**

在注册成功后标记转化：

```javascript
// 创建用户后
await user.save();

// 标记邀请访问为已转化
if (referralCode) {
  try {
    await ReferralVisit.updateMany(
      {
        referralCode,
        converted: false,
        $or: [
          { fingerprint: req.body.fingerprint },
          { ip: req.ip }
        ]
      },
      {
        $set: {
          converted: true,
          convertedUserId: user._id
        }
      }
    );
  } catch (error) {
    console.error('更新邀请访问记录失败:', error);
    // 不影响注册流程
  }
}
```

## 数据模型

### ReferralVisit 集合

```javascript
{
  _id: ObjectId,
  referralCode: "ABC123",
  fingerprint: "1234567890",
  ip: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  firstVisit: ISODate("2024-01-01T00:00:00Z"),
  lastVisit: ISODate("2024-01-05T12:30:00Z"),
  visitCount: 5,
  converted: false,
  convertedUserId: null,
  expiresAt: ISODate("2024-01-31T00:00:00Z"),
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-05T12:30:00Z")
}
```

### 状态转换

```
[新访问] → converted: false, convertedUserId: null
    │
    ├─► [重复访问] → 更新 lastVisit, visitCount++
    │
    └─► [用户注册] → converted: true, convertedUserId: ObjectId
            │
            └─► [30天后] → 自动删除（TTL索引）
```

## 错误处理

### 前端错误处理

#### 1. Cookie/LocalStorage 不可用

```typescript
export const setReferralStorage = (referralCode: string): void => {
  try {
    localStorage.setItem(REFERRAL_STORAGE_KEY, referralCode);
  } catch (e) {
    console.warn('LocalStorage not available, falling back to Cookie');
    // Cookie作为备份
  }
};
```

#### 2. 网络请求失败

```typescript
export const trackReferralVisit = async (referralCode: string): Promise<void> => {
  try {
    // 先保存到本地
    setReferralCookie(referralCode);
    setReferralStorage(referralCode);

    // 再发送到服务器（失败不影响本地存储）
    await fetch('/api/referral/track', { ... });
  } catch (error) {
    console.error('Track referral visit error:', error);
    // 静默失败，不影响用户体验
  }
};
```

#### 3. 设备指纹生成失败

```typescript
export const generateFingerprint = (): string => {
  try {
    // 正常生成逻辑
    return hashCode(fingerprint).toString();
  } catch (error) {
    // 降级：使用随机值
    return 'fallback_' + Math.random().toString(36).substring(7);
  }
};
```

### 后端错误处理

#### 1. 邀请码不存在

```javascript
const referrer = await User.findOne({ referralCode });
if (!referrer) {
  return res.status(404).json({
    success: false,
    message: '邀请码不存在'
  });
}
```

#### 2. 数据库操作失败

```javascript
try {
  await visit.save();
  res.json({ success: true });
} catch (error) {
  console.error('Save visit error:', error);
  res.status(500).json({
    success: false,
    message: '记录失败'
  });
}
```

#### 3. 转化标记失败

```javascript
// 在注册流程中
try {
  await ReferralVisit.updateMany(...);
} catch (error) {
  console.error('更新邀请访问记录失败:', error);
  // 不影响注册流程，只记录错误
}
```

## 测试策略

### 单元测试

#### 前端测试

```typescript
describe('referralTracking', () => {
  test('generateFingerprint returns consistent value', () => {
    const fp1 = generateFingerprint();
    const fp2 = generateFingerprint();
    expect(fp1).toBe(fp2);
  });

  test('Cookie operations work correctly', () => {
    setReferralCookie('TEST123');
    expect(getReferralCookie()).toBe('TEST123');
  });

  test('getReferralCode follows priority order', async () => {
    // Mock Cookie, LocalStorage, API
    // Verify priority: Cookie > LocalStorage > API
  });
});
```

#### 后端测试

```javascript
describe('Referral API', () => {
  test('POST /api/referral/track creates new visit', async () => {
    const response = await request(app)
      .post('/api/referral/track')
      .send({ referralCode: 'ABC123', fingerprint: 'fp123' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('POST /api/referral/track updates existing visit', async () => {
    // Create initial visit
    // Send same fingerprint + referralCode
    // Verify visitCount incremented
  });

  test('POST /api/referral/get-code returns code by fingerprint', async () => {
    // Create visit record
    // Query by fingerprint
    // Verify correct code returned
  });
});
```

### 集成测试

#### 场景1：正常流程

```javascript
test('Complete referral flow', async () => {
  // 1. 用户访问邀请链接
  await visitWithReferralLink('ABC123');
  
  // 2. 验证Cookie和LocalStorage
  expect(getCookie('ref_code')).toBe('ABC123');
  expect(localStorage.getItem('referral_code')).toBe('ABC123');
  
  // 3. 验证数据库记录
  const visit = await ReferralVisit.findOne({ referralCode: 'ABC123' });
  expect(visit).toBeTruthy();
  
  // 4. 用户注册
  await register({ referralCode: 'ABC123' });
  
  // 5. 验证转化标记
  const updatedVisit = await ReferralVisit.findOne({ referralCode: 'ABC123' });
  expect(updatedVisit.converted).toBe(true);
});
```

#### 场景2：Cookie失效

```javascript
test('Fallback to server when Cookie expired', async () => {
  // 1. 创建服务器记录
  await ReferralVisit.create({ referralCode: 'ABC123', fingerprint: 'fp123' });
  
  // 2. 清除Cookie和LocalStorage
  clearCookie('ref_code');
  localStorage.clear();
  
  // 3. 获取邀请码
  const code = await getReferralCode();
  
  // 4. 验证从服务器获取
  expect(code).toBe('ABC123');
});
```

### 性能测试

```javascript
test('Handle concurrent visits', async () => {
  const promises = [];
  for (let i = 0; i < 100; i++) {
    promises.push(
      request(app)
        .post('/api/referral/track')
        .send({ referralCode: 'ABC123', fingerprint: `fp${i}` })
    );
  }
  
  const results = await Promise.all(promises);
  expect(results.every(r => r.status === 200)).toBe(true);
});
```

## 性能优化

### 数据库优化

#### 1. 索引策略

```javascript
// 查询优化
referralVisitSchema.index({ fingerprint: 1, referralCode: 1 });
referralVisitSchema.index({ ip: 1, referralCode: 1 });
referralVisitSchema.index({ converted: 1, expiresAt: 1 });

// TTL自动清理
referralVisitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

#### 2. 查询优化

```javascript
// 使用投影减少数据传输
const visit = await ReferralVisit.findOne(
  { fingerprint, converted: false },
  { referralCode: 1, _id: 0 }  // 只返回需要的字段
).lean();  // 返回普通对象，不是Mongoose文档
```

#### 3. 批量更新

```javascript
// 使用updateMany而不是循环update
await ReferralVisit.updateMany(
  { referralCode, converted: false },
  { $set: { converted: true } }
);
```

### 前端优化

#### 1. 异步非阻塞

```typescript
// 不等待追踪完成
trackReferralVisit(referralCode).catch(console.error);

// 继续页面渲染
```

#### 2. 缓存设备指纹

```typescript
let cachedFingerprint: string | null = null;

export const generateFingerprint = (): string => {
  if (cachedFingerprint) {
    return cachedFingerprint;
  }
  
  // 生成指纹
  cachedFingerprint = hashCode(fingerprint).toString();
  return cachedFingerprint;
};
```

#### 3. 防抖处理

```typescript
// 避免重复追踪
let trackingInProgress = false;

export const trackReferralVisit = async (referralCode: string): Promise<void> => {
  if (trackingInProgress) return;
  
  trackingInProgress = true;
  try {
    // 追踪逻辑
  } finally {
    trackingInProgress = false;
  }
};
```

## 安全考虑

### 1. 数据验证

```javascript
// 后端验证
if (!referralCode || !/^[A-Z0-9]{6}$/.test(referralCode)) {
  return res.status(400).json({ message: '无效的邀请码格式' });
}

if (!fingerprint || fingerprint.length > 100) {
  return res.status(400).json({ message: '无效的设备指纹' });
}
```

### 2. 速率限制

```javascript
// 使用现有的rateLimit中间件
router.post('/track', 
  rateLimit('referral_track', 60, 10),  // 每分钟10次
  async (req, res) => { ... }
);
```

### 3. 隐私保护

```javascript
// 不记录敏感信息
const visit = new ReferralVisit({
  referralCode,
  fingerprint,
  ip: anonymizeIP(ip),  // IP匿名化
  userAgent: sanitizeUserAgent(userAgent)  // 清理User Agent
});
```

### 4. XSS防护

```typescript
// 前端验证邀请码
const sanitizeReferralCode = (code: string): string => {
  return code.replace(/[^A-Z0-9]/g, '').substring(0, 10);
};
```

## 监控和日志

### 关键指标

```javascript
// 追踪成功率
const trackingSuccessRate = successfulTracks / totalTracks;

// 转化率
const conversionRate = convertedVisits / totalVisits;

// 平均访问次数
const avgVisitCount = totalVisitCount / uniqueVisitors;

// 邀请码获取成功率
const codeRetrievalRate = {
  fromCookie: cookieHits / totalRequests,
  fromLocalStorage: storageHits / totalRequests,
  fromServer: serverHits / totalRequests
};
```

### 日志记录

```javascript
// 关键操作日志
console.log('[Referral] Visit tracked:', {
  referralCode,
  fingerprint: fingerprint.substring(0, 8) + '...',
  isNewVisit: !existingVisit
});

console.log('[Referral] Conversion marked:', {
  referralCode,
  userId: user._id,
  matchedBy: 'fingerprint' // or 'ip'
});
```

## 部署注意事项

### 1. 数据库迁移

```javascript
// 创建索引
db.referralvisits.createIndex({ fingerprint: 1, referralCode: 1 });
db.referralvisits.createIndex({ ip: 1, referralCode: 1 });
db.referralvisits.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### 2. 环境变量

```env
# Cookie配置
REFERRAL_COOKIE_DAYS=30

# 数据过期时间
REFERRAL_EXPIRY_DAYS=30
```

### 3. 兼容性检查

- 确保MongoDB版本支持TTL索引（>= 2.2）
- 确保浏览器支持Canvas API
- 确保Cookie和LocalStorage可用

### 4. 回滚计划

如果出现问题，可以：
1. 禁用服务器端追踪，只使用前端存储
2. 回退到简单的Cookie方案
3. 暂时允许手动输入邀请码

## 未来改进

### 短期改进

1. **增强设备指纹**
   - 添加更多浏览器特征
   - 使用WebGL指纹
   - 添加字体检测

2. **改进匹配算法**
   - 使用模糊匹配
   - 考虑时间权重
   - 多设备关联

3. **统计分析**
   - 邀请效果分析
   - 转化漏斗分析
   - 地域分布统计

### 长期改进

1. **Redis缓存**
   - 缓存热门邀请码
   - 缓存设备指纹映射
   - 减少数据库查询

2. **机器学习**
   - 识别异常访问模式
   - 预测转化概率
   - 优化匹配算法

3. **跨域追踪**
   - 支持多域名
   - 支持子域名
   - 统一用户身份
