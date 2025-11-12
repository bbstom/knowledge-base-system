#!/bin/bash

# PM2环境变量修复启动脚本

echo "=== 停止现有PM2进程 ==="
pm2 stop base2 2>/dev/null || true
pm2 delete base2 2>/dev/null || true

echo ""
echo "=== 使用ecosystem配置启动 ==="
cd /var/www/html/knowledge-base-system/client
pm2 start ecosystem.config.js

echo ""
echo "=== 等待服务启动 ==="
sleep 3

echo ""
echo "=== 检查PM2状态 ==="
pm2 status

echo ""
echo "=== 查看最新日志 ==="
pm2 logs base2 --lines 30 --nostream

echo ""
echo "=== 完成 ==="
echo "如果还有问题，请运行: pm2 logs base2"
