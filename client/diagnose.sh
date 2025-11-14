#!/bin/bash

# 前后端分离部署诊断脚本

echo "================================"
echo "前后端分离部署诊断工具"
echo "================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo "1. 检查后端服务..."
echo "-------------------"

# 检查PM2
if command -v pm2 &> /dev/null; then
    check_pass "PM2已安装"
    
    # 检查后端进程
    if pm2 list | grep -q "api-server"; then
        check_pass "后端进程正在运行"
        pm2 status | grep api-server
    else
        check_fail "后端进程未运行"
        echo "  请运行: pm2 start server/index.js --name api-server"
    fi
else
    check_fail "PM2未安装"
    echo "  请运行: npm install -g pm2"
fi

# 检查后端端口
if netstat -tlnp 2>/dev/null | grep -q ":3001"; then
    check_pass "后端端口3001正在监听"
else
    check_fail "后端端口3001未监听"
fi

# 检查后端健康
if curl -s http://localhost:3001/health &> /dev/null; then
    check_pass "后端健康检查通过"
else
    check_fail "后端健康检查失败"
    echo "  请检查后端是否正常运行"
fi

echo ""
echo "2. 检查后端配置..."
echo "-------------------"

# 检查.env文件
if [ -f ".env" ]; then
    check_pass ".env文件存在"
    
    # 检查关键配置
    if grep -q "CORS_ORIGIN" .env; then
        CORS_ORIGIN=$(grep "CORS_ORIGIN" .env | cut -d '=' -f2)
        echo "  CORS_ORIGIN: $CORS_ORIGIN"
    else
        check_warn "CORS_ORIGIN未配置"
    fi
    
    if grep -q "COOKIE_DOMAIN" .env; then
        COOKIE_DOMAIN=$(grep "COOKIE_DOMAIN" .env | cut -d '=' -f2)
        echo "  COOKIE_DOMAIN: $COOKIE_DOMAIN"
    else
        check_warn "COOKIE_DOMAIN未配置"
    fi
else
    check_fail ".env文件不存在"
fi

echo ""
echo "3. 检查前端配置..."
echo "-------------------"

# 检查前端环境变量
if [ -f "client/.env.production" ]; then
    check_pass "前端.env.production存在"
    
    if grep -q "VITE_API_URL" client/.env.production; then
        API_URL=$(grep "VITE_API_URL" client/.env.production | cut -d '=' -f2)
        echo "  VITE_API_URL: $API_URL"
    else
        check_warn "VITE_API_URL未配置"
    fi
else
    check_fail "前端.env.production不存在"
fi

# 检查前端构建
if [ -d "client/dist" ]; then
    check_pass "前端已构建"
    FILE_COUNT=$(find client/dist -type f | wc -l)
    echo "  构建文件数: $FILE_COUNT"
else
    check_fail "前端未构建"
    echo "  请运行: cd client && npm run build"
fi

echo ""
echo "4. 检查Nginx..."
echo "-------------------"

if command -v nginx &> /dev/null; then
    check_pass "Nginx已安装"
    
    # 检查Nginx配置
    if sudo nginx -t &> /dev/null; then
        check_pass "Nginx配置正确"
    else
        check_fail "Nginx配置错误"
        sudo nginx -t
    fi
    
    # 检查Nginx运行状态
    if systemctl is-active --quiet nginx; then
        check_pass "Nginx正在运行"
    else
        check_fail "Nginx未运行"
    fi
else
    check_warn "Nginx未安装"
fi

echo ""
echo "5. 检查网络连接..."
echo "-------------------"

# 检查防火墙
if command -v ufw &> /dev/null; then
    if sudo ufw status | grep -q "3001"; then
        check_pass "防火墙已开放3001端口"
    else
        check_warn "防火墙可能未开放3001端口"
    fi
fi

echo ""
echo "6. 测试API连接..."
echo "-------------------"

# 测试本地API
if curl -s http://localhost:3001/health &> /dev/null; then
    check_pass "本地API连接成功"
else
    check_fail "本地API连接失败"
fi

# 测试CORS
CORS_TEST=$(curl -s -H "Origin: https://www.13140.sbs" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:3001/api/auth/login \
     -I | grep -i "access-control-allow-origin")

if [ ! -z "$CORS_TEST" ]; then
    check_pass "CORS配置正确"
    echo "  $CORS_TEST"
else
    check_fail "CORS配置可能有问题"
fi

echo ""
echo "================================"
echo "诊断完成"
echo "================================"
echo ""
echo "建议操作："
echo "1. 如果后端未运行，执行: pm2 start server/index.js --name api-server"
echo "2. 如果配置有问题，检查 .env 和 client/.env.production"
echo "3. 如果前端未构建，执行: cd client && npm run build"
echo "4. 查看详细日志: pm2 logs api-server"
echo ""
