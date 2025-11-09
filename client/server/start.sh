#!/bin/bash

echo "================================"
echo "知识库系统后端服务器启动脚本"
echo "================================"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js"
    exit 1
fi

echo "✅ Node.js版本: $(node -v)"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm未安装"
    exit 1
fi

echo "✅ npm版本: $(npm -v)"

# 检查.env文件
if [ ! -f .env ]; then
    echo "❌ .env文件不存在，正在创建..."
    cp .env.example .env
    echo "⚠️  请编辑.env文件配置环境变量"
    exit 1
fi

echo "✅ .env文件存在"

# 检查node_modules
if [ ! -d node_modules ]; then
    echo "📦 安装依赖..."
    npm install
fi

echo "✅ 依赖已安装"

# 启动服务器
echo ""
echo "🚀 启动服务器..."
echo ""

npm start
