# ⚙️ Git 配置快速指南

## 🔧 问题：Git 用户身份未配置

你遇到的错误是因为 Git 不知道你是谁。需要先配置用户信息。

## ✅ 快速解决方案

### 步骤 1: 配置 Git 用户信息

在终端运行以下命令（替换为你的信息）：

```bash
# 配置用户名
git config --global user.name "Your Name"

# 配置邮箱
git config --global user.email "your.email@example.com"
```

**示例**：
```bash
git config --global user.name "Zhang San"
git config --global user.email "zhangsan@example.com"
```

### 步骤 2: 验证配置

```bash
# 查看配置
git config --global user.name
git config --global user.email
```

### 步骤 3: 重新提交

```bash
git commit -m "🎉 Initial release: Knowledge Base Management System v1.1.0"
```

## 📝 完整的上传流程

配置好用户信息后，按以下步骤操作：

```bash
# 1. 初始化 Git（如果还没有）
git init

# 2. 添加所有文件
git add .

# 3. 创建提交
git commit -m "🎉 Initial release: Knowledge Base Management System v1.1.0"

# 4. 连接远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/knowledge-base-system.git
git branch -M main

# 5. 推送到 GitHub
git push -u origin main

# 6. 创建版本标签
git tag -a v1.1.0 -m "Version 1.1.0"
git push origin v1.1.0
```

## 🎯 使用自动化脚本

或者，你可以使用我们提供的自动化脚本：

```bash
# 双击运行
upload-to-github.bat
```

脚本会自动完成所有步骤！

## 💡 关于 --global 参数

- `--global`: 全局配置，适用于所有 Git 仓库
- 不加 `--global`: 只对当前仓库有效

**推荐使用 `--global`**，这样以后所有项目都能使用这个配置。

## 🔒 隐私提示

如果你不想公开你的邮箱，可以使用 GitHub 提供的 noreply 邮箱：

```bash
git config --global user.email "username@users.noreply.github.com"
```

将 `username` 替换为你的 GitHub 用户名。

## ❓ 常见问题

### Q: 我应该使用什么邮箱？

A: 建议使用你 GitHub 账号关联的邮箱，这样提交记录会正确显示你的头像。

### Q: 配置错了怎么办？

A: 重新运行配置命令即可覆盖：

```bash
git config --global user.name "New Name"
git config --global user.email "new.email@example.com"
```

### Q: 如何查看所有配置？

A: 运行：

```bash
git config --global --list
```

## 🚀 配置完成后

配置好用户信息后，你就可以：

1. ✅ 提交代码
2. ✅ 推送到 GitHub
3. ✅ 创建版本标签
4. ✅ 参与开源项目

---

**准备好了吗？** 配置好用户信息后，继续上传流程！

查看 `READY_TO_UPLOAD.md` 获取完整的上传指南。
