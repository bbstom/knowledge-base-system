# 配置不生效问题调试指南

## 问题
后台配置设置为1.5积分，但新注册用户还是获得100积分。

## 调试步骤

### 步骤1：检查服务器日志

添加了调试日志到注册代码中。现在注册新用户时，服务器控制台会显示：

```
📊 系统配置: { registerReward: 1.5, referralReward: 1.5, referredUserReward: undefined }
🎁 注册奖励积分: 1.5
```

如果显示的是100而不是1.5，说明配置没有正确保存。

### 步骤2：重启服务器

**必须重启服务器才能读取新配置！**

```bash
# 停止服务器（Ctrl+C）
# 重新启动
npm run dev
```

### 步骤3：检查数据库中的配置

使用MongoDB命令行：

```bash
mongo knowbase

# 查看配置
db.systemconfigs.findOne()

# 查看points字段
db.systemconfigs.findOne({}, { points: 1 })
```

应该看到：
```javascript
{
  points: {
    registerReward: 1.5,
    referralReward: 1.5,
    // ... 其他字段
  }
}
```

### 步骤4：手动设置配置（如果管理后台不工作）

```bash
mongo knowbase

# 更新配置
db.systemconfigs.updateOne(
  {},
  {
    $set: {
      "points.registerReward": 1.5,
      "points.referralReward": 1.5
    }
  },
  { upsert: true }
)

# 验证
db.systemconfigs.findOne({}, { points: 1 })
```

### 步骤5：测试注册

1. 重启服务器
2. 注册新用户
3. 查看服务器控制台日志
4. 应该显示：`🎁 注册奖励积分: 1.5`
5. 用户应该获得1.5积分

## 常见问题

### Q1：为什么配置不生效？

**原因1：服务器没有重启**
- 配置修改后必须重启服务器
- Node.js不会自动重新读取配置

**原因2：配置没有保存到数据库**
- 管理后台保存失败
- 需要手动在数据库中设置

**原因3：配置字段名错误**
- 确保使用正确的字段名：
  - `registerReward` - 注册奖励
  - `referralReward` - 推荐人奖励
  - `referredUserReward` - 被推荐用户奖励（未使用）

### Q2：如何验证配置已保存？

```bash
mongo knowbase
db.systemconfigs.findOne({}, { points: 1 })
```

### Q3：如何验证配置已生效？

1. 重启服务器
2. 注册新用户
3. 查看服务器控制台日志
4. 应该显示配置的值而不是100

### Q4：管理后台在哪里设置？

1. 登录管理后台
2. 进入"系统设置"
3. 找到"积分配置"
4. 设置"注册奖励"和"推荐奖励"
5. 点击"保存"
6. **重启服务器**

## 配置字段说明

### SystemConfig.points 字段

```javascript
{
  registerReward: 1.5,          // 注册奖励（新用户注册获得）
  referralReward: 1.5,          // 推荐人奖励（推荐人获得）
  referredUserReward: 50,       // 被推荐用户额外奖励（未实现）
  dailyCheckIn: 10,             // 每日签到奖励
  searchCost: 10,               // 搜索消耗积分
  exchangeRate: 10,             // 余额兑换积分汇率
  minWithdrawAmount: 50,        // 最低提现金额
  withdrawFee: 5,               // 提现手续费百分比
  // ... 其他字段
}
```

### 当前使用的字段

注册流程中使用：
- `registerReward` - 新用户注册时获得的积分
- `referralReward` - 推荐人获得的积分

未使用：
- `referredUserReward` - 被推荐用户的额外奖励（可以实现）

## 解决方案

### 方案1：使用管理后台（推荐）

1. 登录管理后台
2. 设置配置
3. 保存
4. **重启服务器**
5. 测试注册

### 方案2：直接修改数据库

```bash
mongo knowbase

db.systemconfigs.updateOne(
  {},
  {
    $set: {
      "points.registerReward": 1.5,
      "points.referralReward": 1.5
    }
  },
  { upsert: true }
)
```

然后重启服务器。

### 方案3：检查管理后台保存逻辑

如果管理后台保存不工作，需要检查：
- `server/routes/systemConfig.js` 中的保存逻辑
- 前端的保存请求是否正确发送
- 是否有错误日志

## 验证清单

- [ ] 配置已在管理后台设置
- [ ] 配置已保存（点击保存按钮）
- [ ] 数据库中有正确的配置值
- [ ] 服务器已重启
- [ ] 注册新用户测试
- [ ] 服务器日志显示正确的配置值
- [ ] 用户获得正确的积分

## 总结

配置不生效的最常见原因是**服务器没有重启**。修改配置后必须重启服务器才能生效。

如果重启后还是不生效，检查数据库中的配置是否正确保存。
