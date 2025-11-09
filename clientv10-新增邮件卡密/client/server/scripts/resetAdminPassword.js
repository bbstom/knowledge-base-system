require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function resetAdminPassword() {
  try {
    // 连接数据库
    const mongoUri = process.env.MONGODB_USER_URI || process.env.USER_MONGO_URI;
    
    if (!mongoUri) {
      console.error('❌ 错误：未找到数据库连接字符串');
      console.error('请检查 server/.env 文件中的 USER_MONGO_URI 或 MONGODB_USER_URI 配置');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ 数据库连接成功');

    // 查找管理员
    const admin = await User.findOne({ role: 'admin' });

    if (!admin) {
      console.log('❌ 未找到管理员账号');
      console.log('请先运行: node server/scripts/createAdmin.js');
      process.exit(1);
    }

    // 新密码
    const newPassword = 'admin123456';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    admin.password = hashedPassword;
    await admin.save();

    console.log('\n✅ 管理员密码重置成功！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 邮箱:', admin.email);
    console.log('👤 用户名:', admin.username);
    console.log('🔑 新密码:', newPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  请登录后立即修改密码！');
    console.log('🌐 登录地址: http://localhost:5173/login');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ 重置密码失败:', error);
    process.exit(1);
  }
}

// 运行脚本
resetAdminPassword();
