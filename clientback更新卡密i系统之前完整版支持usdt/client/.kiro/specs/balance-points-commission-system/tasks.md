# 实施计划

## 1. 后端数据模型更新

- [ ] 1.1 更新User模型添加commission字段
  - 在`server/models/User.js`中添加`commission: { type: Number, default: 0 }`
  - 添加索引以优化查询性能
  - _需求: 1, 3, 4_

- [ ] 1.2 更新BalanceLog模型支持三种货币
  - 添加`currency`字段：points/balance/commission
  - 更新`type`枚举：添加commission、commission_to_balance等类型
  - 添加`relatedUserId`字段用于记录关联用户
  - _需求: 1, 2, 3, 4, 5_

## 2. 佣金计算服务

- [ ] 2.1 创建佣金计算服务
  - 创建`server/services/commissionService.js`
  - 实现`calculateCommission`方法计算推荐佣金
  - 支持多级佣金（一级、二级、三级）
  - _需求: 3_

- [ ] 2.2 在充值流程中集成佣金计算
  - 修改`server/services/rechargeService.js`
  - 在`processPointsRecharge`中调用佣金计算
  - 在`processVipRecharge`中调用佣金计算
  - 记录佣金日志
  - _需求: 3_

## 3. 佣金提现功能

- [ ] 3.1 实现佣金提现到USDT
  - 更新`server/routes/withdraw.js`
  - 添加`POST /api/withdraw/commission`路由
  - 验证提现金额和最低额度
  - 创建提现订单
  - 扣除佣金并记录日志
  - _需求: 4_

- [ ] 3.2 实现佣金转入余额
  - 在withdraw路由中添加转余额选项
  - 扣除佣金，增加余额
  - 记录两条日志（佣金减少、余额增加）
  - _需求: 4_

## 4. 余额兑换积分功能

- [ ] 4.1 实现余额兑换积分API
  - 更新`server/routes/user.js`
  - 实现`POST /api/user/exchange-points`路由
  - 从SystemConfig读取兑换汇率
  - 验证余额是否足够
  - 扣除余额，增加积分
  - 记录兑换日志
  - _需求: 5_

- [ ] 4.2 添加获取兑换汇率API
  - 添加`GET /api/shop/exchange-rate`路由
  - 返回当前兑换汇率配置
  - _需求: 5_

## 5. 商城页面开发

- [ ] 5.1 创建商城主页
  - 创建`src/pages/Shop/Shop.tsx`
  - 显示商城导航和功能入口
  - 添加余额兑换积分入口
  - _需求: 6_

- [ ] 5.2 创建余额兑换积分页面
  - 创建`src/pages/Shop/ExchangePoints.tsx`
  - 显示当前余额和积分
  - 显示兑换汇率
  - 实现兑换表单（输入框、计算、确认按钮）
  - 显示兑换历史记录
  - _需求: 5, 6_

- [ ] 5.3 添加商城路由
  - 更新`src/App.tsx`
  - 添加`/shop`和`/shop/exchange`路由
  - _需求: 6_

## 6. 导航栏更新

- [ ] 6.1 在Header中添加商城菜单
  - 更新`src/components/Layout/Header.tsx`
  - 在导航菜单中添加"商城"项
  - 设置正确的路由链接
  - _需求: 6_

## 7. Dashboard更新

- [ ] 7.1 显示三种货币
  - 更新`src/pages/Dashboard/Dashboard.tsx`
  - 显示积分、余额、佣金三个统计卡片
  - 添加相应的图标和说明
  - _需求: 1, 3, 4, 5_

- [ ] 7.2 更新用户信息API
  - 确保`GET /api/user/profile`返回commission字段
  - 更新前端类型定义
  - _需求: 3_

## 8. 积分记录页面更新

- [ ] 8.1 更新BalanceLogs显示
  - 更新`src/pages/Dashboard/BalanceLogs.tsx`
  - 支持显示三种货币的记录
  - 更新类型标签和颜色
  - 添加佣金相关类型的显示
  - _需求: 1, 2, 3, 4, 5_

- [ ] 8.2 添加佣金记录页面
  - 创建`src/pages/Dashboard/CommissionLogs.tsx`
  - 显示佣金获得和提现记录
  - 显示推荐来源用户信息
  - _需求: 3, 4_

## 9. 管理员配置更新

- [ ] 9.1 更新SystemConfig模型
  - 确保`exchangeRate`字段存在
  - 确保佣金相关配置字段存在
  - _需求: 7_

- [ ] 9.2 更新积分配置页面
  - 确保`src/pages/Admin/PointsConfig.tsx`包含兑换汇率配置
  - 添加佣金比例配置项
  - 添加提现相关配置项
  - _需求: 7_

## 10. API工具方法更新

- [ ] 10.1 添加前端API方法
  - 更新`src/utils/api.ts`
  - 添加`exchangePoints`方法
  - 添加`withdrawCommission`方法
  - 添加`getCommissionLogs`方法
  - 添加`getExchangeRate`方法
  - _需求: 4, 5_

## 11. 测试和验证

- [ ] 11.1 测试充值流程
  - 测试积分充值
  - 验证佣金计算正确
  - 验证日志记录完整
  - _需求: 1, 3_

- [ ] 11.2 测试佣金提现
  - 测试提现到USDT
  - 测试转入余额
  - 验证金额计算正确
  - _需求: 4_

- [ ] 11.3 测试余额兑换
  - 测试兑换流程
  - 验证汇率计算正确
  - 验证余额和积分变动正确
  - _需求: 5_

- [ ] 11.4 测试商城页面
  - 测试页面显示
  - 测试兑换功能
  - 测试错误处理
  - _需求: 6_

## 12. 文档和部署

- [ ] 12.1 创建数据库迁移脚本
  - 创建脚本添加User.commission字段
  - 创建脚本更新BalanceLog模型
  - _需求: 所有_

- [ ] 12.2 更新用户文档
  - 说明三种货币的用途
  - 说明佣金获取和提现流程
  - 说明余额兑换流程
  - _需求: 所有_

- [ ] 12.3 更新管理员文档
  - 说明配置项的作用
  - 说明如何调整汇率和比例
  - _需求: 7_
