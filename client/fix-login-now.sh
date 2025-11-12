#!/bin/bash

# 修复登录问题 - 一键执行脚本

echo "========================================"
echo "  修复登录问题"
echo "========================================"
echo ""

cd /var/www/html/knowledge-base-system/client

echo "[1/5] 创建清空脚本..."
cat > server/scripts/clearDbConfig.cjs << 'EOF'
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function clearConfig() {
  try {
    const uri = process.env.USER_MONGO_URI;
    console.log('🔄 连接数据库...');
    await mongoose.connect(uri);
    
    const SystemConfig = mongoose.model('SystemConfig', new mongoose.Schema({}, { strict: false }));
    
    console.log('🗑️  删除数据库配置...');
    const result = await SystemConfig.deleteMany({ 
      key: { $in: ['userDatabase', 'queryDatabases'] } 
    });
    
    console.log(`✅ 已删除 ${result.deletedCount} 条配置`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ 失败:', error.message);
    process.exit(1);
  }
}

clearConfig();
EOF

echo "[2/5] 执行清空..."
node server/scripts/clearDbConfig.cjs

if [ $? -ne 0 ]; then
    echo "❌ 清空失败"
    exit 1
fi

echo ""
echo "[3/5] 删除临时脚本..."
rm server/scripts/clearDbConfig.cjs

echo "[4/5] 重启PM2..."
pm2 restart base2

echo "[5/5] 等待服务启动..."
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
echo "现在可以在前端测试登录了"
echo ""
