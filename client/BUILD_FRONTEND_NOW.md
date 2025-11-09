# 立即构建前端 - 解决 API endpoint not found 错误

## 问题

访问 `http://45.137.215.156:3001` 显示:
```json
{"success":false,"message":"API endpoint not found"}
```

## 原因

**没有前端构建文件** (`dist` 文件夹不存在)

## 解决方案

### 在服务器上执行

```bash
# 1. 进入项目根目录
cd /www/wwwroot/dc.obash.cc

# 2. 构建前端
npm run build

# 3. 重启后端服务器
pm2 restart base2

# 4. 查看日志确认
pm2 logs base2 --lines 20
```

## 如果构建报错

### 错误 1: 内存不足
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### 错误 2: TypeScript 错误
```bash
# 跳过类型检查
npx vite build
```

### 错误 3: 权限问题
```bash
# 使用 sudo
sudo npm run build
```

## 验证成功

构建成功后,日志应该显示:
```
✅ 找到前端构建文件，启用静态文件服务
```

然后访问 `http://45.137.215.156:3001` 应该能看到前端页面。

## 当前状态

- ✅ 后端服务器运行正常
- ❌ 前端文件未构建
- ⚠️ 数据库未连接 (不影响前端显示)

## 下一步

1. **立即运行**: `npm run build`
2. **重启服务器**: `pm2 restart base2`
3. **测试访问**: 打开浏览器访问网站

如果构建过程中遇到任何错误,记录错误信息以便排查。
