#!/bin/bash

# 🚀 快速部署前端脚本

set -e

echo "=================================="
echo "🚀 快速部署前端"
echo "=================================="
echo ""

# 1. 构建
echo "📦 步骤 1/4: 构建前端..."
npm run build

# 2. 验证
echo ""
echo "🔍 步骤 2/4: 验证构建..."
if grep -r "api.anyconnects.eu.org" dist/ 2>/dev/null; then
    echo "⚠️  警告：构建文件中包含后端域名"
else
    echo "✅ 构建验证通过"
fi

# 3. 打包
echo ""
echo "📦 步骤 3/4: 打包..."
tar -czf frontend-update.tar.gz dist/
echo "✅ 打包完成: frontend-update.tar.gz"

# 4. 上传并部署
echo ""
echo "📤 步骤 4/4: 上传并部署..."
scp frontend-update.tar.gz root@www.13140.sbs:/tmp/

ssh root@www.13140.sbs << 'ENDSSH'
cd /tmp
echo "  - 解压..."
tar -xzf frontend-update.tar.gz

echo "  - 备份旧文件..."
if [ -d /www/wwwroot/frontend ]; then
    mv /www/wwwroot/frontend /www/wwwroot/frontend.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
fi

echo "  - 部署新文件..."
mkdir -p /www/wwwroot/frontend
cp -r dist/* /www/wwwroot/frontend/

echo "  - 设置权限..."
chown -R www-data:www-data /www/wwwroot/frontend 2>/dev/null || chown -R nginx:nginx /www/wwwroot/frontend 2>/dev/null || true
chmod -R 755 /www/wwwroot/frontend

echo "  - 清理..."
rm -rf dist frontend-update.tar.gz

echo "✅ 部署完成"
ENDSSH

# 清理本地文件
rm -f frontend-update.tar.gz

echo ""
echo "=================================="
echo "✅ 部署完成！"
echo "=================================="
echo ""
echo "📋 验证步骤："
echo "  1. 清除浏览器缓存（Ctrl + Shift + Delete）"
echo "  2. 访问: https://www.13140.sbs/admin/site-config"
echo "  3. 测试保存配置功能"
echo ""
