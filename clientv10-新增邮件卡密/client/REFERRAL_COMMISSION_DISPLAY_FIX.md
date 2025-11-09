# 推荐用户佣金显示修复

## 问题描述
被邀请用户充值后，他的上级用户在"推荐奖励-推荐用户列表"中看到的佣金显示为0。

## 问题原因
后端API `/api/user/referral-stats` 只返回了推荐用户的基本信息（用户名、注册时间），没有返回：
- 累计消费金额（totalSpent）
- 产生的佣金（commissionEarned）

## 修复内容

### 后端API修改
修改 `server/routes/user.js` 中的 `GET /api/user/referral-stats` 端点：

**修改前**
```javascript
referredUsers: referredUsers.map(u => ({
  username: u.username,
  createdAt: u.createdAt
}))
```

**修改后**
```javascript
// 为每个推荐用户计算累计消费和产生的佣金
const referredUsersWithStats = await Promise.all(
  referredUsers.map(async (user) => {
    // 计算该用户的累计充值金额（作为累计消费）
    const totalSpent = user.totalRecharged || 0;
    
    // 查询推荐人从该用户获得的佣金总额
    const commissionLogs = await BalanceLog.find({
      userId: req.user._id,
      type: 'commission',
      relatedUserId: user._id
    });
    
    const commissionEarned = commissionLogs.reduce((sum, log) => sum + log.amount, 0);
    
    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      totalSpent: totalSpent,
      commissionEarned: commissionEarned
    };
  })
);
```

### 返回数据结构

**修改后的API响应**
```json
{
  "success": true,
  "data": {
    "referralCode": "ABC123",
    "totalReferrals": 2,
    "totalEarnings": 15.5,
    "referredUsers": [
      {
        "_id": "user_id_1",
        "username": "user1",
        "email": "user1@example.com",
        "createdAt": "2024-10-23T10:00:00Z",
        "totalSpent": 100,
        "commissionEarned": 15
      },
      {
        "_id": "user_id_2",
        "username": "user2",
        "email": "user2@example.com",
        "createdAt": "2024-10-23T11:00:00Z",
        "totalSpent": 50,
        "commissionEarned": 7.5
      }
    ]
  }
}
```

## 数据来源

### 累计消费（totalSpent）
- 来源：`user.totalRecharged`
- 说明：用户的累计充值金额

### 产生的佣金（commissionEarned）
- 来源：`BalanceLog` 表
- 查询条件：
  - `userId`: 推荐人ID（当前登录用户）
  - `type`: 'commission'
  - `relatedUserId`: 被推荐用户ID
- 计算：所有符合条件的记录的 `amount` 字段求和

## 前端显示

推荐用户列表表格中会显示：
- 用户名
- 注册时间
- 状态（已激活）
- 累计消费：`$${totalSpent.toFixed(2)}`
- 我的佣金：`$${commissionEarned.toFixed(2)}`

## 佣金计算逻辑

当被推荐用户进行消费时：
1. 系统在 `commissionService.js` 中计算佣金
2. 创建 `BalanceLog` 记录：
   - `userId`: 推荐人ID
   - `type`: 'commission'
   - `currency`: 'commission'
   - `amount`: 佣金金额（消费金额 × 15%）
   - `relatedUserId`: 被推荐用户ID
3. 更新推荐人的 `commission` 余额

## 是否需要重启服务器？

**需要**！因为修改了后端代码，需要重启Node.js服务器才能生效。

重启命令：
```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
npm run dev
# 或
node server/index.js
```

## 验证步骤

1. **重启服务器**
2. **登录推荐人账号**
3. **进入"推荐奖励"页面**
4. **查看推荐用户列表**
5. **验证显示**：
   - 累计消费应该显示被推荐用户的充值金额
   - 我的佣金应该显示从该用户获得的佣金总额

## 测试场景

### 场景1：新推荐用户未消费
- 累计消费：$0.00
- 我的佣金：$0.00

### 场景2：推荐用户已充值
- 累计消费：显示充值金额（如$100.00）
- 我的佣金：显示获得的佣金（如$15.00，即100×15%）

### 场景3：推荐用户多次充值
- 累计消费：所有充值金额之和
- 我的佣金：所有佣金记录之和

## 注意事项

1. **totalRecharged字段**：确保User模型中有这个字段，并且在充值时正确更新
2. **relatedUserId字段**：确保BalanceLog中记录了这个字段，用于关联被推荐用户
3. **佣金计算**：确保commissionService正确创建了BalanceLog记录

## 总结

修复后，推荐用户列表将正确显示每个被推荐用户的累计消费和产生的佣金，不再显示为0。需要重启服务器才能生效。
