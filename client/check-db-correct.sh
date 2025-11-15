#!/bin/bash

echo "🔍 检查数据库配置..."
echo ""

# 正确的后端路径
BACKEND_PATH="/var/www/html/knowledge-base-system/client/server"
ENV_FILE="$BACKEND_PATH/.env"

# 检查.env文件
echo "1. 检查.env配置："
if [ -f "$ENV_FILE" ]; then
    echo "✅ .env文件存在"
    echo "   路径: $ENV_FILE"
    echo ""
    echo "数据库配置："
    grep -E "MONGODB|DB_" "$ENV_FILE" | sed 's/PASSWORD=.*/PASSWORD=***/' | sed 's/:.*@/:***@/'
else
    echo "❌ .env文件不存在"
    echo "   期望路径: $ENV_FILE"
    echo ""
    echo "尝试查找.env文件："
    find /var/www/html/knowledge-base-system -name ".env" 2>/dev/null
fi

echo ""
echo "2. 检查MongoDB服务："
systemctl is-active mongod && echo "✅ MongoDB运行中" || echo "❌ MongoDB未运行"

echo ""
echo "3. 检查MongoDB端口："
if netstat -tlnp 2>/dev/null | grep -q 27017; then
    echo "✅ MongoDB端口监听中"
    netstat -tlnp | grep 27017
elif ss -tlnp 2>/dev/null | grep -q 27017; then
    echo "✅ MongoDB端口监听中"
    ss -tlnp | grep 27017
else
    echo "❌ MongoDB端口未监听"
fi

echo ""
echo "4. PM2进程状态："
pm2 list 2>/dev/null | grep base2 || echo "未找到base2进程"

echo ""
echo "5. 最近的错误日志："
if [ -f /root/.pm2/logs/base2-error.log ]; then
    echo "---"
    tail -n 15 /root/.pm2/logs/base2-error.log
    echo "---"
else
    echo "❌ 日志文件不存在"
fi

echo ""
echo "6. 后端目录结构："
ls -la "$BACKEND_PATH" 2>/dev/null | head -n 20 || echo "❌ 目录不存在"

echo ""
echo "=================================="
echo "✅ 诊断完成"
echo "=================================="
