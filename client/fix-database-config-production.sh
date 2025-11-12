#!/bin/bash

# 生产环境数据库配置修复脚本
# 用途：清空SystemConfig中的数据库配置，更新代码，重启服务

echo "========================================"
echo "  生产环境数据库配置修复"
echo "========================================"
echo ""

# 设置生产环境路径
PROD_PATH="/var/www/html/knowledge-base-system/client"

# 检查路径是否存在
if [ ! -d "$PROD_PATH" ]; then
    echo "❌ 生产环境路径不存在: $PROD_PATH"
    exit 1
fi

cd "$PROD_PATH"

echo "[1/6] 清空SystemConfig中的数据库配置..."
cd server
node scripts/clearDatabaseConfig.js

if [ $? -ne 0 ]; then
    echo "❌ 清空配置失败"
    exit 1
fi

echo ""
echo "[2/6] 返回项目根目录..."
cd ..

echo "[3/6] 拉取最新代码..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "⚠️  代码拉取失败，继续执行..."
fi

echo ""
echo "[4/6] 检查.env配置..."
if grep -q "QUERY_MONGO_URIS" server/.env; then
    echo "✅ .env配置已更新"
else
    echo "⚠️  .env配置需要手动更新"
    echo "   请将 QUERY_MONGO_URI 改为 QUERY_MONGO_URIS"
fi

echo ""
echo "[5/6] 重启PM2服务..."
pm2 restart base2

echo ""
echo "[6/6] 等待服务启动..."
sleep 5

echo ""
echo "========================================"
echo "  查看日志"
echo "========================================"
pm2 logs base2 --lines 30 --nostream

echo ""
echo "========================================"
echo "  ✅ 修复完成！"
echo "========================================"
echo ""
echo "验证步骤："
echo "1. 检查日志中是否有 '从环境变量初始化数据库连接'"
echo "2. 确认没有 '发现数据库配置，检查是否需要重新连接'"
echo "3. 测试登录功能"
echo ""
