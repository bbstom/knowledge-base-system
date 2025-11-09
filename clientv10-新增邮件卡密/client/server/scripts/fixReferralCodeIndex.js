require('dotenv').config();
const mongoose = require('mongoose');
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

async function fixReferralCodeIndex() {
  try {
    // 连接数据库
    const mongoUri = process.env.MONGODB_USER_URI || process.env.USER_MONGO_URI;
    
    if (!mongoUri) {
      console.error('❌ 错误：未找到数据库连接字符串');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ 数据库连接成功\n');

    // 1. 为所有没有推荐码的用户生成推荐码
    const usersWithoutCode = await User.find({ 
      $or: [
        { referralCode: null },
        { referralCode: { $exists: false } }
      ]
    });

    if (usersWithoutCode.length > 0) {
      console.log(`📝 发现 ${usersWithoutCode.length} 个用户没有推荐码`);
      console.log('正在为这些用户生成推荐码...\n');

      for (const user of usersWithoutCode) {
        const newCode = generateReferralCode();
        user.referralCode = newCode;
        await user.save();
        console.log(`✅ 用户 ${user.username} (${user.email}) - 推荐码: ${newCode}`);
      }

      console.log(`\n✅ 已为 ${usersWithoutCode.length} 个用户生成推荐码`);
    } else {
      console.log('✅ 所有用户都已有推荐码');
    }

    // 2. 删除旧的索引
    console.log('\n📝 检查并更新索引...');
    try {
      await User.collection.dropIndex('referralCode_1');
      console.log('✅ 已删除旧的 referralCode 索引');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  索引不存在，跳过删除');
      } else {
        console.log('⚠️  删除索引时出错:', error.message);
      }
    }

    // 3. 创建新的稀疏索引
    try {
      await User.collection.createIndex(
        { referralCode: 1 }, 
        { unique: true, sparse: true }
      );
      console.log('✅ 已创建新的稀疏索引（允许多个null值）');
    } catch (error) {
      console.log('⚠️  创建索引时出错:', error.message);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 修复完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n现在可以运行创建管理员脚本了:');
    console.log('node scripts/createAdmin.js\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ 修复失败:', error);
    process.exit(1);
  }
}

// 运行脚本
fixReferralCodeIndex();
