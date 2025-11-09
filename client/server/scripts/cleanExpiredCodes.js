// 清理过期的验证码
require('dotenv').config();
const mongoose = require('mongoose');
const { userConnection } = require('../config/database');

async function cleanExpiredCodes() {
  try {
    console.log('🧹 开始清理过期验证码...\n');

    // 等待数据库连接
    await new Promise(resolve => setTimeout(resolve, 2000));

    const VerificationCode = require('../models/VerificationCode');

    // 查找所有验证码
    const allCodes = await VerificationCode.find({});
    console.log(`📊 数据库中共有 ${allCodes.length} 条验证码记录\n`);

    // 查找过期的验证码
    const now = new Date();
    const expiredCodes = await VerificationCode.find({
      expiresAt: { $lt: now }
    });

    console.log(`⏰ 过期的验证码: ${expiredCodes.length} 条`);

    if (expiredCodes.length > 0) {
      // 删除过期的验证码
      const result = await VerificationCode.deleteMany({
        expiresAt: { $lt: now }
      });
      console.log(`✅ 已删除 ${result.deletedCount} 条过期验证码\n`);
    }

    // 查找已使用的验证码
    const usedCodes = await VerificationCode.find({ used: true });
    console.log(`✓ 已使用的验证码: ${usedCodes.length} 条`);

    if (usedCodes.length > 0) {
      // 删除已使用的验证码
      const result = await VerificationCode.deleteMany({ used: true });
      console.log(`✅ 已删除 ${result.deletedCount} 条已使用的验证码\n`);
    }

    // 显示剩余的验证码
    const remainingCodes = await VerificationCode.find({});
    console.log(`📋 剩余有效验证码: ${remainingCodes.length} 条\n`);

    if (remainingCodes.length > 0) {
      console.log('详细信息:');
      remainingCodes.forEach((code, index) => {
        const timeLeft = Math.round((code.expiresAt - now) / 1000 / 60);
        console.log(`  ${index + 1}. 邮箱: ${code.email}`);
        console.log(`     验证码: ${code.code}`);
        console.log(`     类型: ${code.type}`);
        console.log(`     剩余时间: ${timeLeft} 分钟`);
        console.log(`     尝试次数: ${code.attempts}`);
        console.log('');
      });
    }

    console.log('✅ 清理完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 清理失败:', error);
    process.exit(1);
  }
}

cleanExpiredCodes();
