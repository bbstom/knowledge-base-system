require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function listAdmins() {
  try {
    // 连接数据库
    const mongoUri = process.env.MONGODB_USER_URI || process.env.USER_MONGO_URI;
    
    if (!mongoUri) {
      console.error('❌ 错误：未找到数据库连接字符串');
      console.error('请检查 server/.env 文件中的 USER_MONGO_URI 或 MONGODB_USER_URI 配置');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ 数据库连接成功\n');

    // 查找所有管理员
    const admins = await User.find({ role: 'admin' });

    if (admins.length === 0) {
      console.log('❌ 未找到管理员账号');
      console.log('请运行: node server/scripts/createAdmin.js');
      process.exit(0);
    }

    console.log(`📋 找到 ${admins.length} 个管理员账号:\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    admins.forEach((admin, index) => {
      console.log(`\n${index + 1}. 管理员信息:`);
      console.log('   ID:', admin._id);
      console.log('   用户名:', admin.username);
      console.log('   邮箱:', admin.email);
      console.log('   角色:', admin.role);
      console.log('   积分:', admin.points);
      console.log('   余额:', admin.balance);
      console.log('   VIP:', admin.isVip ? '是' : '否');
      console.log('   推荐码:', admin.referralCode);
      console.log('   创建时间:', admin.createdAt);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ 查询失败:', error);
    process.exit(1);
  }
}

// 运行脚本
listAdmins();
