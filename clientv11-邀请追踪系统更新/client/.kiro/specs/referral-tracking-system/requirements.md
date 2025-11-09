# 邀请追踪系统 - 需求文档

## 简介

本文档定义了一个强大的邀请追踪系统，能够在用户多次访问网站的情况下，准确识别和归属邀请关系。系统采用混合方案，结合前端存储（Cookie + LocalStorage）和后端数据库记录，确保邀请关系的准确追踪。

## 术语表

- **ReferralSystem**: 邀请追踪系统
- **ReferralCode**: 邀请码，用于标识推荐人
- **DeviceFingerprint**: 设备指纹，基于浏览器和设备特征生成的唯一标识
- **ReferralVisit**: 邀请访问记录，存储在数据库中
- **ConversionTracking**: 转化追踪，记录访问者是否完成注册

## 需求

### 需求 1: 邀请链接访问追踪

**用户故事:** 作为系统，我希望能够追踪通过邀请链接访问的用户，以便准确记录邀请关系。

#### 验收标准

1. WHEN 用户通过包含邀请码参数的URL访问网站，THE ReferralSystem SHALL 提取邀请码并生成设备指纹
2. WHEN 邀请码被提取后，THE ReferralSystem SHALL 将邀请码同时保存到Cookie、LocalStorage和服务器数据库
3. THE ReferralSystem SHALL 为Cookie设置30天的有效期
4. THE ReferralSystem SHALL 在服务器端记录设备指纹、IP地址、User Agent和访问时间
5. WHEN 邀请码保存成功后，THE ReferralSystem SHALL 从URL中移除邀请码参数，避免重复追踪

### 需求 2: 设备指纹生成

**用户故事:** 作为系统，我希望能够生成唯一的设备指纹，以便在Cookie失效后仍能识别用户设备。

#### 验收标准

1. THE ReferralSystem SHALL 基于Canvas指纹、屏幕分辨率、浏览器信息和时区生成设备指纹
2. THE DeviceFingerprint SHALL 使用哈希算法生成唯一标识
3. THE ReferralSystem SHALL 确保相同设备生成相同的指纹
4. THE ReferralSystem SHALL 在指纹生成失败时使用随机值作为降级方案

### 需求 3: 邀请码获取优先级

**用户故事:** 作为系统，我希望在用户注册时能够按优先级获取邀请码，以便最大化邀请关系的准确性。

#### 验收标准

1. WHEN 用户开始注册流程，THE ReferralSystem SHALL 首先尝试从Cookie中获取邀请码
2. IF Cookie中没有邀请码，THEN THE ReferralSystem SHALL 尝试从LocalStorage中获取邀请码
3. IF 前端存储都没有邀请码，THEN THE ReferralSystem SHALL 通过设备指纹从服务器数据库中查询邀请码
4. IF 设备指纹匹配失败，THEN THE ReferralSystem SHALL 通过IP地址从服务器数据库中查询邀请码
5. THE ReferralSystem SHALL 在注册表单中自动填充获取到的邀请码

### 需求 4: 服务器端邀请访问记录

**用户故事:** 作为系统，我希望在服务器端记录邀请访问信息，以便在前端存储失效时仍能追踪邀请关系。

#### 验收标准

1. THE ReferralSystem SHALL 创建ReferralVisit数据模型，包含邀请码、设备指纹、IP地址、User Agent等字段
2. WHEN 接收到邀请访问追踪请求，THE ReferralSystem SHALL 在数据库中创建或更新访问记录
3. IF 相同设备指纹和邀请码的记录已存在，THEN THE ReferralSystem SHALL 更新最后访问时间和访问次数
4. THE ReferralSystem SHALL 为访问记录设置30天的自动过期时间
5. THE ReferralSystem SHALL 为邀请码、设备指纹和IP地址字段创建索引以优化查询性能

### 需求 5: 邀请码查询API

**用户故事:** 作为前端应用，我希望能够通过API查询邀请码，以便在前端存储失效时获取邀请关系。

#### 验收标准

1. THE ReferralSystem SHALL 提供POST /api/referral/get-code接口用于查询邀请码
2. WHEN 接收到查询请求，THE ReferralSystem SHALL 首先通过设备指纹查询数据库
3. IF 设备指纹查询失败，THEN THE ReferralSystem SHALL 通过IP地址查询数据库
4. THE ReferralSystem SHALL 返回最近30天内的有效邀请码
5. THE ReferralSystem SHALL 优先返回访问次数最多的邀请码

### 需求 6: 注册转化追踪

**用户故事:** 作为系统，我希望能够追踪邀请访问是否转化为注册，以便统计邀请效果。

#### 验收标准

1. WHEN 用户完成注册，THE ReferralSystem SHALL 标记对应的邀请访问记录为已转化
2. THE ReferralSystem SHALL 通过设备指纹和IP地址匹配访问记录
3. THE ReferralSystem SHALL 在访问记录中保存转化用户的ID
4. THE ReferralSystem SHALL 只标记未转化的访问记录，避免重复标记
5. IF 标记转化失败，THEN THE ReferralSystem SHALL 记录错误日志但不影响注册流程

### 需求 7: 前端自动处理

**用户故事:** 作为用户，我希望邀请链接能够自动处理，无需手动操作。

#### 验收标准

1. WHEN 应用启动时，THE ReferralSystem SHALL 自动检查URL中的邀请码参数
2. WHEN 检测到邀请码，THE ReferralSystem SHALL 自动调用追踪API
3. THE ReferralSystem SHALL 在追踪完成后自动清除URL中的邀请码参数
4. WHEN 用户进入注册页面，THE ReferralSystem SHALL 自动获取并填充邀请码
5. THE ReferralSystem SHALL 在所有自动操作失败时静默处理，不影响用户体验

### 需求 8: 数据安全和隐私

**用户故事:** 作为用户，我希望我的隐私得到保护，邀请追踪不会收集敏感信息。

#### 验收标准

1. THE ReferralSystem SHALL 只收集必要的技术信息用于设备识别
2. THE ReferralSystem SHALL 不收集用户的个人身份信息
3. THE ReferralSystem SHALL 自动删除30天以上的访问记录
4. THE ReferralSystem SHALL 在用户注册后不再追踪该设备的访问
5. THE ReferralSystem SHALL 遵守数据保护相关法规

### 需求 9: 错误处理和降级

**用户故事:** 作为系统，我希望在各种异常情况下都能正常工作，不影响核心功能。

#### 验收标准

1. IF Cookie被禁用，THEN THE ReferralSystem SHALL 依赖LocalStorage和服务器记录
2. IF LocalStorage不可用，THEN THE ReferralSystem SHALL 依赖Cookie和服务器记录
3. IF 网络请求失败，THEN THE ReferralSystem SHALL 使用前端存储的邀请码
4. IF 所有追踪方式都失败，THEN THE ReferralSystem SHALL 允许用户手动输入邀请码
5. THE ReferralSystem SHALL 记录所有错误到控制台，便于调试

### 需求 10: 性能优化

**用户故事:** 作为系统，我希望邀请追踪功能不影响页面加载性能。

#### 验收标准

1. THE ReferralSystem SHALL 异步执行所有追踪操作
2. THE ReferralSystem SHALL 在后台发送追踪请求，不阻塞页面渲染
3. THE ReferralSystem SHALL 使用数据库索引优化查询性能
4. THE ReferralSystem SHALL 限制单次查询返回的记录数量
5. THE ReferralSystem SHALL 使用TTL索引自动清理过期数据
