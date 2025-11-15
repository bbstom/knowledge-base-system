# 前后端HTTPS对接调试清单

## 📋 需要提供的信息

### 1. 后端配置

#### A. 后端 .env 文件内容

```bash
# 在后端服务器上运行
cat .env | grep -E "NODE_ENV|PORT|CORS|COOKIE|JWT"
```

请提供输出，特别是：
- `NODE_ENV`
- `PORT`
- `CORS_ORIGIN`
- `COOKIE_DOMAIN`

#### B. 后端服务状态

```bash
# 检查服务运行状态
pm2 status

# 查看最近的日志
pm2 logs api-server --lines 50
```

#### C. 后端健康检查

```bash
# 本地测试
curl https://api.anyconnects.eu.org/health

# CORS测试
curl -v -H "Origin: https://www.13140.sbs" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.anyconnects.eu.org/api/auth/login
```

请提供完整输出，特别关注：
- `Access-Control-Allow-Origin`
- `Access-Control-Allow-Credentials`

#### D. 后端CORS代码配置

```bash
# 查看CORS配置
grep -A 15 "cors" server/index.js
```

### 2. 前端配置

#### A. 前端环境变量

```bash
# 在前端服务器上运行
cat client/.env.production
```

应该显示：
```env
VITE_API_URL=https://api.anyconnects.eu.org
```

#### B. 前端构建验证

```bash
# 检查构建文件中的API地址
grep -r "anyconnects.eu.org" client/dist/assets/*.js | head -5
```

#### C. Nginx配置

```bash
# 前端Nginx配置
cat /etc/nginx/sites-available/frontend

# 或
cat /etc/nginx/conf.d/frontend.conf
```

### 3. 浏览器信息

#### A. 浏览器控制台错误

打开浏览器（Chrome/Firefox）：
1. 访问 `https://www.13140.sbs`
2. 按 F12 打开开发者工具
3. 切换到 **Console** 标签
4. 截图或复制所有红色错误信息

#### B. Network请求详情

在开发者工具中：
1. 切换到 **Network** 标签
2. 尝试登录或任何API操作
3. 找到失败的API请求
4. 点击该请求，查看：
   - **Headers** 标签：
     - Request Headers（请求头）
     - Response Headers（响应头）
   - **Response** 标签：错误信息

请提供截图或复制以下信息：
```
Request URL: 
Request Method: 
Status Code: 

Request Headers:
  Origin: 
  Cookie: 
  
Response Headers:
  Access-Control-Allow-Origin: 
  Access-Control-Allow-Credentials: 
  Set-Cookie: 
```

#### C. Cookie检查

在开发者工具中：
1. 切换到 **Application** 标签（Chrome）或 **Storage** 标签（Firefox）
2. 左侧选择 **Cookies** → `https://www.13140.sbs`
3. 截图或列出所有Cookie

特别关注：
- 是否有 `token` Cookie
- Domain 是什么
- Secure 是否为 true
- SameSite 是什么

### 4. 测试命令输出

#### A. 从前端服务器测试后端

```bash
# 在前端服务器上运行
curl -v https://api.anyconnects.eu.org/health
```

#### B. 测试登录API

```bash
# 测试登录接口
curl -v -X POST https://api.anyconnects.eu.org/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://www.13140.sbs" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 5. SSL证书检查

```bash
# 检查后端SSL证书
openssl s_client -connect api.anyconnects.eu.org:443 -servername api.anyconnects.eu.org < /dev/null 2>/dev/null | openssl x509 -noout -dates

# 检查前端SSL证书
openssl s_client -connect www.13140.sbs:443 -servername www.13140.sbs < /dev/null 2>/dev/null | openssl x509 -noout -dates
```

## 🔍 快速诊断脚本

将以下脚本保存为 `debug-info.sh` 并运行：

```bash
#!/bin/bash

echo "==================================="
echo "前后端HTTPS对接诊断信息"
echo "==================================="
echo ""

echo "1. 后端配置"
echo "-----------------------------------"
echo "后端.env关键配置："
cat .env | grep -E "NODE_ENV|PORT|CORS|COOKIE" || echo "未找到.env文件"
echo ""

echo "2. 后端服务状态"
echo "-----------------------------------"
pm2 status | grep api-server || echo "PM2未运行或未找到api-server"
echo ""

echo "3. 后端健康检查"
echo "-----------------------------------"
curl -s https://api.anyconnects.eu.org/health | head -20
echo ""

echo "4. CORS预检测试"
echo "-----------------------------------"
curl -s -I -H "Origin: https://www.13140.sbs" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.anyconnects.eu.org/api/auth/login | grep -i "access-control"
echo ""

echo "5. 前端环境变量"
echo "-----------------------------------"
if [ -f "client/.env.production" ]; then
    cat client/.env.production
else
    echo "未找到client/.env.production"
fi
echo ""

echo "6. 前端构建检查"
echo "-----------------------------------"
if [ -d "client/dist" ]; then
    echo "构建文件存在"
    grep -r "anyconnects.eu.org" client/dist/assets/*.js 2>/dev/null | head -3 || echo "未找到API地址"
else
    echo "未找到构建文件"
fi
echo ""

echo "7. SSL证书检查"
echo "-----------------------------------"
echo "后端证书："
openssl s_client -connect api.anyconnects.eu.org:443 -servername api.anyconnects.eu.org < /dev/null 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "无法获取证书信息"
echo ""
echo "前端证书："
openssl s_client -connect www.13140.sbs:443 -servername www.13140.sbs < /dev/null 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "无法获取证书信息"
echo ""

echo "==================================="
echo "诊断信息收集完成"
echo "==================================="
```

运行方法：

```bash
chmod +x debug-info.sh
./debug-info.sh > debug-output.txt
cat debug-output.txt
```

## 📝 信息提供模板

请按以下格式提供信息：

```
### 后端配置
NODE_ENV=
CORS_ORIGIN=
COOKIE_DOMAIN=

### 后端健康检查
[粘贴 curl https://api.anyconnects.eu.org/health 的输出]

### CORS测试
[粘贴 CORS OPTIONS 请求的输出]

### 前端环境变量
[粘贴 client/.env.production 的内容]

### 浏览器错误
Console错误：
[粘贴控制台错误]

Network错误：
Request URL: 
Status Code: 
错误信息：

### Cookie信息
[是否有token Cookie？Domain是什么？]
```

## 🎯 最常见的问题

根据经验，HTTPS环境下最常见的问题是：

### 1. CORS配置不正确
- `CORS_ORIGIN` 必须是 `https://www.13140.sbs`（带https）
- 必须包含 `credentials: true`

### 2. Cookie配置不正确
- `secure: true`（HTTPS必须）
- `sameSite: 'none'`（跨域必须）
- `domain: '.13140.sbs'`（注意点号）

### 3. 前端API地址错误
- 必须是 `https://api.anyconnects.eu.org`（带https）
- 必须在构建前配置

### 4. SSL证书问题
- 证书过期
- 证书域名不匹配
- 自签名证书

## 🚀 提供信息后

提供上述信息后，我可以：
1. 精确定位问题
2. 提供具体的修复方案
3. 给出完整的配置文件

请尽可能详细地提供信息，特别是：
- 浏览器控制台的错误
- Network标签的请求详情
- 后端日志
- 配置文件内容
