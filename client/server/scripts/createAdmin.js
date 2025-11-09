require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// 生成推荐码
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function createAdmin() {
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

    // 管理员信息
    const adminData = {
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123456', // 默认密码，请登录后修改
      role: 'admin',
      points: 10000,
      balance: 10000,
      isVip: true,
      vipExpireAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年后过期
      referralCode: generateReferralCode()
    };

    // 检查管理员是否已存在
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: adminData.email },
        { username: adminData.username },
        { role: 'admin' }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️  管理员账号已存在:');
      console.log('   用户名:', existingAdmin.username);
      console.log('   邮箱:', existingAdmin.email);
      console.log('   角色:', existingAdmin.role);
      
      // 如果管理员没有推荐码，更新一个
      if (!existingAdmin.referralCode) {
        existingAdmin.referralCode = generateReferralCode();
        await existingAdmin.save();
        console.log('   ✅ 已为管理员生成推荐码:', existingAdmin.referralCode);
      }
      
      console.log('\n如果需要重置密码，请使用以下命令:');
      console.log('node scripts/resetAdminPassword.js');
      
      process.exit(0);
    }

    // 检查是否有其他用户的referralCode为null，如果有则更新
    const usersWithoutCode = await User.find({ referralCode: null });
    if (usersWithoutCode.length > 0) {
      console.log(`⚠️  发现 ${usersWithoutCode.length} 个用户没有推荐码，正在更新...`);
      for (const user of usersWithoutCode) {
        user.referralCode = generateReferralCode();
        await user.save();
      }
      console.log('✅ 已为所有用户生成推荐码');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // 创建管理员
    const admin = new User({
      ...adminData,
      password: hashedPassword
    });

    await admin.save();

    console.log('\n✅ 管理员账号创建成功！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 邮箱:', adminData.email);
    console.log('👤 用户名:', adminData.username);
    console.log('🔑 密码:', adminData.password);
    console.log('👑 角色: 管理员');
    console.log('💰 初始积分:', adminData.points);
    console.log('💵 初始余额:', adminData.balance);
    console.log('⭐ VIP状态: 是');
    console.log('🎫 推荐码:', adminData.referralCode);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  请登录后立即修改密码！');
    console.log('🌐 登录地址: http://localhost:5173/login');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ 创建管理员失败:', error);
    process.exit(1);
  }
}

// 运行脚本
createAdmin();
