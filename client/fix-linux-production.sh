#!/bin/bash

# Linux生产环境修复脚本

echo "========================================"
echo "  Linux生产环境修复"
echo "========================================"
echo ""

# 设置生产环境路径
PROD_PATH="/var/www/html/knowledge-base-system/client"

cd "$PROD_PATH"

echo "[1/8] 拉取最新代码..."
git pull origin main

echo ""
echo "[2/8] 清空SystemConfig数据库配置..."
cd server
node scripts/clearDatabaseConfig.js

if [ $? -ne 0 ]; then
    echo "⚠️  清空配置失败，继续执行..."
fi

echo ""
echo "[3/8] 检查.env配置..."
echo "USER_MONGO_URI:"
grep "USER_MONGO_URI" .env | head -1
echo "QUERY_MONGO_URIS:"
grep "QUERY_MONGO_URIS" .env | head -1

echo ""
echo "[4/8] 检查文件权限..."
ls -la .env

echo ""
echo "[5/8] 返回项目根目录..."
cd ..

echo ""
echo "[6/8] 停止PM2..."
pm2 stop base2
pm2 delete base2

echo ""
echo "[7/8] 启动PM2..."
pm2 start server/index.js --name base2

echo ""
echo "[8/8] 等待服务启动..."
sleep 5

echo ""
echo "========================================"
echo "  查看日志"
echo "========================================"
pm2 logs base2 --lines 50 --nostream

echo ""
echo "========================================"
echo "  修复完成"
echo "========================================"
echo ""
echo "如果还有问题，运行诊断："
echo "cd $PROD_PATH/server && node scripts/diagnoseLoginIssueNow.js"
echo ""
