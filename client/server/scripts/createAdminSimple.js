/**
 * 创建管理员账户（简化版）
 * 直接连接数据库，不依赖 DatabaseManager
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function createAdmin() {
  console.log('\n' + '='.repeat(60));
  console.log('🔧 创建管理员账户');
  console.log('='.repeat(60));

  try {
    // 直接连接数据库
    const uri = process.env.USER_MONGO_URI;
    console.log('\n🔄 连接数据库...');
    await mongoose.connect(uri);
    console.log('✅ 数据库连接成功');

    // 定义 User Schema
    const userSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['user', 'admin'], default: 'user' },
      points: { type: Number, default: 0 },
      balance: { type: Number, default: 0 },
      vipLevel: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now }
    });

    const User = mongoose.model('User', userSchema);

    // 检查是否已存在管理员
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('\n⚠️  管理员账户已存在');
      console.log('邮箱:', existingAdmin.email);
      console.log('用户名:', existingAdmin.username);
      console.log('角色:', existingAdmin.role);
      
      // 更新密码
      console.log('\n🔄 更新管理员密码...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('✅ 密码已更新为: admin123');
    } else {
      // 创建新管理员
      console.log('\n🔄 创建新管理员账户...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        points: 10000,
        balance: 10000,
        vipLevel: 3
      });

      await admin.save();
      console.log('✅ 管理员账户创建成功');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 完成');
    console.log('='.repeat(60));
    console.log('\n登录信息:');
    console.log('  邮箱: admin@example.com');
    console.log('  密码: admin123');
    console.log('\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

createAdmin();
