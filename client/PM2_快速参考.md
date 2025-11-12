# PM2 快速参考卡片

## 🚀 快速启动

```bash
# Windows
start-pm2.bat

# Linux/Mac
./start-pm2.sh

# 手动
node start-pm2-with-env.cjs
```

## 📊 常用命令

| 命令 | 说明 |
|------|------|
| `pm2 status` | 查看所有进程状态 |
| `pm2 logs base2` | 查看实时日志 |
| `pm2 logs base2 --lines 50` | 查看最近50行 |
| `pm2 restart base2` | 重启服务 |
| `pm2 stop base2` | 停止服务 |
| `pm2 start base2` | 启动服务 |
| `pm2 delete base2` | 删除进程 |
| `pm2 monit` | 监控资源 |
| `pm2 show base2` | 查看详细信息 |
| `pm2 flush` | 清空日志 |

## 🔧 管理命令

| 命令 | 说明 |
|------|------|
| `pm2 save` | 保存当前进程列表 |
| `pm2 startup` | 生成开机自启脚本 |
| `pm2 unstartup` | 取消开机自启 |
| `pm2 update` | 更新PM2 |
| `pm2 reset base2` | 重置计数器 |
| `pm2 reload base2` | 零停机重载 |

## 🐛 故障排查

### 服务无法启动
```bash
pm2 logs base2 --err --lines 100
```

### 完全重启
```bash
pm2 stop base2
pm2 delete base2
node start-pm2-with-env.cjs
```

### 检查端口占用
```bash
# Windows
netstat -ano | findstr :3001

# Linux/Mac
lsof -i :3001
```

### 测试数据库
```bash
node server/scripts/testDatabaseConnection.js
```

## 📁 重要文件

| 文件 | 说明 |
|------|------|
| `start-pm2-with-env.cjs` | 智能启动脚本 |
| `ecosystem.config.js` | PM2配置文件 |
| `server/.env` | 环境变量配置 |
| `start-pm2.bat` | Windows启动 |
| `start-pm2.sh` | Linux/Mac启动 |

## 🔍 日志位置

```bash
# PM2日志目录
~/.pm2/logs/

# 应用日志
./logs/pm2-error.log
./logs/pm2-out.log
```

## ⚡ 性能优化

### 集群模式
```javascript
// ecosystem.config.js
{
  instances: 'max',
  exec_mode: 'cluster'
}
```

### 内存限制
```bash
pm2 start ecosystem.config.js --max-memory-restart 2G
```

### 日志轮转
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 🔐 生产环境

```bash
# 部署
cd /var/www/html/knowledge-base-system/client
node start-pm2-with-env.cjs

# 开机自启
pm2 save
pm2 startup

# 监控
pm2 monit
```

## 📞 获取帮助

```bash
pm2 --help
pm2 logs --help
pm2 start --help
```

## 📚 详细文档

- **PM2_ENV_FIX_NOW.md** - 问题修复
- **PM2_问题解决总结.md** - 解决方案总结
- **PM2_FINAL_SOLUTION.md** - 完整方案
- **PM2_使用指南.md** - 详细指南

---

**提示：** 遇到问题先查看日志 `pm2 logs base2`
