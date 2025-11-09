# BEpusdt服务器端问题排查

## 🔍 问题确认

经过多次测试，确认错误来自BEpusdt服务器端：

```
SQL logic error: cannot start a transaction within a transaction (1)
```

## 📊 测试结果

- ✅ 所有HTTP请求成功到达服务器
- ✅ 服务器返回400状态码
- ❌ 所有请求都返回SQL事务错误
- ✅ 错误与请求参数无关

## 🔧 服务器端排查步骤

### 1. 检查BEpusdt服务器日志

如果你有BEpusdt服务器的访问权限，检查日志：

```bash
# 查看BEpusdt日志
tail -f /path/to/bepusdt/logs/error.log
tail -f /path/to/bepusdt/logs/app.log
```

### 2. 检查数据库状态

BEpusdt使用SQLite数据库，检查数据库文件：

```bash
# 进入BEpusdt目录
cd /path/to/bepusdt

# 检查数据库文件
ls -lh data/*.db

# 检查数据库是否被锁定
lsof data/*.db

# 尝试访问数据库
sqlite3 data/bepusdt.db "SELECT * FROM orders LIMIT 1;"
```

### 3. 检查BEpusdt配置

检查 `config.yaml` 或 `.env` 文件：

```yaml
# 数据库配置
database:
  type: sqlite
  path: data/bepusdt.db
  # 检查是否有事务相关配置
  transaction_mode: immediate  # 或 deferred, exclusive
```

### 4. 重启BEpusdt服务

```bash
# 停止服务
pm2 stop bepusdt
# 或
systemctl stop bepusdt

# 清理可能的锁文件
rm -f data/*.db-shm data/*.db-wal

# 重启服务
pm2 start bepusdt
# 或
systemctl start bepusdt
```

### 5. 检查SQLite版本

```bash
# 检查SQLite版本
sqlite3 --version

# BEpusdt可能需要特定版本的SQLite
# 建议使用 SQLite 3.35.0 或更高版本
```

### 6. 检查并发连接

SQL事务错误可能是由于并发连接导致的：

```bash
# 检查当前连接数
lsof -c bepusdt | grep .db

# 如果有多个进程访问数据库，可能导致事务冲突
```

## 🐛 常见原因和解决方案

### 原因1: 数据库被锁定

**症状**: 所有订单创建都失败

**解决方案**:
```bash
# 停止BEpusdt服务
pm2 stop bepusdt

# 删除锁文件
cd /path/to/bepusdt/data
rm -f *.db-shm *.db-wal

# 重启服务
pm2 start bepusdt
```

### 原因2: SQLite事务模式配置错误

**症状**: 嵌套事务错误

**解决方案**:
修改BEpusdt源码中的数据库配置：

```go
// 在数据库初始化代码中
db.Exec("PRAGMA journal_mode=WAL")
db.Exec("PRAGMA busy_timeout=5000")
```

### 原因3: 代码中的事务嵌套bug

**症状**: 在已有事务中又开启了新事务

**解决方案**:
检查BEpusdt源码中的订单创建逻辑：

```go
// 错误的代码（嵌套事务）
tx := db.Begin()
// ... 一些操作
tx2 := db.Begin()  // ❌ 错误：在事务中又开启事务

// 正确的代码
tx := db.Begin()
// ... 所有操作
tx.Commit()
```

### 原因4: 数据库文件权限问题

**症状**: 无法写入数据库

**解决方案**:
```bash
# 检查权限
ls -l /path/to/bepusdt/data/*.db

# 修改权限
chown bepusdt:bepusdt /path/to/bepusdt/data/*.db
chmod 644 /path/to/bepusdt/data/*.db
```

### 原因5: 磁盘空间不足

**症状**: 数据库操作失败

**解决方案**:
```bash
# 检查磁盘空间
df -h

# 清理日志文件
find /path/to/bepusdt/logs -name "*.log" -mtime +7 -delete
```

## 🔄 临时解决方案

### 方案1: 使用充值卡系统

在BEpusdt修复之前，使用充值卡系统：

```
管理员: http://localhost:5173/admin/recharge-cards
用户: http://localhost:5173/dashboard/recharge-card
```

### 方案2: 手动处理订单

如果有紧急订单需要处理：

```bash
# 手动更新订单状态
node server/scripts/manualUpdateOrder.js ORDER123 paid TX_HASH
```

### 方案3: 切换到备用BEpusdt服务器

如果有备用服务器：

```env
BEPUSDT_URL=https://backup-bepusdt-server.com
```

## 📞 联系BEpusdt开发者

如果你使用的是开源版本的BEpusdt，可以：

1. **GitHub Issues**: https://github.com/v03413/BEpusdt/issues
2. **提交bug报告**:

```markdown
标题: SQL事务错误 - cannot start a transaction within a transaction

环境:
- BEpusdt版本: [你的版本]
- SQLite版本: [你的版本]
- 操作系统: [你的系统]

错误信息:
SQL logic error: cannot start a transaction within a transaction (1)

复现步骤:
1. 调用 POST /api/v1/order/create-transaction
2. 传入任何有效参数
3. 总是返回此错误

期望行为:
成功创建订单并返回收款地址

实际行为:
返回SQL事务错误
```

## 🔍 调试BEpusdt源码

如果你有BEpusdt源码访问权限，可以添加调试日志：

```go
// 在订单创建函数中添加日志
func CreateOrder(order *Order) error {
    log.Println("开始创建订单:", order.OrderID)
    
    // 检查是否已在事务中
    if tx != nil {
        log.Println("警告：已在事务中！")
    }
    
    tx := db.Begin()
    log.Println("事务已开启")
    
    // ... 订单创建逻辑
    
    if err := tx.Commit(); err != nil {
        log.Println("事务提交失败:", err)
        return err
    }
    
    log.Println("订单创建成功:", order.OrderID)
    return nil
}
```

## ✅ 检查清单

在联系技术支持前，请确认：

- [ ] BEpusdt服务正在运行
- [ ] 数据库文件存在且可访问
- [ ] 没有数据库锁文件（.db-shm, .db-wal）
- [ ] 磁盘空间充足
- [ ] 文件权限正确
- [ ] SQLite版本兼容
- [ ] 没有其他进程占用数据库
- [ ] 查看了服务器日志
- [ ] 尝试过重启服务

## 📊 诊断命令汇总

```bash
# 1. 检查服务状态
pm2 status bepusdt
systemctl status bepusdt

# 2. 查看日志
tail -f /path/to/bepusdt/logs/*.log

# 3. 检查数据库
ls -lh /path/to/bepusdt/data/*.db
lsof /path/to/bepusdt/data/*.db

# 4. 检查磁盘
df -h

# 5. 检查进程
ps aux | grep bepusdt

# 6. 测试数据库
sqlite3 /path/to/bepusdt/data/bepusdt.db "SELECT COUNT(*) FROM orders;"
```

## 🎯 结论

这是BEpusdt服务器端的SQL事务处理bug，需要：

1. ✅ 检查服务器端日志和配置
2. ✅ 尝试重启BEpusdt服务
3. ✅ 检查数据库状态
4. ✅ 联系BEpusdt开发者或技术支持
5. ✅ 临时使用充值卡系统

**我们的前端和后端代码完全正确，问题在BEpusdt服务器端！**
