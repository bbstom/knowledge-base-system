# 网站备份与一键升级系统 - 设计文档

## 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                    管理员后台                              │
├─────────────────────────────────────────────────────────┤
│  版本信息  │  备份管理  │  升级管理  │  回滚管理          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    后端服务                               │
├─────────────────────────────────────────────────────────┤
│  BackupService  │  UpgradeService  │  VersionService    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    存储层                                 │
├─────────────────────────────────────────────────────────┤
│  MongoDB备份  │  文件备份  │  配置备份  │  升级包        │
└─────────────────────────────────────────────────────────┘
```

## 核心服务设计

### 1. BackupService（备份服务）

```javascript
class BackupService {
  // 创建完整备份
  async createBackup(type = 'manual') {
    // 1. 生成备份ID
    // 2. 备份MongoDB数据库
    // 3. 备份上传文件
    // 4. 备份配置文件
    // 5. 压缩打包
    // 6. 保存备份记录
  }

  // 恢复备份
  async restoreBackup(backupId) {
    // 1. 验证备份文件
    // 2. 解压备份
    // 3. 恢复数据库
    // 4. 恢复文件
    // 5. 恢复配置
    // 6. 重启服务
  }

  // 自动清理旧备份
  async cleanOldBackups(keepDays = 7) {
    // 删除超过保留期的备份
  }

  // 获取备份列表
  async getBackups() {
    // 返回所有备份记录
  }
}
```

### 2. UpgradeService（升级服务）

```javascript
class UpgradeService {
  // 检查更新
  async checkUpdate() {
    // 1. 获取当前版本
    // 2. 请求远程版本信息
    // 3. 比较版本号
    // 4. 返回更新信息
  }

  // 执行升级
  async upgrade(targetVersion) {
    // 1. 创建升级前备份
    // 2. 下载升级包
    // 3. 验证升级包
    // 4. 停止服务
    // 5. 应用更新
    // 6. 迁移数据库
    // 7. 更新配置
    // 8. 重启服务
    // 9. 验证升级
    // 10. 失败则回滚
  }

  // 回滚版本
  async rollback(backupId) {
    // 使用备份恢复到之前版本
  }
}
```

### 3. VersionService（版本服务）

```javascript
class VersionService {
  // 获取当前版本
  getCurrentVersion() {
    return require('../package.json').version;
  }

  // 获取版本历史
  async getVersionHistory() {
    // 返回所有版本记录
  }

  // 更新版本信息
  async updateVersion(version, changelog) {
    // 更新版本记录
  }
}
```

## 数据库模型

### Backup Model
```javascript
{
  backupId: String,        // 备份ID
  version: String,         // 系统版本
  type: String,           // auto/manual
  status: String,         // completed/failed
  size: Number,           // 文件大小（字节）
  filePath: String,       // 备份文件路径
  createdAt: Date,        // 创建时间
  description: String     // 备份描述
}
```

### UpgradeLog Model
```javascript
{
  fromVersion: String,    // 源版本
  toVersion: String,      // 目标版本
  status: String,         // pending/running/completed/failed/rolled_back
  startTime: Date,        // 开始时间
  endTime: Date,          // 结束时间
  backupId: String,       // 关联的备份ID
  logs: [String],         // 日志记录
  error: String           // 错误信息
}
```

### Version Model
```javascript
{
  version: String,        // 版本号
  releaseDate: Date,      // 发布日期
  changelog: String,      // 更新日志
  features: [String],     // 新功能
  bugfixes: [String],     // 修复的问题
  breaking: [String]      // 破坏性变更
}
```

## 备份策略

### 备份内容
1. **数据库备份**
   - 使用 mongodump 导出所有集合
   - 保存为 BSON 格式

2. **文件备份**
   - 上传的图片、文件
   - 日志文件（可选）

3. **配置备份**
   - .env 文件（敏感信息加密）
   - package.json
   - 系统配置

### 备份流程
```
开始备份
  ↓
检查磁盘空间
  ↓
创建临时目录
  ↓
导出数据库 → 复制文件 → 复制配置
  ↓
压缩打包
  ↓
移动到备份目录
  ↓
保存备份记录
  ↓
清理临时文件
  ↓
完成
```

## 升级流程

```
检查更新
  ↓
显示更新信息
  ↓
用户确认升级
  ↓
创建备份 ←─────┐
  ↓            │
下载升级包      │
  ↓            │
验证升级包      │
  ↓            │
应用更新        │
  ↓            │
迁移数据        │
  ↓            │
验证升级        │
  ↓            │
成功？──否──回滚
  ↓是
完成
```

## 安全措施

1. **权限控制**
   - 只有超级管理员可以操作
   - 操作前二次确认

2. **数据安全**
   - 备份文件加密
   - 敏感配置加密存储
   - 备份文件访问控制

3. **失败保护**
   - 升级前强制备份
   - 升级失败自动回滚
   - 保留多个备份版本

4. **日志记录**
   - 记录所有操作
   - 详细的错误日志
   - 操作审计

## UI 设计

### 版本管理页面
- 当前版本信息卡片
- 版本历史时间线
- 检查更新按钮

### 备份管理页面
- 备份列表表格
- 创建备份按钮
- 备份操作（下载、恢复、删除）
- 自动备份设置

### 升级管理页面
- 升级状态显示
- 升级进度条
- 升级日志实时显示
- 回滚按钮

## 性能优化

1. **异步处理**
   - 备份和升级使用后台任务
   - WebSocket 实时推送进度

2. **增量备份**
   - 可选增量备份模式
   - 减少备份时间和空间

3. **压缩优化**
   - 使用高效压缩算法
   - 平衡压缩率和速度

## 监控告警

1. **备份监控**
   - 备份失败告警
   - 磁盘空间不足告警
   - 备份文件损坏检测

2. **升级监控**
   - 升级进度监控
   - 升级失败告警
   - 回滚成功通知
