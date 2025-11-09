# 🔐 GitHub Token 认证指南

## ⚠️ 问题

GitHub 已经不再支持密码认证，需要使用 Personal Access Token (PAT)。

错误信息：
```
remote: Invalid username or token. Password authentication is not supported for Git operations.
```

---

## ✅ 解决方案

### 方式 1: 使用 Personal Access Token（推荐）

#### 步骤 1: 创建 Personal Access Token

1. **登录 GitHub**
   - 访问 https://github.com

2. **进入设置**
   - 点击右上角头像 -> Settings

3. **创建 Token**
   - 左侧菜单：Developer settings
   - Personal access tokens -> Tokens (classic)
   - 点击 "Generate new token" -> "Generate new token (classic)"

4. **配置 Token**
   - **Note**: `Server Deployment` (备注名称)
   - **Expiration**: 选择过期时间（建议 90 days 或 No expiration）
   - **Select scopes**: 勾选以下权限
     - ✅ `repo` (完整的仓库访问权限)
     - ✅ `workflow` (如果需要 GitHub Actions)

5. **生成并复制 Token**
   - 点击 "Generate token"
   - **立即复制 Token**（只显示一次！）
   - 格式类似：`ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### 步骤 2: 使用 Token 克隆仓库

**方式 A: 在 URL 中使用 Token**

```bash
git clone https://YOUR_TOKEN@github.com/bbstom/knowledge-base-system.git
```

**示例**：
```bash
git clone https://ghp_1234567890abcdefghijklmnopqrstuvwxyz@github.com/bbstom/knowledge-base-system.git
```

**方式 B: 使用用户名和 Token**

```bash
git clone https://YOUR_USERNAME:YOUR_TOKEN@github.com/bbstom/knowledge-base-system.git
```

**示例**：
```bash
git clone https://bbstom:ghp_1234567890abcdefghijklmnopqrstuvwxyz@github.com/bbstom/knowledge-base-system.git
```

---

### 方式 2: 使用 SSH 密钥（更安全）

#### 步骤 1: 生成 SSH 密钥

```bash
# 在服务器上生成 SSH 密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 按 Enter 使用默认路径
# 可以设置密码或直接按 Enter

# 查看公钥
cat ~/.ssh/id_ed25519.pub
```

#### 步骤 2: 添加 SSH 密钥到 GitHub

1. 复制公钥内容
2. 访问 GitHub Settings -> SSH and GPG keys
3. 点击 "New SSH key"
4. 粘贴公钥，添加标题
5. 点击 "Add SSH key"

#### 步骤 3: 使用 SSH 克隆

```bash
git clone git@github.com:bbstom/knowledge-base-system.git
```

---

### 方式 3: 配置 Git 凭据存储

如果你已经克隆了仓库，可以配置凭据存储：

```bash
# 配置 Git 使用凭据存储
git config --global credential.helper store

# 下次 pull/push 时输入 Token 作为密码
# Git 会自动保存凭据
```

---

## 🚀 完整的服务器部署命令

### 使用 Token 克隆（推荐）

```bash
# 1. 进入目录
cd /var/www/html

# 2. 使用 Token 克隆（替换 YOUR_TOKEN）
git clone https://YOUR_TOKEN@github.com/bbstom/knowledge-base-system.git

# 3. 进入项目目录
cd knowledge-base-system

# 4. 配置环境
cp server/.env.example server/.env
nano server/.env

# 5. 安装依赖
cd server && npm install
cd .. && npm install

# 6. 构建前端
npm run build

# 7. 启动应用
pm2 start server/index.js --name "knowledge-base"
pm2 startup
pm2 save
```

### 使用 SSH 克隆

```bash
# 1. 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. 添加公钥到 GitHub
cat ~/.ssh/id_ed25519.pub
# 复制输出，添加到 GitHub

# 3. 克隆项目
cd /var/www/html
git clone git@github.com:bbstom/knowledge-base-system.git

# 4. 继续部署...
cd knowledge-base-system
cp server/.env.example server/.env
# ... 其他步骤
```

---

## 🔄 更新代码时使用 Token

### 方式 1: 配置远程 URL 包含 Token

```bash
cd /var/www/html/knowledge-base-system

# 更新远程 URL（替换 YOUR_TOKEN）
git remote set-url origin https://YOUR_TOKEN@github.com/bbstom/knowledge-base-system.git

# 现在可以直接 pull
git pull origin main
```

### 方式 2: 使用凭据存储

```bash
# 配置凭据存储
git config --global credential.helper store

# 第一次 pull 时输入 Token
git pull origin main
# Username: bbstom
# Password: YOUR_TOKEN (粘贴你的 Token)

# 之后 Git 会自动使用保存的凭据
```

---

## 💡 Token 安全建议

### 1. 保护 Token

```bash
# 不要在命令历史中暴露 Token
# 使用环境变量
export GITHUB_TOKEN="ghp_your_token_here"
git clone https://$GITHUB_TOKEN@github.com/bbstom/knowledge-base-system.git

# 清除历史
history -c
```

### 2. 限制 Token 权限

- 只授予必要的权限
- 为不同用途创建不同的 Token
- 定期轮换 Token

### 3. Token 过期管理

- 设置合理的过期时间
- 在 Token 过期前更新
- 记录 Token 的用途和位置

---

## 🔧 故障排除

### 问题 1: Token 无效

```bash
# 检查 Token 是否正确
# 确保复制了完整的 Token
# 检查 Token 权限是否包含 repo
```

### 问题 2: 仍然提示密码

```bash
# 清除旧的凭据
git config --global --unset credential.helper

# 重新配置
git config --global credential.helper store

# 再次尝试
git pull
```

### 问题 3: SSH 连接失败

```bash
# 测试 SSH 连接
ssh -T git@github.com

# 应该看到：
# Hi username! You've successfully authenticated...
```

---

## 📝 快速参考

### Token 克隆命令

```bash
# 公开仓库
git clone https://github.com/bbstom/knowledge-base-system.git

# 私有仓库（使用 Token）
git clone https://YOUR_TOKEN@github.com/bbstom/knowledge-base-system.git

# 私有仓库（使用 SSH）
git clone git@github.com:bbstom/knowledge-base-system.git
```

### 更新远程 URL

```bash
# 查看当前 URL
git remote -v

# 更新为 HTTPS + Token
git remote set-url origin https://YOUR_TOKEN@github.com/bbstom/knowledge-base-system.git

# 更新为 SSH
git remote set-url origin git@github.com:bbstom/knowledge-base-system.git
```

---

## ✅ 推荐方案

**对于生产服务器，推荐使用 SSH 密钥**：

1. 更安全（不需要在 URL 中暴露 Token）
2. 更方便（不需要管理 Token 过期）
3. 更稳定（不会因为 Token 过期而中断）

**对于临时部署或测试，可以使用 Token**：

1. 快速设置
2. 不需要配置 SSH
3. 适合一次性操作

---

**需要帮助？** 查看 `DEPLOY_FROM_GITHUB.md` 获取完整部署指南。
