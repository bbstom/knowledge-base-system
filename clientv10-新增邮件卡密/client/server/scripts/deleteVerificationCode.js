// 删除指定邮箱的验证码
require('dotenv').config();
const mongoose = require('mongoose');
const { userConnection } = require('../config/database');

async function deleteCode() {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.log('❌ 请提供邮箱地址');
      console.log('用法: node scripts/deleteVerificationCode.js email@example.com');
      process.exit(1);
    }

    console.log(`🗑️  删除邮箱 ${email} 的验证码...\n`);

    // 等待数据库连接
    await new Promise(resolve => setTimeout(resolve, 2000));

    const VerificationCode = require('../models/VerificationCode');

    const result = await VerificationCode.deleteMany({
      email: email.toLowerCase()
    });

    console.log(`✅ 已删除 ${result.deletedCount} 条验证码记录`);
    process.exit(0);
  } catch (error) {
    console.error('❌ 删除失败:', error);
    process.exit(1);
  }
}

deleteCode();
