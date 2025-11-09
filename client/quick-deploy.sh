#!/bin/bash

# 知识库管理系统 - 快速部署脚本
# 适用于 Ubuntu 20.04+ 服务器

set -e

echo "========================================="
echo "  知识库管理系统 - 快速部署"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 root 用户或 sudo 运行此脚本${NC}"
    exit 1
fi

# 获取用户输入
echo -e "${YELLOW}请输入以下信息：${NC}"
read -p "GitHub 用户名: " GITHUB_USER
read -p "仓库名称 [knowledge-base-system]: " REPO_NAME
REPO_NAME=${REPO_NAME:-knowledge-base-system}
read -p "域名 (可选): " DOMAIN
read -p "MongoDB 密码: " -s MONGO_PASS
echo ""

# 1. 更新系统
echo -e "${GREEN}[1/10] 更新系统...${NC}"
apt update && apt upgrade -y

# 2. 安装 Node.js
echo -e "${GREEN}[2/10] 安装 Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
    apt install -y nodejs
fi
echo "Node.js 版本: $(node -v)"

# 3. 安装 MongoDB
echo -e "${GREEN}[3/10] 安装 MongoDB...${NC}"
if ! command -v mongod &> /dev/null; then
    wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-4.4.list
    apt update
    apt install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
fi

# 4. 安装 PM2
echo -e "${GREEN}[4/10] 安装 PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# 5. 安装 Git
echo -e "${GREEN}[5/10] 安装 Git...${NC}"
if ! command -v git &> /dev/null; then
    apt install -y git
fi

# 6. 克隆项目
echo -e "${GREEN}[6/10] 克隆项目...${NC}"
mkdir -p /var/www
cd /var/www

if [ -d "$REPO_NAME" ]; then
    echo "项目目录已存在，拉取最新代码..."
    cd $REPO_NAME
    git pull origin main
else
    git clone https://github.com/$GITHUB_USER/$REPO_NAME.git
    cd $REPO_NAME
fi

# 7. 配置 MongoDB
echo -e "${GREEN}[7/10] 配置 MongoDB...${NC}"
mongosh <<EOF
use admin
db.createUser({
  user: "admin",
  pwd: "$MONGO_PASS",
  roles: ["root"]
})
use knowledge-base
db.createUser({
  user: "kbuser",
  pwd: "$MONGO_PASS",
  roles: ["readWrite"]
})
exit
EOF

# 启用 MongoDB 认证
if ! grep -q "authorization: enabled" /etc/mongod.conf; then
    echo "security:" >> /etc/mongod.conf
    echo "  authorization: enabled" >> /etc/mongod.conf
    systemctl restart mongod
fi

# 8. 配置环境变量
echo -e "${GREEN}[8/10] 配置环境变量...${NC}"
if [ ! -f "server/.env" ]; then
    cp server/.env.example server/.env
    
    # 更新配置
    sed -i "s|MONGO_URI=.*|MONGO_URI=mongodb://kbuser:$MONGO_PASS@localhost:27017/knowledge-base?authSource=knowledge-base|" server/.env
    sed -i "s|NODE_ENV=.*|NODE_ENV=production|" server/.env
    
    if [ ! -z "$DOMAIN" ]; then
        sed -i "s|SITE_URL=.*|SITE_URL=https://$DOMAIN|" server/.env
        sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=https://$DOMAIN|" server/.env
    fi
    
    echo -e "${YELLOW}请编辑 server/.env 文件完成其他配置（JWT_SECRET, SMTP 等）${NC}"
fi

# 9. 安装依赖和构建
echo -e "${GREEN}[9/10] 安装依赖和构建...${NC}"
cd server && npm install
cd .. && npm install
npm run build

# 10. 启动应用
echo -e "${GREEN}[10/10] 启动应用...${NC}"
pm2 delete knowledge-base 2>/dev/null || true
pm2 start server/index.js --name "knowledge-base"
pm2 startup
pm2 save

# 配置防火墙
echo -e "${GREEN}配置防火墙...${NC}"
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

echo ""
echo "========================================="
echo -e "${GREEN}  部署完成！${NC}"
echo "========================================="
echo ""
echo "下一步："
echo "1. 编辑配置文件: nano /var/www/$REPO_NAME/server/.env"
echo "2. 创建管理员: cd /var/www/$REPO_NAME/server && node scripts/createAdminSimple.js"
echo "3. 重启应用: pm2 restart knowledge-base"
echo ""
echo "如果需要配置域名和 SSL："
echo "1. 安装 Nginx: apt install -y nginx"
echo "2. 配置 Nginx: 参考 DEPLOY_FROM_GITHUB.md"
echo "3. 安装 SSL: certbot --nginx -d $DOMAIN"
echo ""
echo "查看应用状态: pm2 status"
echo "查看日志: pm2 logs knowledge-base"
echo ""
