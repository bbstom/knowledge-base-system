#!/bin/bash

# 🔧 修复后端数据库连接问题

echo "=================================="
echo "🔧 修复后端数据库连接"
echo "=================================="
echo ""

BACKEND_PATH="/var/www/html/knowledge-base-system/client/server"
ENV_FILE="$BACKEND_PATH/.env"

# 检查路径是否存在
if [ ! -d "$BACKEND_PATH" ]; then
    echo "❌ 错误：后端目录不存在"
    echo "   路径: $BACKEND_PATH"
    exit 1
fi

echo "✅ 找到后端目录: $BACKEND_PATH"
echo ""

# 步骤1：检查.env文件
echo "📋 步骤 1/5: 检查.env配置"
echo ""

if [ -f "$ENV_FILE" ]; then
    echo "✅ .env文件存在"
    echo ""
    echo "当前数据库配置（密码已隐藏）："
    grep -E "MONGODB|DB_" "$ENV_FILE" | sed 's/PASSWORD=.*/PASSWORD=***/' | sed 's/:.*@/:***@/'
else
    echo "❌ .env文件不存在"
    echo "   请先创建: $ENV_FILE"
    exit 1
fi

echo ""
echo "=================================="
echo ""

# 步骤2：检查MongoDB服务
echo "📋 步骤 2/5: 检查MongoDB服务"
echo ""

if systemctl is-active --quiet mongod; then
    echo "✅ MongoDB服务运行中"
else
    echo "❌ MongoDB服务未运行"
    echo ""
    read -p "是否启动MongoDB服务？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        systemctl start mongod
        echo "✅ MongoDB已启动"
    fi
fi

echo ""
echo "=================================="
echo ""

# 步骤3：测试MongoDB连接
echo "📋 步骤 3/5: 测试MongoDB连接"
echo ""

# 从.env读取配置
if grep -q "MONGODB_URI" "$ENV_FILE"; then
    MONGO_URI=$(grep "MONGODB_URI" "$ENV_FILE" | cut -d '=' -f2-)
    echo "使用连接字符串: ${MONGO_URI//:*@/:***@}"
else
    DB_HOST=$(grep "DB_USER_HOST" "$ENV_FILE" | cut -d '=' -f2- || echo "localhost")
    DB_PORT=$(grep "DB_USER_PORT" "$ENV_FILE" | cut -d '=' -f2- || echo "27017")
    DB_NAME=$(grep "DB_USER_NAME" "$ENV_FILE" | cut -d '=' -f2-)
    DB_USER=$(grep "DB_USER_USER" "$ENV_FILE" | cut -d '=' -f2-)
    DB_PASS=$(grep "DB_USER_PASSWORD" "$ENV_FILE" | cut -d '=' -f2-)
    
    echo "数据库配置："
    echo "  主机: $DB_HOST"
    echo "  端口: $DB_PORT"
    echo "  数据库: $DB_NAME"
    echo "  用户: $DB_USER"
    echo "  密码: ***"
fi

echo ""
echo "测试连接..."

# 测试连接（使用mongosh或mongo）
if command -v mongosh &> /dev/null; then
    if [ -n "$MONGO_URI" ]; then
        mongosh "$MONGO_URI" --eval "db.adminCommand('ping')" &> /dev/null
    else
        mongosh -u "$DB_USER" -p "$DB_PASS" --host "$DB_HOST" --port "$DB_PORT" --authenticationDatabase admin --eval "db.adminCommand('ping')" &> /dev/null
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ 数据库连接成功"
    else
        echo "❌ 数据库连接失败"
        echo ""
        echo "可能的原因："
        echo "  1. 用户名或密码错误"
        echo "  2. 用户权限不足"
        echo "  3. 数据库不存在"
        echo ""
        echo "建议操作："
        echo "  1. 修改MongoDB用户密码"
        echo "  2. 更新.env文件中的密码"
        echo "  3. 重启后端服务"
    fi
else
    echo "⚠️  未找到mongosh命令，跳过连接测试"
fi

echo ""
echo "=================================="
echo ""

# 步骤4：查看PM2日志
echo "📋 步骤 4/5: 查看PM2日志"
echo ""

if command -v pm2 &> /dev/null; then
    echo "最近的错误日志："
    echo "---"
    pm2 logs base2 --lines 10 --nostream --err 2>/dev/null || tail -n 10 /root/.pm2/logs/base2-error.log 2>/dev/null || echo "无法读取日志"
    echo "---"
else
    echo "⚠️  未找到PM2"
fi

echo ""
echo "=================================="
echo ""

# 步骤5：提供修复建议
echo "📋 步骤 5/5: 修复建议"
echo ""

cat << 'EOF'
🔧 如何修复数据库连接问题：

1️⃣ 修改MongoDB用户密码：
   mongosh admin -u admin -p
   use admin
   db.changeUserPassword("用户名", "新密码")
   exit

2️⃣ 更新.env文件：
   nano /var/www/html/knowledge-base-system/client/server/.env
   
   修改为：
   MONGODB_URI=mongodb://用户名:新密码@localhost:27017/数据库名
   
   或：
   DB_USER_PASSWORD=新密码

3️⃣ 重启后端服务：
   cd /var/www/html/knowledge-base-system/client/server
   pm2 restart base2
   pm2 logs base2

4️⃣ 验证连接：
   pm2 logs base2 --lines 20
   
   应该看到：
   ✅ 用户数据库连接成功
   ✅ 查询数据库 1 连接成功

EOF

echo ""
echo "=================================="
echo "✅ 诊断完成"
echo "=================================="
