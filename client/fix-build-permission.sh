#!/bin/bash

# 修复生产环境构建权限问题

echo "🔧 修复构建权限问题..."

# 1. 删除或移动 .user.ini 文件
if [ -f "dist/.user.ini" ]; then
    echo "📁 发现 .user.ini 文件，正在处理..."
    sudo chattr -i dist/.user.ini 2>/dev/null || true
    sudo rm -f dist/.user.ini
    echo "✅ .user.ini 已删除"
fi

# 2. 清理 dist 目录
if [ -d "dist" ]; then
    echo "🗑️  清理 dist 目录..."
    sudo rm -rf dist/*
    echo "✅ dist 目录已清理"
fi

# 3. 重新构建
echo "🔨 开始构建..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
else
    echo "❌ 构建失败"
    exit 1
fi

echo ""
echo "🎉 构建完成！"
