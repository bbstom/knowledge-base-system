# GitHub 上传指南

## 📋 准备工作

### 1. 清理敏感文件

在上传到 GitHub 之前，确保以下文件不会被上传：

```bash
# 检查 .gitignore 文件是否包含这些内容
type .gitignore
```

**重要文件需要排除：**
- `server/.env` - 包含数据库密码等敏感信息
- `server/uploads/` - 用户上传的文件
- `server/backups/` - 数据库备份文件
- `server/logs/` - 日志文件
- `node_modules/` - 依赖包
- `client/dist/` - 构建文件

### 2. 创建环境变量模板

已创建 `server/.env.example` 文件，包含所有必要的配置项。

### 3. 准备文档

- ✅ `README.md` - 项目说明
- ✅ `LICENSE` - 开源许可证
- ✅ `.gitignore` - 忽略文件列表
- ✅ `CHANGELOG.md` - 更新日志
- ✅ `CONTRIBUTING.md` - 贡献指南
- ✅ `server/.env.example` - 环境变量模板

## 🚀 上传步骤

### 方法1：使用 Git 命令行

1. **初始化 Git 仓库**
```bash
git init
```

2. **添加远程仓库**
```bash
# 替换为你的 GitHub 仓库地址
git remote add origin https://github.com/yourusername/knowledge-base-system.git
```

3. **添加文件到暂存区**
```bash
git add .
```

4. **检查要提交的文件**
```bash
git status
```

5. **提交更改**
```bash
git commit -m "feat: 初始提交 - 知识库管理系统 v1.1.0

- 完整的用户管理和认证系统
- 积分系统和推荐奖励机制  
- 管理后台和数据统计
- 备份恢复系统（支持代码备份）
- 邮件系统和工单支持
- 时区支持和实时监控
- 响应式设计和安全防护"
```

6. **推送到 GitHub**
```bash
git branch -M main
git push -u origin main
```

### 方法2：使用 GitHub Desktop

1. 打开 GitHub Desktop
2. 选择 "Add an Existing Repository from your Hard Drive"
3. 选择项目文件夹
4. 填写提交信息
5. 点击 "Commit to main"
6. 点击 "Publish repository"

### 方法3：使用 VS Code

1. 在 VS Code 中打开项目
2. 点击左侧的 Git 图标
3. 点击 "Initialize Repository"
4. 添加远程仓库
5. 暂存所有更改
6. 提交并推送

## ⚠️ 安全检查清单

在上传前，请确认：

- [ ] `.env` 文件已被 `.gitignore` 排除
- [ ] 数据库密码不在代码中
- [ ] API 密钥不在代码中
- [ ] 用户上传的文件不会被提交
- [ ] 备份文件不会被提交
- [ ] 日志文件不会被提交

## 📝 提交信息规范

使用以下格式编写提交信息：

```
类型(范围): 简短描述

详细描述（可选）

相关问题: #123
```

**类型说明：**
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

**示例：**
```
feat(backup): 添加代码备份功能

- 支持备份前后端代码
- 自动排除 node_modules 等目录
- 集成到现有备份系统

相关问题: #45
```

## 🔧 仓库设置建议

### 1. 分支保护

在 GitHub 仓库设置中启用：
- 保护 main 分支
- 要求 PR 审查
- 要求状态检查通过

### 2. 标签和发布

```bash
# 创建版本标签
git tag -a v1.1.0 -m "Version 1.1.0: 添加代码备份功能"
git push origin v1.1.0
```

### 3. GitHub Actions (可选)

创建 `.github/workflows/ci.yml` 用于自动化测试和部署。

### 4. 问题模板

在 `.github/ISSUE_TEMPLATE/` 目录下创建问题模板。

## 📚 后续维护

### 定期更新

```bash
# 拉取最新更改
git pull origin main

# 创建新分支开发功能
git checkout -b feature/new-feature

# 开发完成后合并
git checkout main
git merge feature/new-feature
git push origin main
```

### 版本发布

1. 更新版本号
2. 更新 CHANGELOG.md
3. 创建 Git 标签
4. 发布 GitHub Release

## 🎯 完成检查

上传完成后，确认以下内容：

- [ ] 仓库可以正常访问
- [ ] README.md 显示正确
- [ ] 敏感文件未被上传
- [ ] 项目结构清晰
- [ ] 文档完整

## 📞 需要帮助？

如果在上传过程中遇到问题：

1. 检查网络连接
2. 确认 GitHub 账号权限
3. 查看 Git 错误信息
4. 参考 GitHub 官方文档

---

🎉 **恭喜！** 你的项目现在已经准备好上传到 GitHub 了！
