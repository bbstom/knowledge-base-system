# Implementation Plan

- [x] 1. 后端API开发


  - 实现积分说明配置的后端API接口
  - _Requirements: 1.3, 2.3, 3.1_





- [ ] 1.1 扩展SystemConfig模型
  - 在SystemConfig的points字段中添加descriptions配置结构


  - 定义earnMethods和usageMethods数据结构
  - _Requirements: 1.3, 2.3_


- [x] 1.2 创建配置API路由

  - 在server/routes/systemConfig.js中添加GET /api/system-config/points-descriptions路由
  - 在server/routes/systemConfig.js中添加PUT /api/system-config/points-descriptions路由

  - 添加adminMiddleware权限验证
  - _Requirements: 1.1, 2.1, 4.3_


- [ ] 1.3 实现配置验证逻辑
  - 验证标题、描述、奖励值的长度和格式
  - 验证图标类型和颜色在预定义列表中
  - 确保至少有一个获取方式和一个用途


  - _Requirements: 4.3, 4.4_

- [x] 1.4 实现默认配置

  - 创建默认的earnMethods和usageMethods配置
  - 当数据库无配置时返回默认值
  - _Requirements: 3.2_

- [x] 2. 管理后台配置界面

  - 创建积分说明配置管理页面
  - _Requirements: 1.1, 2.1, 4.1_

- [ ] 2.1 创建PointsDescriptionConfig组件
  - 创建src/pages/Admin/PointsDescriptionConfig.tsx文件
  - 实现基本页面布局和状态管理
  - _Requirements: 1.1, 2.1_

- [x] 2.2 实现获取方式管理

  - 实现添加、编辑、删除获取方式功能
  - 实现拖拽排序或上下移动功能
  - 实现图标选择器和颜色选择器
  - _Requirements: 1.2, 1.4, 1.5, 5.1, 5.2_




- [ ] 2.3 实现积分用途管理
  - 实现添加、编辑、删除用途功能
  - 实现拖拽排序或上下移动功能
  - _Requirements: 2.2, 2.4, 2.5_

- [ ] 2.4 实现实时预览
  - 创建预览组件，使用与用户页面相同的样式
  - 实时显示配置修改效果
  - _Requirements: 4.1, 4.2_

- [ ] 2.5 实现保存和验证
  - 实现保存按钮和API调用
  - 添加前端验证逻辑



  - 显示成功/错误提示
  - _Requirements: 1.3, 2.3, 4.3, 4.4, 4.5_






- [ ] 2.6 集成到系统设置
  - 在SystemSettings页面添加"积分说明"标签
  - 集成PointsDescriptionConfig组件
  - _Requirements: 1.1, 2.1_



- [ ] 3. 用户界面改造
  - 修改积分中心页面以支持动态配置
  - _Requirements: 3.1, 3.3, 3.4, 3.5_

- [ ] 3.1 创建API调用函数
  - 在src/utils/api.ts中添加getPointsDescriptions函数
  - 实现错误处理和默认值fallback
  - _Requirements: 3.1, 3.2_

- [ ] 3.2 修改Points页面
  - 修改src/pages/Dashboard/Points.tsx以从API加载配置
  - 实现动态渲染获取方式列表
  - 实现动态渲染用途列表
  - 保留默认配置作为fallback
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3.3 实现图标映射
  - 创建图标类型到Lucide图标组件的映射
  - 实现颜色类到Tailwind类的映射
  - 处理无效图标类型的fallback
  - _Requirements: 5.3, 5.4, 5.5_

- [ ] 4. 文档和测试
  - 创建使用文档和测试配置
  - _Requirements: All_

- [ ] 4.1 创建使用文档
  - 编写管理员配置指南
  - 说明各字段的含义和限制
  - 提供配置示例

- [ ] 4.2 添加错误处理文档
  - 列出所有可能的错误情况
  - 提供解决方案

- [ ] 4.3 创建测试脚本
  - 创建测试默认配置的脚本
  - 创建测试API的脚本
  - 验证数据完整性
