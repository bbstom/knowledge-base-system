# 端口映射配置指南

## 当前配置 ✅

- **公网域名**: `dc.obash.cc`
- **映射端口**: `3001`
- **内网IP**: `172.16.254.252`
- **内网端口**: `3001`

## 端口映射

```
外网: dc.obash.cc:3001
  ↓
路由器/防火墙端口转发
  ↓
内网: 172.16.254.252:3001
```

## .env 配置

```env
# 后端地址（用于Webhook回调）
BACKEND_URL=http://dc.obash.cc:3001
```

这个配置是正确的！BEpusdt会调用：
```
http://dc.obash.cc:3001/api/recharge/webhook
```

## 路由器配置步骤

### 1. 登录路由器管理界面

通常是：
- `http://192.168.1.1`
- `http://192.168.0.1`
- `http://10.0.0.1`

### 2. 找到端口转发/虚拟服务器设置

不同路由器名称可能不同：
- 端口转发 (Port Forwarding)
- 虚拟服务器 (Virtual Server)
- NAT转发
- 端口映射 (Port Mapping)

### 3. 添加转发规则

```
服务名称: Backend API
外部端口: 3001
内部IP: 172.16.254.252
内部端口: 3001
协议: TCP
状态: 启用
```

### 4. 保存并重启路由器

## 防火墙配置

### Windows防火墙

允许3001端口入站：

```powershell
# 方法1: 使用命令行
netsh advfirewall firewall add rule name="Backend API" dir=in action=allow protocol=TCP localport=3001

# 方法2: 图形界面
# 1. 打开"Windows Defender 防火墙"
# 2. 高级设置 -> 入站规则 -> 新建规则
# 3. 端口 -> TCP -> 3001 -> 允许连接
```

### Linux防火墙 (iptables)

```bash
# 允许3001端口
sudo iptables -A INPUT -p tcp --dport 3001 -j ACCEPT

# 保存规则
sudo iptables-save > /etc/iptables/rules.v4
```

### Linux防火墙 (firewalld)

```bash
# 允许3001端口
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

## 测试配置

### 1. 测试内网访问

```bash
# 在本机测试
curl http://localhost:3001/health

# 在局域网其他设备测试
curl http://172.16.254.252:3001/health
```

### 2. 测试公网访问

```bash
# 从外网测试（可以用手机4G网络）
curl http://dc.obash.cc:3001/health
```

应该返回：
```json
{
  "status": "ok",
  "timestamp": "2025-01-21T...",
  "env": "development",
  "bepusdt": {
    "url": "https://pay.vpno.eu.org",
    "merchantId": "1000"
  }
}
```

### 3. 测试Webhook

```bash
# 从外网测试Webhook端点
curl -X POST http://dc.obash.cc:3001/api/recharge/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## BEpusdt配置

在BEpusdt管理后台配置Webhook URL：

```
http://dc.obash.cc:3001/api/recharge/webhook
```

BEpusdt会在支付完成后调用这个地址。

## 常见问题

### Q: 无法从外网访问？

A: 检查：
1. **路由器端口转发**是否配置正确
2. **防火墙**是否允许3001端口
3. **公网IP**是否正确（可能是动态IP）
4. **域名解析**是否指向正确的IP
5. **ISP**是否封禁了端口（有些ISP会封禁常用端口）

### Q: 如何查看公网IP？

```bash
# 方法1: 使用curl
curl ifconfig.me
curl ipinfo.io/ip

# 方法2: 访问网站
# https://www.whatismyip.com/
```

### Q: 域名如何解析到公网IP？

在域名服务商（如阿里云、腾讯云）配置A记录：

```
类型: A
主机记录: dc
记录值: 你的公网IP
TTL: 600
```

### Q: 公网IP是动态的怎么办？

使用DDNS（动态域名解析）服务：

1. **路由器自带DDNS**
   - 登录路由器
   - 找到DDNS设置
   - 选择服务商（花生壳、No-IP等）
   - 配置账号

2. **使用脚本自动更新**
   ```bash
   # 定时检查IP并更新DNS记录
   # 可以用阿里云、腾讯云的API
   ```

### Q: 不想暴露端口怎么办？

使用Nginx反向代理：

```nginx
server {
    listen 80;
    server_name dc.obash.cc;
    
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

然后配置：
```env
BACKEND_URL=http://dc.obash.cc
```

端口映射改为：
```
外网80 → 内网80 (Nginx)
```

### Q: 如何使用HTTPS？

1. **申请SSL证书**（Let's Encrypt免费）
2. **配置Nginx**
   ```nginx
   server {
       listen 443 ssl;
       server_name dc.obash.cc;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       location /api/ {
           proxy_pass http://127.0.0.1:3001;
       }
   }
   ```
3. **更新配置**
   ```env
   BACKEND_URL=https://dc.obash.cc
   ```

## 安全建议

1. **使用HTTPS** - 生产环境必须使用HTTPS
2. **限制访问** - 只允许BEpusdt服务器IP访问Webhook
3. **验证签名** - 严格验证Webhook签名
4. **日志监控** - 记录所有Webhook请求
5. **防火墙规则** - 只开放必要的端口
6. **定期更新** - 保持系统和依赖包更新

## 监控和日志

### 查看服务器日志

```bash
cd server
npm start

# 会显示所有请求日志
# 包括Webhook调用
```

### 查看Webhook调用

日志会显示：
```
📨 收到Webhook通知: {...}
✅ Webhook签名验证通过
✅ 订单已支付，开始处理: ORDER123
🎉 订单处理完成: ORDER123
```

## 当前状态检查

运行服务器后，你会看到：

```
📡 本地访问: http://localhost:3001
📡 局域网访问: http://172.16.254.252:3001
💡 提示:
  - BEpusdt Webhook可配置为: http://dc.obash.cc:3001/api/recharge/webhook
```

## 总结

✅ **配置正确**：
- 端口映射：3001 → 3001
- BACKEND_URL：http://dc.obash.cc:3001
- Webhook URL：http://dc.obash.cc:3001/api/recharge/webhook

✅ **优点**：
- 端口号一致，配置简单
- 不需要记住不同的端口
- 便于维护和调试

现在启动服务器，BEpusdt就可以正常调用Webhook了！
