#!/bin/bash

# 🚀 前后端分离部署脚本 - 使用Nginx反向代理
# 用户只看到前端域名，后端完全隐藏

set -e  # 遇到错误立即退出

echo "=================================="
echo "🚀 开始部署 - Nginx反向代理模式"
echo "=================================="

# 配置变量
FRONTEND_DOMAIN="www.13140.sbs"
BACKEND_DOMAIN="api.anyconnects.eu.org"
FRONTEND_SERVER="root@www.13140.sbs"
BACKEND_SERVER="root@api.anyconnects.eu.org"

echo ""
echo "📋 部署配置："
echo "  前端域名: https://$FRONTEND_DOMAIN"
echo "  后端域名: https://$BACKEND_DOMAIN (隐藏)"
echo ""

# ============================================
# 1. 构建前端
# ============================================
echo "📦 步骤 1/5: 构建前端..."
echo ""

# 创建生产环境配置
cat > .env.production << EOF
# 生产环境 - 使用相对路径（通过Nginx代理）
VITE_API_URL=/api
NODE_ENV=production
EOF

echo "✅ 已创建 .env.production"

# 构建
npm run build

# 验证构建
echo ""
echo "🔍 验证构建文件..."
if grep -r "$BACKEND_DOMAIN" dist/ 2>/dev/null; then
    echo "❌ 错误：构建文件中包含后端域名！"
    echo "   这会暴露后端地址，请检查配置"
    exit 1
else
    echo "✅ 构建文件验证通过（不包含后端域名）"
fi

# ============================================
# 2. 打包前端
# ============================================
echo ""
echo "📦 步骤 2/5: 打包前端..."
tar -czf frontend-proxy.tar.gz dist/
echo "✅ 前端打包完成: frontend-proxy.tar.gz"

# ============================================
# 3. 上传前端到服务器
# ============================================
echo ""
echo "📤 步骤 3/5: 上传前端到服务器..."
scp frontend-proxy.tar.gz $FRONTEND_SERVER:/tmp/
echo "✅ 前端上传完成"

# ============================================
# 4. 部署前端
# ============================================
echo ""
echo "🚀 步骤 4/5: 部署前端..."
ssh $FRONTEND_SERVER << 'ENDSSH'
cd /tmp
echo "  - 解压文件..."
tar -xzf frontend-proxy.tar.gz

echo "  - 备份旧文件..."
if [ -d /www/wwwroot/frontend ]; then
    mv /www/wwwroot/frontend /www/wwwroot/frontend.backup.$(date +%Y%m%d_%H%M%S)
fi

echo "  - 部署新文件..."
mkdir -p /www/wwwroot/frontend
cp -r dist/* /www/wwwroot/frontend/

echo "  - 设置权限..."
chown -R www-data:www-data /www/wwwroot/frontend 2>/dev/null || chown -R nginx:nginx /www/wwwroot/frontend 2>/dev/null || true
chmod -R 755 /www/wwwroot/frontend

echo "  - 清理临时文件..."
rm -rf dist frontend-proxy.tar.gz

echo "✅ 前端部署完成"
ENDSSH

# ============================================
# 5. 检查Nginx配置
# ============================================
echo ""
echo "🔍 步骤 5/5: 检查Nginx配置..."
echo ""
echo "⚠️  请确保前端服务器Nginx配置包含以下内容："
echo ""
cat << 'EOF'
location /api/ {
    proxy_pass https://api.anyconnects.eu.org/api/;
    proxy_set_header Host api.anyconnects.eu.org;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Cookie $http_cookie;
    proxy_pass_header Set-Cookie;
    proxy_http_version 1.1;
    proxy_connect_timeout 60s;
    proxy_read_timeout 60s;
}
EOF
echo ""

read -p "是否需要自动配置Nginx？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔧 配置Nginx..."
    ssh $FRONTEND_SERVER << 'ENDSSH'
    # 检查Nginx配置文件位置
    if [ -f /etc/nginx/sites-available/frontend ]; then
        NGINX_CONF="/etc/nginx/sites-available/frontend"
    elif [ -f /etc/nginx/conf.d/frontend.conf ]; then
        NGINX_CONF="/etc/nginx/conf.d/frontend.conf"
    else
        echo "❌ 未找到Nginx配置文件"
        echo "   请手动配置 /etc/nginx/sites-available/frontend"
        exit 1
    fi
    
    echo "  - 备份Nginx配置..."
    cp $NGINX_CONF ${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S)
    
    echo "  - 检查是否已有API代理配置..."
    if grep -q "location /api/" $NGINX_CONF; then
        echo "  ✅ 已存在API代理配置"
    else
        echo "  ⚠️  未找到API代理配置，请手动添加"
    fi
    
    echo "  - 测试Nginx配置..."
    nginx -t
    
    echo "  - 重载Nginx..."
    systemctl reload nginx || nginx -s reload
    
    echo "✅ Nginx配置完成"
ENDSSH
fi

# ============================================
# 6. 更新后端（如果需要）
# ============================================
echo ""
read -p "是否需要更新后端CORS配置？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 上传后端代码..."
    
    # 打包后端（排除node_modules和其他不需要的文件）
    tar -czf backend-update.tar.gz \
        --exclude='node_modules' \
        --exclude='dist' \
        --exclude='.git' \
        --exclude='*.log' \
        server/ package.json package-lock.json
    
    scp backend-update.tar.gz $BACKEND_SERVER:/tmp/
    
    echo "🚀 部署后端..."
    ssh $BACKEND_SERVER << 'ENDSSH'
    cd /tmp
    tar -xzf backend-update.tar.gz
    
    # 假设后端在 /www/wwwroot/backend
    BACKEND_DIR="/www/wwwroot/backend"
    
    if [ -d "$BACKEND_DIR" ]; then
        echo "  - 备份旧代码..."
        cp -r $BACKEND_DIR ${BACKEND_DIR}.backup.$(date +%Y%m%d_%H%M%S)
        
        echo "  - 更新代码..."
        cp -r server/* $BACKEND_DIR/server/
        cp package*.json $BACKEND_DIR/
        
        echo "  - 安装依赖..."
        cd $BACKEND_DIR
        npm install --production
        
        echo "  - 重启后端服务..."
        pm2 restart backend || systemctl restart backend || echo "⚠️  请手动重启后端服务"
        
        echo "✅ 后端更新完成"
    else
        echo "❌ 未找到后端目录: $BACKEND_DIR"
        echo "   请手动部署后端"
    fi
    
    rm -f /tmp/backend-update.tar.gz
ENDSSH
    
    rm -f backend-update.tar.gz
fi

# ============================================
# 完成
# ============================================
echo ""
echo "=================================="
echo "✅ 部署完成！"
echo "=================================="
echo ""
echo "📋 验证步骤："
echo "  1. 清除浏览器缓存（Ctrl + Shift + Delete）"
echo "  2. 访问: https://$FRONTEND_DOMAIN"
echo "  3. 打开开发者工具（F12）→ Network标签"
echo "  4. 检查API请求："
echo "     ✅ 应该是: https://$FRONTEND_DOMAIN/api/..."
echo "     ❌ 不应该是: https://$BACKEND_DOMAIN/api/..."
echo ""
echo "🔍 测试功能："
echo "  - 登录/注册"
echo "  - 搜索功能"
echo "  - 用户资料"
echo "  - 充值记录"
echo ""
echo "📚 详细文档: NGINX_PROXY_SETUP.md"
echo "=================================="
