# 局域网访问配置指南

## 配置完成 ✅

服务器现在已配置为监听所有网络接口（0.0.0.0），可以通过局域网IP访问。

## 你的网络信息

- **本机IP**: `172.16.254.252`
- **后端端口**: `3001`
- **前端端口**: `5173`

## 访问地址

### 后端API
```
本地访问: http://localhost:3001
局域网访问: http://172.16.254.252:3001
```

### 前端应用
```
本地访问: http://localhost:5173
局域网访问: http://172.16.254.252:5173
```

### BEpusdt Webhook
```
http://172.16.254.252:3001/api/recharge/webhook
```

## 启动服务器

```bash
cd server
npm start
```

启动后会显示：
```
📡 本地访问: http://localhost:3001
📡 局域网访问: http://172.16.254.252:3001
```

## 前端配置

如果前端也需要通过局域网访问，需要修改前端的启动配置：

### Vite配置（vite.config.js）

```javascript
export default {
  server: {
    host: '0.0.0.0',  // 监听所有网络接口
    port: 5173
  }
}
```

### 启动前端

```bash
npm run dev -- --host
```

## 测试连接

### 1. 测试后端健康检查

```bash
# 本地测试
curl http://localhost:3001/health

# 局域网测试
curl http://172.16.254.252:3001/health
```

### 2. 从其他设备访问

在同一局域网内的其他设备（手机、平板、其他电脑）上：

```
浏览器访问: http://172.16.254.252:5173
```

## BEpusdt配置

### 方案1：局域网访问（BEpusdt在同一局域网）

如果BEpusdt服务器在同一局域网内，可以直接使用：

```env
BACKEND_URL=http://172.16.254.252:3001
```

BEpusdt会调用：
```
http://172.16.254.252:3001/api/recharge/webhook
```

### 方案2：公网访问（BEpusdt在外网）

如果BEpusdt在公网上，需要使用内网穿透工具：

#### 使用ngrok

```bash
# 安装ngrok
# 下载: https://ngrok.com/download

# 启动内网穿透
ngrok http 3001

# 会生成一个公网URL，例如:
# https://abc123.ngrok.io
```

然后更新.env：
```env
BACKEND_URL=https://abc123.ngrok.io
```

#### 使用frp

```bash
# 配置frpc.ini
[common]
server_addr = your-frp-server.com
server_port = 7000

[web]
type = http
local_port = 3001
custom_domains = your-domain.com

# 启动
frpc -c frpc.ini
```

#### 使用cloudflare tunnel

```bash
# 安装cloudflared
# 下载: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

# 启动tunnel
cloudflared tunnel --url http://localhost:3001
```

## 防火墙配置

### Windows防火墙

如果无法从其他设备访问，需要允许端口：

1. 打开"Windows Defender 防火墙"
2. 点击"高级设置"
3. 点击"入站规则" -> "新建规则"
4. 选择"端口" -> "下一步"
5. 选择"TCP"，输入端口 `3001,5173`
6. 选择"允许连接"
7. 完成

或使用命令行：
```powershell
# 允许3001端口
netsh advfirewall firewall add rule name="Node Backend" dir=in action=allow protocol=TCP localport=3001

# 允许5173端口
netsh advfirewall firewall add rule name="Vite Frontend" dir=in action=allow protocol=TCP localport=5173
```

## 查看本机IP

随时运行此脚本查看当前IP：

```bash
cd server
node scripts/showLocalIP.js
```

## 常见问题

### Q: 无法从其他设备访问？

A: 检查：
1. 防火墙是否允许端口
2. 是否在同一局域网
3. IP地址是否正确
4. 服务器是否正在运行

### Q: IP地址变了怎么办？

A: 如果使用DHCP，IP可能会变化：
1. 运行 `node scripts/showLocalIP.js` 查看新IP
2. 更新 `.env` 文件中的 `BACKEND_URL`
3. 重启服务器

或者配置静态IP：
- 在路由器中为你的设备分配固定IP
- 或在网络设置中配置静态IP

### Q: 如何测试Webhook？

A: 使用模拟脚本：

```bash
# 确保服务器运行
cd server
npm start

# 另一个终端
node scripts/simulatePayment.js ORDER123456
```

## 安全建议

1. **开发环境** - 当前配置适合开发和测试
2. **生产环境** - 应该：
   - 使用HTTPS
   - 配置严格的CORS
   - 使用反向代理（Nginx）
   - 配置防火墙规则
   - 使用环境变量管理敏感信息

## 相关文件

- `server/index.js` - 服务器配置（已修改为监听0.0.0.0）
- `server/.env` - 环境配置（已更新BACKEND_URL）
- `server/scripts/showLocalIP.js` - 查看本机IP脚本
- `BEPUSDT_WEBHOOK_GUIDE.md` - Webhook配置指南
