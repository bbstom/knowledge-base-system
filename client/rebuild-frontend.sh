#!/bin/bash

echo "==================================="
echo "重新构建前端（使用环境变量）"
echo "==================================="
echo ""

cd /www/wwwroot/knowledge-base-system/client

# 1. 确认环境变量
echo "1. 检查环境变量..."
if [ -f ".env.production" ]; then
    echo "✓ .env.production 存在:"
    cat .env.production
else
    echo "✗ .env.production 不存在，正在创建..."
    echo "VITE_API_URL=https://api.anyconnects.eu.org" > .env.production
    echo "✓ 已创建"
    cat .env.production
fi
echo ""

# 2. 清理
echo "2. 清理旧构建..."
rm -rf dist node_modules/.vite
echo "✓ 清理完成"
echo ""

# 3. 构建
echo "3. 开始构建..."
npm run build

if [ $? -eq 0 ]; then
    echo "✓ 构建成功"
else
    echo "✗ 构建失败"
    exit 1
fi
echo ""

# 4. 验证
echo "4. 验证构建结果..."
echo "检查API地址..."
if grep -r "anyconnects.eu.org" dist/assets/*.js > /dev/null 2>&1; then
    echo "✓ 找到API地址:"
    grep -r "anyconnects.eu.org" dist/assets/*.js | head -3
else
    echo "⚠ 未找到API地址"
    echo "检查构建文件..."
    ls -lh dist/assets/
fi
echo ""

# 5. 部署提示
echo "==================================="
echo "构建完成！"
echo "==================================="
echo ""
echo "下一步："
echo "1. 如果前后端在同一服务器:"
echo "   sudo cp -r dist/* /www/wwwroot/frontend/"
echo "   sudo systemctl reload nginx"
echo ""
echo "2. 如果前后端分离:"
echo "   scp -r dist/* root@www.13140.sbs:/www/wwwroot/frontend/"
echo ""
echo "3. 测试网站:"
echo "   访问 https://www.13140.sbs"
echo "   打开F12查看Network标签"
echo ""
