# Requirements Document

## Introduction

本功能允许管理员在后台配置积分中心页面显示的"获取积分方式"和"积分用途"说明内容，使系统更加灵活和可定制化。

## Glossary

- **System**: 积分说明配置系统
- **Admin**: 系统管理员
- **User**: 普通用户
- **Points Description**: 积分说明，包括获取方式和用途
- **Earn Method**: 获取积分方式
- **Usage Method**: 积分用途

## Requirements

### Requirement 1

**User Story:** 作为管理员，我想要在后台配置"获取积分方式"列表，以便灵活调整积分获取渠道的展示

#### Acceptance Criteria

1. WHEN 管理员访问积分配置页面，THE System SHALL 显示"获取积分方式"配置区域
2. WHEN 管理员添加新的获取方式，THE System SHALL 允许输入标题、描述、奖励值和图标类型
3. WHEN 管理员保存配置，THE System SHALL 将配置存储到数据库
4. WHEN 管理员删除某个获取方式，THE System SHALL 从配置中移除该项
5. WHEN 管理员调整获取方式的顺序，THE System SHALL 保存新的排序

### Requirement 2

**User Story:** 作为管理员，我想要在后台配置"积分用途"列表，以便清晰说明积分的使用场景

#### Acceptance Criteria

1. WHEN 管理员访问积分配置页面，THE System SHALL 显示"积分用途"配置区域
2. WHEN 管理员添加新的用途说明，THE System SHALL 允许输入标题和描述
3. WHEN 管理员保存配置，THE System SHALL 将配置存储到数据库
4. WHEN 管理员删除某个用途说明，THE System SHALL 从配置中移除该项
5. WHEN 管理员调整用途说明的顺序，THE System SHALL 保存新的排序

### Requirement 3

**User Story:** 作为普通用户，我想要在积分中心看到最新的积分说明，以便了解如何获取和使用积分

#### Acceptance Criteria

1. WHEN 用户访问积分中心页面，THE System SHALL 从数据库加载最新的积分说明配置
2. WHEN 配置为空，THE System SHALL 显示默认的积分说明
3. WHEN 显示获取方式，THE System SHALL 按照管理员设置的顺序展示
4. WHEN 显示积分用途，THE System SHALL 按照管理员设置的顺序展示
5. WHEN 获取方式包含奖励值，THE System SHALL 显示对应的奖励数值

### Requirement 4

**User Story:** 作为管理员，我想要预览配置效果，以便在保存前确认显示是否正确

#### Acceptance Criteria

1. WHEN 管理员修改配置，THE System SHALL 实时显示预览效果
2. WHEN 预览显示，THE System SHALL 使用与用户页面相同的样式
3. WHEN 管理员点击保存，THE System SHALL 验证配置数据的完整性
4. IF 配置数据不完整，THEN THE System SHALL 显示错误提示
5. WHEN 保存成功，THE System SHALL 显示成功提示消息

### Requirement 5

**User Story:** 作为系统，我需要支持多种图标类型，以便管理员可以为不同的获取方式选择合适的图标

#### Acceptance Criteria

1. THE System SHALL 支持至少5种预定义图标类型（日历、用户、购物车、礼物、星星）
2. WHEN 管理员选择图标，THE System SHALL 显示图标预览
3. WHEN 保存配置，THE System SHALL 存储图标类型标识
4. WHEN 用户查看页面，THE System SHALL 根据图标类型显示对应的图标
5. WHEN 图标类型无效，THE System SHALL 使用默认图标
