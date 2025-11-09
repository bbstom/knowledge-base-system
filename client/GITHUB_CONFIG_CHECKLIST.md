# 📝 GitHub 上传前配置修改清单

在上传到 GitHub 之前，请按照以下清单修改配置信息，将项目个性化为你自己的项目。

## 🔧 必须修改的配置

### 1. package.json（根目录）

**文件位置**: `package.json`

需要修改的字段：

```json
{
  "name": "knowledge-base-system",           // 可以保持或修改为你的项目名
  "author": "Your Name <your.email@example.com>",  // ⚠️ 修改为你的名字和邮箱
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/knowledge-base-system.git"  // ⚠️ 修改为你的 GitHub 仓库地址
  },
  "bugs": {
    "url": "https://github.com/yourusername/knowledge-base-system/issues"  // ⚠️ 修改为你的仓库地址
  },
  "homepage": "https://github.com/yourusername/knowledge-base-system#readme"  // ⚠️ 修改为你的仓库地址
}
```

**修改示例**：
```json
{
  "author": "张三 <zhangsan@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/zhangsan/my-knowledge-base.git"
  }
}
```

---

### 2. README.md

**文件位置**: `README.md`

需要修改的内容：

#### 第 1 处：克隆项目命令
```bash
# 原内容
git clone https://github.com/yourusername/knowledge-base-system.git

# 修改为
git clone https://github.com/你的用户名/你的仓库名.git
```

#### 第 2 处：问题反馈链接
```markdown
# 原内容
- 🐛 问题反馈：[GitHub Issues](https://github.com/yourusername/knowledge-base-system/issues)

# 修改为
- 🐛 问题反馈：[GitHub Issues](https://github.com/你的用户名/你的仓库名/issues)
```

#### 第 3 处：联系方式（可选）
```markdown
# 原内容
- 📧 邮件：support@example.com
- 💬 QQ群：123456789
- 📱 微信：your-wechat

# 修改为你的实际联系方式，或删除此部分
- 📧 邮件：你的邮箱
- 💬 QQ群：你的QQ群号
- 📱 微信：你的微信号
```

---

### 3. CONTRIBUTING.md

**文件位置**: `CONTRIBUTING.md`

需要修改的内容：

#### 第 1 处：Issues 链接
```markdown
# 原内容
1. 检查 [Issues](https://github.com/yourusername/knowledge-base-system/issues)

# 修改为
1. 检查 [Issues](https://github.com/你的用户名/你的仓库名/issues)
```

#### 第 2 处：克隆项目命令
```bash
# 原内容
git clone https://github.com/yourusername/knowledge-base-system.git

# 修改为
git clone https://github.com/你的用户名/你的仓库名.git
```

#### 第 3 处：联系方式（可选）
```markdown
# 原内容
- 📧 发送邮件到：dev@example.com
- 💬 加入讨论群：123456789

# 修改为你的实际联系方式，或删除此部分
```

---

### 4. LICENSE

**文件位置**: `LICENSE`

需要修改的内容：

```
# 原内容
Copyright (c) 2024 Knowledge Base Management System

# 修改为
Copyright (c) 2024 你的名字或组织名
```

**修改示例**：
```
Copyright (c) 2024 张三
```
或
```
Copyright (c) 2024 某某科技有限公司
```

---

### 5. GITHUB_UPLOAD_GUIDE.md

**文件位置**: `GITHUB_UPLOAD_GUIDE.md`

需要修改的内容：

#### 第 1 处：远程仓库地址
```bash
# 原内容
git remote add origin https://github.com/yourusername/knowledge-base-system.git

# 修改为
git remote add origin https://github.com/你的用户名/你的仓库名.git
```

---

### 6. UPLOAD_TO_GITHUB.md

**文件位置**: `UPLOAD_TO_GITHUB.md`

需要修改的内容：

#### 第 1 处：仓库名示例
```markdown
# 原内容
- **Repository name**: `knowledge-base-system`（或你喜欢的名字）

# 可以保持或修改为你喜欢的名字
```

#### 第 2 处：仓库地址示例
```
# 原内容
https://github.com/yourusername/knowledge-base-system.git

# 修改为
https://github.com/你的用户名/你的仓库名.git
```

---

## 📋 可选修改的配置

### 1. server/package.json

**文件位置**: `server/package.json`

如果存在以下字段，建议修改：

```json
{
  "author": "Your Name <your.email@example.com>",  // 修改为你的信息
  "repository": "...",  // 修改为你的仓库地址
  "bugs": "...",        // 修改为你的仓库地址
  "homepage": "..."     // 修改为你的仓库地址
}
```

---

### 2. 项目描述和标签

上传后在 GitHub 仓库页面修改：

#### 仓库描述
```
一个功能完整的知识库管理系统，支持用户管理、积分系统、推荐奖励、备份恢复等功能
```

#### 推荐标签（Topics）
- `knowledge-base`
- `management-system`
- `react`
- `nodejs`
- `mongodb`
- `typescript`
- `express`
- `tailwindcss`

---

## 🚀 快速修改脚本

我为你准备了一个快速修改脚本，可以批量替换这些配置。

### 使用方法：

1. 打开 `package.json`
2. 将 `yourusername` 替换为你的 GitHub 用户名
3. 将 `your.email@example.com` 替换为你的邮箱
4. 将 `Your Name` 替换为你的名字

### 查找替换清单：

| 查找内容 | 替换为 | 位置 |
|---------|--------|------|
| `yourusername` | 你的 GitHub 用户名 | 所有文件 |
| `your.email@example.com` | 你的邮箱 | package.json, README.md |
| `Your Name` | 你的名字 | package.json, LICENSE |
| `support@example.com` | 你的支持邮箱（可选） | README.md |
| `dev@example.com` | 你的开发邮箱（可选） | CONTRIBUTING.md |

---

## ✅ 修改完成检查

修改完成后，请检查以下内容：

- [ ] `package.json` 中的 author 已修改
- [ ] `package.json` 中的 repository URL 已修改
- [ ] `README.md` 中的仓库链接已修改
- [ ] `CONTRIBUTING.md` 中的仓库链接已修改
- [ ] `LICENSE` 中的版权信息已修改
- [ ] 所有 `yourusername` 已替换为实际用户名
- [ ] 联系方式已更新或删除

---

## 🔍 使用 VS Code 批量替换

### 步骤：

1. 按 `Ctrl + Shift + H` 打开查找替换面板
2. 在"查找"框输入：`yourusername`
3. 在"替换"框输入：你的 GitHub 用户名
4. 点击"全部替换"

重复以上步骤替换其他内容。

---

## 📝 修改示例

### 修改前：
```json
{
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "url": "https://github.com/yourusername/knowledge-base-system.git"
  }
}
```

### 修改后：
```json
{
  "author": "张三 <zhangsan@example.com>",
  "repository": {
    "url": "https://github.com/zhangsan/my-knowledge-base.git"
  }
}
```

---

## ⚠️ 重要提醒

1. **不要修改** `.gitignore` 文件中的内容
2. **不要修改** 代码文件中的逻辑
3. **只修改** 配置信息和文档中的个人信息
4. 修改完成后，运行 `check-before-upload.bat` 进行安全检查

---

## 🎯 下一步

修改完成后：

1. 运行安全检查：`check-before-upload.bat`
2. 上传到 GitHub：`upload-to-github.bat`
3. 或查看详细指南：`UPLOAD_TO_GITHUB.md`

---

📌 **提示**: 如果你不想公开某些联系方式，可以直接删除相关内容，不是必须填写的。
