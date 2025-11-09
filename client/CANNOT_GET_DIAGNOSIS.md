# "Cannot GET /" 问题诊断

## 当前状态

根据 PM2 日志:
- ✅ 后端服务器正常运行在 `http://45.137.215.156:3001`
- ⚠️ 数据库未连接
- ❓ 前端构建文件状态未知

## 问题原因

"Cannot GET /" 错误是因为**没有前端构建文件** (`dist` 文件夹不存在)。

## 解决步骤

### 步骤 1: 检查是否有 dist 文件夹

在项目根目录运行:
```bash
ls -la | grep dist
```

或者在 Windows:
```cmd
dir | findstr dist
```

### 步骤 2: 构建前端

如果没有 `dist` 文件夹,需要构建:

```bash
# 在项目根目录运行
npm run build
```

**注意**: 构建可能需要几分钟时间。

### 步骤 3: 验证构建结果

构建完成后,检查:
```bash
ls -la dist/
```

应该能看到:
- index.html
- assets/ 文件夹
- 其他静态文件

### 步骤 4: 重启后端服务器

```bash
pm2 restart base2
```

### 步骤 5: 查看新的日志

```bash
pm2 logs base2 --lines 30
```

应该能看到:
```
✅ 找到前端构建文件，启用静态文件服务
```

### 步骤 6: 测试访问

访问: `http://45.137.215.156:3001`

应该能看到前端页面,而不是 "Cannot GET /"。

## 快速命令

一键完成所有步骤:

```bash
# 构建前端
npm run build

# 重启服务器
pm2 restart base2

# 查看日志
pm2 logs base2 --lines 20
```

## 如果构建失败

如果 `npm run build` 报错,可能是:

1. **TypeScript 编译错误**
   ```bash
   # 跳过 TypeScript 检查直接构建
   vite build
   ```

2. **依赖问题**
   ```bash
   # 重新安装依赖
   npm install
   npm run build
   ```

3. **内存不足**
   ```bash
   # 增加 Node.js 内存限制
   NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```

## 数据库连接问题

日志显示 "⏳ 数据库未连接",这不影响前端显示,但会影响功能。

检查 `server/.env` 中的数据库配置:
```
USER_MONGO_URI=mongodb://chroot:Ubuntu123!@172.16.254.15:27017/userdata?authSource=admin
```

确保:
- MongoDB 服务正在运行
- 网络可以访问 `172.16.254.15:27017`
- 用户名密码正确

## 当前需要做的

**最重要的是先构建前端**:

```bash
npm run build
```

然后重启服务器:

```bash
pm2 restart base2
```

这样就能解决 "Cannot GET /" 问题了。
