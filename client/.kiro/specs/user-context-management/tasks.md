# 用户状态管理系统 - 实施计划

## 任务列表

- [x] 1. 创建UserContext和Provider


  - 创建 `src/contexts/UserContext.tsx`
  - 定义UserState接口
  - 实现UserProvider组件
  - 实现loadUser、updateUser等方法
  - _需求: 1, 2_



- [x] 2. 创建useUser Hook

  - 创建 `src/hooks/useUser.ts`
  - 导出useUser hook



  - 提供类型安全的访问
  - _需求: 1_




- [ ] 3. 集成到App.tsx
  - 用UserProvider包裹应用
  - 确保在Router之外
  - _需求: 1, 2_





- [ ] 4. 更新Header组件
  - 使用useUser获取用户信息

  - 显示实时积分和余额
  - 移除localStorage依赖




  - _需求: 3, 4_

- [x] 5. 更新Search页面


  - 导入useUser hook
  - 搜索成功后更新积分


  - 使用remainingPoints更新Context
  - _需求: 3_



- [ ] 6. 更新充值相关页面
  - 充值成功后调用refreshUser
  - 卡密充值成功后刷新


  - _需求: 4_

- [ ] 7. 更新Dashboard页面
  - 使用useUser显示用户信息
  - 移除重复的API调用
  - _需求: 3, 4_

- [ ] 8. 测试和验证
  - 测试登录后加载用户信息
  - 测试搜索后积分更新
  - 测试充值后余额更新
  - 测试登出后状态清除
  - _需求: 所有_
