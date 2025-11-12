# PM2 文档索引

## 📚 文档导航

### 🎯 快速开始

1. **[PM2_ENV_FIX_NOW.md](./PM2_ENV_FIX_NOW.md)** ⭐ 推荐首先阅读
   - 问题描述和解决方案
   - 3步快速启动
   - 生产环境部署

2. **[PM2_快速参考.md](./PM2_快速参考.md)** 📋 常用命令速查
   - 常用命令表格
   - 故障排查
   - 快速参考卡片

### 📖 详细指南

3. **[PM2_问题解决总结.md](./PM2_问题解决总结.md)** 📝 解决方案总结
   - 问题分析
   - 技术细节
   - 验证结果

4. **[PM2_FINAL_SOLUTION.md](./PM2_FINAL_SOLUTION.md)** 🔧 完整解决方案
   - 工作原理
   - 多种方案
   - 详细说明

5. **[PM2_使用指南.md](./PM2_使用指南.md)** 📚 完整使用手册
   - 详细使用说明
   - 生产环境部署
   - 监控和维护
   - 性能优化

### 🛠️ 可执行文件

6. **start-pm2-with-env.cjs** 🚀 智能启动脚本（核心）
   - 自动加载环境变量
   - 验证配置
   - 启动PM2

7. **start-pm2.bat** 💻 Windows一键启动
   - 自动安装PM2
   - 一键启动服务

8. **start-pm2.sh** 🐧 Linux/Mac一键启动
   - 自动安装PM2
   - 一键启动服务

9. **ecosystem.config.js** ⚙️ PM2配置文件
   - 应用配置
   - 日志配置

### 🔍 诊断工具

10. **server/scripts/fixPM2Env.js** 🔧 环境变量诊断
    - 检查.env文件
    - 生成配置文件

11. **server/scripts/testEcosystemConfig.js** ✅ 配置测试
    - 验证ecosystem配置
    - 检查环境变量

---

## 🎯 使用场景导航

### 场景1：首次使用PM2
👉 阅读顺序：
1. [PM2_ENV_FIX_NOW.md](./PM2_ENV_FIX_NOW.md) - 了解问题和解决方案
2. 运行 `start-pm2.bat` 或 `start-pm2.sh` - 一键启动
3. [PM2_快速参考.md](./PM2_快速参考.md) - 学习常用命令

### 场景2：遇到环境变量问题
👉 阅读顺序：
1. [PM2_ENV_FIX_NOW.md](./PM2_ENV_FIX_NOW.md) - 快速修复
2. [PM2_问题解决总结.md](./PM2_问题解决总结.md) - 了解原因
3. 运行 `node start-pm2-with-env.cjs` - 重新启动

### 场景3：生产环境部署
👉 阅读顺序：
1. [PM2_使用指南.md](./PM2_使用指南.md) - 第"生产环境部署"章节
2. [PM2_FINAL_SOLUTION.md](./PM2_FINAL_SOLUTION.md) - 了解技术细节
3. 运行 `node start-pm2-with-env.cjs` - 部署服务

### 场景4：日常维护
👉 参考：
1. [PM2_快速参考.md](./PM2_快速参考.md) - 常用命令
2. [PM2_使用指南.md](./PM2_使用指南.md) - 监控和维护章节

### 场景5：故障排查
👉 参考：
1. [PM2_快速参考.md](./PM2_快速参考.md) - 故障排查部分
2. [PM2_使用指南.md](./PM2_使用指南.md) - 故障排查章节
3. [PM2_ENV_FIX_NOW.md](./PM2_ENV_FIX_NOW.md) - 常见问题

---

## 🚀 快速命令

### 启动服务
```bash
# Windows
start-pm2.bat

# Linux/Mac
./start-pm2.sh

# 手动
node start-pm2-with-env.cjs
```

### 查看状态
```bash
pm2 status
pm2 logs base2
```

### 重启服务
```bash
pm2 restart base2
```

### 完全重置
```bash
pm2 stop base2
pm2 delete base2
node start-pm2-with-env.cjs
```

---

## 📊 文档特点对比

| 文档 | 长度 | 适合场景 | 特点 |
|------|------|----------|------|
| PM2_ENV_FIX_NOW.md | 短 | 快速修复 | 简洁明了 |
| PM2_快速参考.md | 短 | 日常使用 | 命令速查 |
| PM2_问题解决总结.md | 中 | 了解原因 | 技术分析 |
| PM2_FINAL_SOLUTION.md | 中 | 深入理解 | 完整方案 |
| PM2_使用指南.md | 长 | 全面学习 | 详细完整 |

---

## 🔗 相关文档

### 项目文档
- **PRODUCTION_DEPLOYMENT_GUIDE.md** - 生产部署总指南
- **DEV_ENVIRONMENT_SETUP.md** - 开发环境设置
- **QUICK_REFERENCE.md** - 项目快速参考

### 数据库相关
- **DATABASE_CONFIG_GUIDE.md** - 数据库配置指南
- **DATABASE_MANAGER_COMPLETE_SUMMARY.md** - 数据库管理器

### 部署相关
- **DEPLOY_QUICK_REFERENCE.md** - 部署快速参考
- **GITHUB_UPDATE_AND_DEPLOY.md** - GitHub更新和部署

---

## 💡 提示

- 📌 **首次使用**：从 [PM2_ENV_FIX_NOW.md](./PM2_ENV_FIX_NOW.md) 开始
- 🔍 **遇到问题**：先查看 [PM2_快速参考.md](./PM2_快速参考.md) 的故障排查
- 📚 **深入学习**：阅读 [PM2_使用指南.md](./PM2_使用指南.md)
- ⚡ **快速启动**：直接运行 `start-pm2.bat` 或 `start-pm2.sh`

---

## 📞 获取帮助

如果文档无法解决你的问题：

1. 查看PM2日志：`pm2 logs base2 --lines 100`
2. 检查环境变量：`cat server/.env | grep MONGO_URI`
3. 测试数据库：`node server/scripts/testDatabaseConnection.js`
4. 查看PM2官方文档：https://pm2.keymetrics.io/docs/

---

**最后更新：** 2024-11-09  
**文档版本：** 1.0.0  
**状态：** ✅ 完整
