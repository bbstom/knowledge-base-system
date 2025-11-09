# ⚡ 快速配置修改指南

## 🎯 必须修改的 3 个地方

### 1️⃣ package.json（最重要）

**文件**: `package.json`（根目录）

**需要修改的行**:
```json
"repository": {
  "type": "git",
  "url": "https://github.com/yourusername/knowledge-base-system.git"  // ⚠️ 改这里
},
"bugs": {
  "url": "https://github.com/yourusername/knowledge-base-system/issues"  // ⚠️ 改这里
},
"homepage": "https://github.com/yourusername/knowledge-base-system#readme"  // ⚠️ 改这里
```

**修改方法**:
- 将 `yourusername` 替换为你的 GitHub 用户名
- 如果你想改仓库名，将 `knowledge-base-system` 改为你想要的名字

**示例**:
```json
"repository": {
  "type": "git",
  "url": "https://github.com/zhangsan/my-kb-system.git"
},
"bugs": {
  "url": "https://github.com/zhangsan/my-kb-system/issues"
},
"homepage": "https://github.com/zhangsan/my-kb-system#readme"
```

---

### 2️⃣ LICENSE

**文件**: `LICENSE`（根目录）

**需要修改的行**:
```
Copyright (c) 2024 Knowledge Base Management System  // ⚠️ 改这里
```

**修改为**:
```
Copyright (c) 2024 你的名字
```

**示例**:
```
Copyright (c) 2024 张三
```

---

### 3️⃣ README.md

**文件**: `README.md`（根目录）

**需要修改的地方**:

#### 位置 1: 克隆命令（第 40 行左右）
```bash
# 原内容
git clone https://github.com/yourusername/knowledge-base-system.git

# 改为
git clone https://github.com/你的用户名/你的仓库名.git
```

#### 位置 2: 问题反馈链接（第 200 行左右）
```markdown
# 原内容
- 🐛 问题反馈：[GitHub Issues](https://github.com/yourusername/knowledge-base-system/issues)

# 改为
- 🐛 问题反馈：[GitHub Issues](https://github.com/你的用户名/你的仓库名/issues)
```

#### 位置 3: 联系方式（第 205 行左右）- 可选
```markdown
# 原内容
- 📧 邮件：support@example.com
- 💬 QQ群：123456789
- 📱 微信：your-wechat

# 改为你的实际联系方式，或直接删除这几行
```

---

## 🔍 使用 VS Code 快速替换

### 方法 1: 全局替换

1. 按 `Ctrl + Shift + H` 打开替换面板
2. 输入查找内容: `yourusername`
3. 输入替换内容: `你的GitHub用户名`
4. 点击"全部替换"

### 方法 2: 逐个文件修改

1. 打开 `package.json`
2. 按 `Ctrl + H` 打开替换
3. 替换 `yourusername` 为你的用户名
4. 对其他文件重复此操作

---

## ✅ 修改完成检查清单

修改完成后，请确认：

- [ ] `package.json` 中的 3 个 URL 已修改
- [ ] `LICENSE` 中的版权信息已修改
- [ ] `README.md` 中的仓库链接已修改
- [ ] 联系方式已更新或删除（可选）

---

## 🚀 修改完成后的步骤

1. **保存所有文件**
   - 按 `Ctrl + K, S` 保存所有文件

2. **运行安全检查**
   ```bash
   check-before-upload.bat
   ```

3. **上传到 GitHub**
   ```bash
   upload-to-github.bat
   ```

---

## 📝 完整示例

### 假设你的信息是：
- GitHub 用户名: `zhangsan`
- 仓库名: `my-knowledge-base`
- 名字: `张三`

### 修改结果：

**package.json**:
```json
"repository": {
  "url": "https://github.com/zhangsan/my-knowledge-base.git"
}
```

**LICENSE**:
```
Copyright (c) 2024 张三
```

**README.md**:
```bash
git clone https://github.com/zhangsan/my-knowledge-base.git
```

---

## ⚠️ 注意事项

1. **不要修改** 代码文件（.js, .ts, .tsx 等）
2. **不要修改** `.gitignore` 文件
3. **只修改** 配置文件中的个人信息
4. 如果不确定，可以先不修改，上传后再在 GitHub 上修改

---

## 💡 提示

- 如果你还没想好仓库名，可以先保持 `knowledge-base-system`
- 联系方式不是必须的，可以删除或留空
- 修改后记得保存文件！

---

📌 **需要详细说明？** 查看 [GITHUB_CONFIG_CHECKLIST.md](GITHUB_CONFIG_CHECKLIST.md)
