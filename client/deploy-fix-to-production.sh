#!/bin/bash

# 生产环境PM2修复部署脚本

echo "========================================"
echo "  生产环境PM2修复部署"
echo "========================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否在正确的目录
if [ ! -f "server/index.js" ]; then
    echo -e "${RED}[错误]${NC} 请在项目根目录运行此脚本"
    echo "当前目录: $(pwd)"
    echo "应该在: /var/www/html/knowledge-base-system/client"
    exit 1
fi

echo -e "${GREEN}[1/5]${NC} 检查server/index.js..."

# 检查server/index.js是否已修复
if grep -q "path: require('path').join(__dirname, '.env')" server/index.js; then
    echo -e "${GREEN}✓${NC} server/index.js 已包含修复"
else
    echo -e "${YELLOW}⚠${NC} server/index.js 需要更新"
    echo ""
    echo "正在备份原文件..."
    cp server/index.js server/index.js.backup.$(date +%Y%m%d_%H%M%S)
    
    echo "正在更新第一行..."
    # 创建临时文件
    cat > /tmp/index_fix.js << 'EOF'
// 加载环境变量 - 使用绝对路径确保在任何工作目录下都能找到.env文件
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
EOF
    
    # 删除原来的第一行，添加新的
    tail -n +2 server/index.js > /tmp/index_rest.js
    cat /tmp/index_fix.js /tmp/index_rest.js > server/index.js
    
    echo -e "${GREEN}✓${NC} server/index.js 已更新"
fi

echo ""
echo -e "${GREEN}[2/5]${NC} 检查.env文件..."

if [ ! -f "server/.env" ]; then
    echo -e "${RED}✗${NC} server/.env 文件不存在！"
    exit 1
fi

if grep -q "USER_MONGO_URI" server/.env; then
    echo -e "${GREEN}✓${NC} .env 文件包含 USER_MONGO_URI"
else
    echo -e "${RED}✗${NC} .env 文件缺少 USER_MONGO_URI"
    exit 1
fi

echo ""
echo -e "${GREEN}[3/5]${NC} 停止旧的PM2进程..."

pm2 stop base2 2>/dev/null || echo "没有运行中的进程"
pm2 delete base2 2>/dev/null || echo "没有需要删除的进程"

echo ""
echo -e "${GREEN}[4/5]${NC} 启动PM2服务..."

if [ -f "start-pm2-with-env.cjs" ]; then
    echo "使用智能启动脚本..."
    node start-pm2-with-env.cjs
else
    echo "使用PM2直接启动..."
    pm2 start server/index.js --name base2
fi

echo ""
echo -e "${GREEN}[5/5]${NC} 验证启动..."

sleep 3

# 检查PM2状态
if pm2 list | grep -q "base2.*online"; then
    echo -e "${GREEN}✓${NC} PM2进程运行中"
else
    echo -e "${RED}✗${NC} PM2进程未运行"
    echo ""
    echo "查看错误日志:"
    pm2 logs base2 --err --lines 20 --nostream
    exit 1
fi

# 检查日志
echo ""
echo "最新日志:"
pm2 logs base2 --lines 20 --nostream

echo ""
echo "========================================"
echo -e "  ${GREEN}部署完成！${NC}"
echo "========================================"
echo ""
echo "常用命令:"
echo "  pm2 status        - 查看状态"
echo "  pm2 logs base2    - 查看日志"
echo "  pm2 restart base2 - 重启服务"
echo ""
