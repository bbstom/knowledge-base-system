# Node.js 版本升级指南

## 问题描述

当前Node.js版本：**16.9.0**
Vite要求版本：**20.19+ 或 22.12+**

## 错误信息

```
You are using Node.js 16.9.0. 
Vite requires Node.js version 20.19+ or 22.12+. 
Please upgrade your Node.js version.
```

## 解决方案

### 方案1：使用NVM升级（推荐）

#### 1. 安装NVM（如果未安装）

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

或

```bash
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

#### 2. 重新加载配置

```bash
source ~/.bashrc
# 或
source ~/.zshrc
```

#### 3. 安装Node.js 20 LTS

```bash
nvm install 20
```

#### 4. 设置为默认版本

```bash
nvm use 20
nvm alias default 20
```

#### 5. 验证版本

```bash
node -v
# 应该显示 v20.x.x
```

### 方案2：直接安装Node.js 20

#### Ubuntu/Debian

```bash
# 添加NodeSource仓库
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# 安装Node.js
sudo apt-get install -y nodejs

# 验证版本
node -v
```

#### CentOS/RHEL

```bash
# 添加NodeSource仓库
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

# 安装Node.js
sudo yum install -y nodejs

# 验证版本
node -v
```

### 方案3：使用n版本管理器

```bash
# 安装n
sudo npm install -g n

# 安装Node.js 20 LTS
sudo n lts

# 验证版本
node -v
```

## 升级后的步骤

### 1. 清理旧的依赖

```bash
cd /www/wwwroot/knowledge-base-system/client
rm -rf node_modules package-lock.json
```

### 2. 重新安装依赖

```bash
npm install
```

### 3. 构建项目

```bash
npm run build
```

## 验证清单

- [ ] Node.js版本 >= 20.19
- [ ] npm版本已更新
- [ ] node_modules已重新安装
- [ ] 构建成功无错误

## 常见问题

### Q1: nvm命令找不到

**解决方法**：
```bash
# 重新加载配置
source ~/.bashrc
# 或手动添加到配置文件
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
source ~/.bashrc
```

### Q2: 权限问题

**解决方法**：
```bash
# 使用sudo
sudo npm install -g n
sudo n lts
```

### Q3: 多个Node.js版本冲突

**解决方法**：
```bash
# 使用nvm管理
nvm list
nvm use 20
nvm alias default 20
```

## 推荐配置

### 使用NVM管理多个版本

```bash
# 安装多个版本
nvm install 20
nvm install 22

# 切换版本
nvm use 20

# 查看已安装版本
nvm list

# 设置默认版本
nvm alias default 20
```

## 服务器环境注意事项

### 1. 检查现有应用

升级前确保其他应用兼容Node.js 20：

```bash
# 查看所有Node.js进程
ps aux | grep node

# 检查PM2应用
pm2 list
```

### 2. 平滑升级

```bash
# 1. 安装新版本（不删除旧版本）
nvm install 20

# 2. 测试新版本
nvm use 20
cd /www/wwwroot/knowledge-base-system/client
npm install
npm run build

# 3. 如果测试成功，设为默认
nvm alias default 20

# 4. 重启应用
pm2 restart all
```

### 3. 回滚方案

如果升级后出现问题：

```bash
# 切换回旧版本
nvm use 16

# 或卸载新版本
nvm uninstall 20
```

## 快速升级命令（推荐）

```bash
# 一键升级脚本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
cd /www/wwwroot/knowledge-base-system/client
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 验证升级成功

```bash
# 检查Node.js版本
node -v
# 应该显示 v20.x.x

# 检查npm版本
npm -v
# 应该显示 10.x.x

# 测试构建
cd /www/wwwroot/knowledge-base-system/client
npm run build
# 应该成功构建
```

## 生产环境部署

升级完成后，重新部署应用：

```bash
# 1. 构建前端
cd /www/wwwroot/knowledge-base-system/client
npm run build

# 2. 重启后端（如果使用PM2）
cd /www/wwwroot/knowledge-base-system
pm2 restart all

# 3. 检查服务状态
pm2 status
```

## 总结

1. 使用NVM管理Node.js版本（最灵活）
2. 升级到Node.js 20 LTS（稳定版本）
3. 清理并重新安装依赖
4. 测试构建确保无错误
5. 重启应用服务

升级后即可正常使用Vite构建项目！
