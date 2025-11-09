# 🚀 网站备份与升级系统 - 使用指南

## 📦 功能概述

系统现在支持完整的版本控制、数据备份和一键升级功能，让你可以安全地管理系统版本和数据。

## 🎯 主要功能

### 1. 版本管理
- 查看当前系统版本
- 查看版本历史
- 查看系统信息（CPU、内存、运行时间等）

### 2. 备份管理
- **手动备份**：一键创建完整备份
- **自动备份**：支持定时自动备份（待实现）
- **备份内容**：
  - 用户数据库（完整）
  - 系统配置文件
  - 上传的文件
  - 环境变量
- **备份管理**：
  - 查看备份列表
  - 下载备份文件
  - 删除旧备份
  - 清理过期备份

### 3. 系统升级（待实现）
- 检查更新
- 一键升级
- 自动回滚

## 📝 安装步骤

### 1. 安装依赖

```bash
cd server
npm install archiver node-cron semver
```

### 2. 初始化备份目录

备份服务会自动创建以下目录：
- `server/backups/` - 存放备份文件
- `server/temp/` - 临时文件目录

### 3. 确保 MongoDB 工具已安装

备份功能需要使用 `mongodump` 和 `mongorestore` 工具。

**Windows:**
```bash
# 下载 MongoDB Database Tools
# https://www.mongodb.com/try/download/database-tools
```

**Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb-database-tools

# Mac
brew install mongodb-database-tools
```

### 4. 重启服务器

```bash
cd server
npm start
```

## 🎮 使用方法

### 访问管理页面

1. 登录管理员后台
2. 在左侧菜单找到"系统管理"
3. 选择"版本管理"或"备份管理"

### 创建备份

1. 进入"备份管理"页面
2. 点击"创建备份"按钮
3. 输入备份描述（可选）
4. 点击"创建"
5. 等待备份完成（大约需要几分钟）

### 下载备份

1. 在备份列表中找到要下载的备份
2. 点击下载图标
3. 备份文件会自动下载到本地

### 删除备份

1. 在备份列表中找到要删除的备份
2. 点击删除图标
3. 确认删除

### 清理旧备份

1. 点击"清理旧备份"按钮
2. 系统会自动删除7天前的自动备份
3. 手动备份不会被自动清理

## 📊 备份文件结构

备份文件是一个 ZIP 压缩包，包含以下内容：

```
backup_YYYY-MM-DDTHH-MM-SS.zip
├── database/           # 数据库备份
│   └── userdata/      # 用户数据库
│       ├── users.bson
│       ├── balancelogs.bson
│       └── ...
├── files/             # 文件备份
│   └── uploads/       # 上传的文件
├── config/            # 配置备份
│   ├── .env           # 环境变量
│   ├── package.json   # 包配置
│   └── version.json   # 版本信息
```

## ⚙️ API 接口

### 版本管理

```javascript
// 获取当前版本
GET /api/system/version

// 获取版本历史
GET /api/system/version/history

// 获取系统信息
GET /api/system/info
```

### 备份管理

```javascript
// 创建备份
POST /api/system/backup
Body: { description: "备份描述" }

// 获取备份列表
GET /api/system/backups

// 下载备份
GET /api/system/backup/:backupId/download

// 删除备份
DELETE /api/system/backup/:backupId

// 清理旧备份
POST /api/system/backup/cleanup
Body: { keepDays: 7 }
```

## 🔧 配置选项

### 自动备份（待实现）

在 `server/index.js` 中添加定时任务：

```javascript
const cron = require('node-cron');
const backupService = require('./services/backupService');

// 每天凌晨2点自动备份
cron.schedule('0 2 * * *', async () => {
  console.log('🕐 开始自动备份...');
  try {
    await backupService.createBackup('auto');
    console.log('✅ 自动备份完成');
  } catch (error) {
    console.error('❌ 自动备份失败:', error);
  }
});
```

### 备份保留策略

默认保留7天的自动备份，可以修改：

```javascript
// 保留30天的备份
await backupService.cleanOldBackups(30);
```

## 🚨 注意事项

### 1. 磁盘空间

- 备份文件可能很大（取决于数据库大小）
- 确保有足够的磁盘空间
- 定期清理旧备份

### 2. 备份时间

- 大型数据库备份可能需要几分钟
- 建议在低峰期进行备份
- 备份过程中不影响系统正常运行

### 3. 权限要求

- 只有管理员可以访问备份功能
- 备份文件包含敏感信息，请妥善保管

### 4. MongoDB 工具

- 确保 `mongodump` 和 `mongorestore` 在系统 PATH 中
- 版本应与 MongoDB 服务器版本兼容

## 📈 性能优化

### 1. 压缩级别

默认使用最高压缩级别（9），可以调整：

```javascript
// 在 backupService.js 中
const archive = archiver('zip', {
  zlib: { level: 6 } // 平衡压缩率和速度
});
```

### 2. 增量备份（待实现）

未来版本将支持增量备份，只备份变更的数据。

## 🔄 恢复备份（待实现）

恢复功能正在开发中，将支持：
- 从备份文件恢复数据库
- 恢复配置文件
- 恢复上传的文件
- 自动重启服务

## 📞 故障排除

### 问题1：mongodump 命令未找到

**解决方案：**
1. 安装 MongoDB Database Tools
2. 将工具路径添加到系统 PATH
3. 重启终端/服务器

### 问题2：备份失败 - 权限不足

**解决方案：**
1. 检查数据库连接权限
2. 确保用户有读取权限
3. 检查文件系统写入权限

### 问题3：备份文件太大

**解决方案：**
1. 清理不必要的数据
2. 使用增量备份（待实现）
3. 调整压缩级别

### 问题4：下载备份失败

**解决方案：**
1. 检查备份文件是否存在
2. 检查文件权限
3. 检查网络连接

## 🎯 下一步计划

### 即将推出的功能

1. **恢复功能**
   - 从备份恢复数据
   - 选择性恢复
   - 恢复预览

2. **自动备份**
   - 定时自动备份
   - 备份策略配置
   - 备份健康检查

3. **升级功能**
   - 检查更新
   - 一键升级
   - 自动回滚

4. **远程备份**
   - 上传到云存储
   - 异地备份
   - 备份同步

## 📚 相关文档

- [需求文档](.kiro/specs/backup-upgrade-system/requirements.md)
- [设计文档](.kiro/specs/backup-upgrade-system/design.md)
- [任务清单](.kiro/specs/backup-upgrade-system/tasks.md)

## ✅ 当前进度

- [x] 数据模型设计
- [x] 备份服务实现
- [x] 版本服务实现
- [x] API 接口开发
- [x] 前端页面开发
- [x] 菜单集成
- [ ] 恢复功能
- [ ] 自动备份
- [ ] 升级功能
- [ ] 测试与优化

## 🎉 总结

备份与升级系统的基础功能已经完成！你现在可以：
- ✅ 查看系统版本信息
- ✅ 手动创建完整备份
- ✅ 管理备份文件
- ✅ 下载备份到本地
- ✅ 清理旧备份

下一步需要安装依赖并测试功能。
