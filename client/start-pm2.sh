#!/bin/bash

echo "========================================"
echo "  PM2 智能启动脚本"
echo "========================================"
echo ""

# 检查PM2是否安装
if ! command -v pm2 &> /dev/null; then
    echo "[错误] PM2未安装"
    echo ""
    echo "正在安装PM2..."
    npm install -g pm2
    
    if [ $? -ne 0 ]; then
        echo "[失败] PM2安装失败"
        exit 1
    fi
    
    echo "[成功] PM2安装完成"
    echo ""
fi

echo "[信息] 启动PM2服务..."
echo ""

node start-pm2-with-env.cjs

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "  启动成功！"
    echo "========================================"
    echo ""
    echo "常用命令:"
    echo "  pm2 logs base2    - 查看实时日志"
    echo "  pm2 status        - 查看进程状态"
    echo "  pm2 restart base2 - 重启服务"
    echo "  pm2 stop base2    - 停止服务"
    echo ""
else
    echo ""
    echo "========================================"
    echo "  启动失败！"
    echo "========================================"
    echo ""
    echo "请检查:"
    echo "1. server/.env 文件是否存在"
    echo "2. 数据库连接是否正常"
    echo "3. 端口3001是否被占用"
    echo ""
    exit 1
fi
