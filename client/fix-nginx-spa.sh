#!/bin/bash

# 🔧 修复Nginx SPA路由配置

echo "🔧 修复Nginx SPA路由配置..."
echo ""

# 检查是否在前端服务器上
if [ ! -d "/www/wwwroot/frontend" ]; then
    echo "❌ 错误：未找到前端目录 /www/wwwroot/frontend"
    echo "   请在前端服务器上运行此脚本"
    exit 1
fi

# 查找Nginx配置文件
NGINX_CONF=""
if [ -f "/etc/nginx/sites-available/default" ]; then
    NGINX_CONF="/etc/nginx/sites-available/default"
elif [ -f "/etc/nginx/sites-available/www.13140.sbs" ]; then
    NGINX_CONF="/etc/nginx/sites-available/www.13140.sbs"
elif [ -f "/etc/nginx/conf.d/default.conf" ]; then
    NGINX_CONF="/etc/nginx/conf.d/default.conf"
elif [ -f "/etc/nginx/conf.d/www.13140.sbs.conf" ]; then
    NGINX_CONF="/etc/nginx/conf.d/www.13140.sbs.conf"
else
    echo "❌ 错误：未找到Nginx配置文件"
    echo "   请手动编辑配置文件"
    exit 1
fi

echo "✅ 找到配置文件: $NGINX_CONF"
echo ""

# 备份配置
BACKUP_FILE="${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S)"
cp "$NGINX_CONF" "$BACKUP_FILE"
echo "✅ 已备份配置到: $BACKUP_FILE"
echo ""

# 检查是否已有正确的SPA配置
if grep -q "try_files.*index.html" "$NGINX_CONF"; then
    echo "✅ 配置文件中已有 try_files 配置"
    echo ""
    echo "当前配置："
    grep -A 2 "location /" "$NGINX_CONF" | grep -v "location /api"
    echo ""
else
    echo "⚠️  未找到 try_files 配置"
    echo "   请手动添加以下配置到 location / 块中："
    echo ""
    echo "   location / {"
    echo "       try_files \$uri \$uri/ /index.html;"
    echo "       add_header Cache-Control \"no-cache, must-revalidate\";"
    echo "   }"
    echo ""
fi

# 测试Nginx配置
echo "🔍 测试Nginx配置..."
if nginx -t; then
    echo ""
    echo "✅ Nginx配置测试通过"
    echo ""
    
    read -p "是否重载Nginx？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        systemctl reload nginx || nginx -s reload
        echo "✅ Nginx已重载"
        echo ""
        echo "📋 验证步骤："
        echo "  1. 清除浏览器缓存（Ctrl + Shift + Delete）"
        echo "  2. 直接访问: https://www.13140.sbs/login"
        echo "  3. 应该正常显示，不再404"
    fi
else
    echo ""
    echo "❌ Nginx配置测试失败"
    echo "   配置已恢复到备份: $BACKUP_FILE"
    cp "$BACKUP_FILE" "$NGINX_CONF"
fi
