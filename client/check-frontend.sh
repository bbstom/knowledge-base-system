#!/bin/bash

echo "==================================="
echo "前端配置检查"
echo "==================================="
echo ""

echo "1. 检查前端环境变量"
echo "-----------------------------------"
if [ -f "../.env.production" ]; then
    echo "找到 .env.production:"
    cat ../.env.production
else
    echo "❌ 未找到 ../.env.production"
fi
echo ""

echo "2. 检查构建文件"
echo "-----------------------------------"
if [ -d "../dist" ]; then
    echo "✓ dist目录存在"
    echo "检查API地址配置..."
    grep -r "anyconnects.eu.org" ../dist/assets/*.js 2>/dev/null | head -3
    if [ $? -eq 0 ]; then
        echo "✓ 找到API地址"
    else
        echo "❌ 未找到API地址，可能需要重新构建"
    fi
else
    echo "❌ dist目录不存在，需要构建"
fi
echo ""

echo "3. 检查后端服务"
echo "-----------------------------------"
if pm2 list | grep -q "api-server"; then
    echo "✓ 后端服务运行中"
    pm2 status | grep api-server
else
    echo "❌ 后端服务未运行"
fi
echo ""

echo "4. 测试后端API"
echo "-----------------------------------"
echo "健康检查:"
curl -s https://api.anyconnects.eu.org/health | head -5
echo ""

echo "5. 检查Cookie配置代码"
echo "-----------------------------------"
echo "查找Cookie设置代码..."
grep -n "res.cookie" routes/auth.js 2>/dev/null | head -5
echo ""

echo "==================================="
echo "检查完成"
echo "==================================="
echo ""
echo "下一步："
echo "1. 如果.env.production不存在或内容不对，运行："
echo "   echo 'VITE_API_URL=https://api.anyconnects.eu.org' > ../.env.production"
echo ""
echo "2. 重新构建前端："
echo "   cd .. && npm run build"
echo ""
echo "3. 部署到前端服务器"
echo ""
