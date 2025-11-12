# 抽奖系统实现任务清单

## 阶段 1: 数据模型和基础服务 (30分钟)

### 后端
- [ ] 创建 LotteryActivity 模型 (`server/models/LotteryActivity.js`)
- [ ] 创建 LotteryRecord 模型 (`server/models/LotteryRecord.js`)
- [ ] 创建抽奖服务 (`server/services/lotteryService.js`)
  - [ ] 抽奖算法实现
  - [ ] 库存管理
  - [ ] 次数限制检查
  - [ ] 奖品发放逻辑

## 阶段 2: 管理端 API (45分钟)

### 后端路由
- [ ] 创建管理端路由 (`server/routes/lottery.js`)
  - [ ] GET /api/admin/lottery/activities - 获取活动列表
  - [ ] POST /api/admin/lottery/activities - 创建活动
  - [ ] PUT /api/admin/lottery/activities/:id - 更新活动
  - [ ] DELETE /api/admin/lottery/activities/:id - 删除活动
  - [ ] GET /api/admin/lottery/records - 获取记录
  - [ ] PUT /api/admin/lottery/records/:id/status - 更新记录状态
  - [ ] GET /api/admin/lottery/statistics/:id - 获取统计

### 前端管理页面
- [ ] 创建管理页面 (`src/pages/Admin/LotteryManagement.tsx`)
  - [ ] 活动列表展示
  - [ ] 创建/编辑活动表单
  - [ ] 奖品配置界面
  - [ ] 抽奖记录查询
  - [ ] 统计报表展示

## 阶段 3: 用户端 API 和页面 (45分钟)

### 后端路由
- [ ] 创建用户端路由 (`server/routes/lottery.js`)
  - [ ] GET /api/lottery/activities - 获取可用活动
  - [ ] POST /api/lottery/draw/:activityId - 参与抽奖
  - [ ] GET /api/lottery/records - 我的记录
  - [ ] POST /api/lottery/claim/:recordId - 领取奖品

### 前端用户页面
- [ ] 创建抽奖页面 (`src/pages/Dashboard/Lottery.tsx`)
  - [ ] 活动列表展示
  - [ ] 抽奖转盘组件
  - [ ] 中奖动画效果
  - [ ] 我的中奖记录

## 阶段 4: 抽奖动画组件 (30分钟)

### 前端组件
- [ ] 创建转盘组件 (`src/components/LotteryWheel.tsx`)
  - [ ] 转盘UI设计
  - [ ] 旋转动画
  - [ ] 中奖提示
  - [ ] 音效（可选）

## 阶段 5: API 集成和测试 (30分钟)

### API 集成
- [ ] 更新 adminApi.ts 添加抽奖管理 API
- [ ] 更新 api.ts 添加用户抽奖 API
- [ ] 添加路由到 App.tsx

### 测试
- [ ] 创建测试脚本 (`server/scripts/testLottery.js`)
- [ ] 测试抽奖算法
- [ ] 测试并发抽奖
- [ ] 测试库存控制

## 阶段 6: 优化和文档 (20分钟)

### 优化
- [ ] 添加数据库索引
- [ ] 添加缓存策略
- [ ] 性能测试

### 文档
- [ ] 创建使用文档
- [ ] 创建部署指南
- [ ] 更新 README

## 预计总时间: 3-4 小时

## 优先级
1. **P0 (核心功能)**: 阶段 1-3
2. **P1 (增强功能)**: 阶段 4
3. **P2 (优化)**: 阶段 5-6

## 依赖
- 用户积分系统（已有）
- VIP系统（已有）
- 管理员权限系统（已有）
