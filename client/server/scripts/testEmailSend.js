const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const emailService = require('../services/emailService');

async function testEmailSend() {
  try {
    console.log('连接到数据库...');
    const mongoUri = process.env.USER_MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('数据库连接成功\n');

    console.log('=== 测试发送验证码邮件 ===');
    console.log('收件人: kail.say.one@gmail.com');
    console.log('验证码: 123456\n');

    const result = await emailService.sendVerificationCode('kail.say.one@gmail.com', '123456');
    
    if (result.success) {
      console.log('✓ 邮件发送成功');
      console.log('Message ID:', result.messageId);
    } else {
      console.log('✗ 邮件发送失败');
      console.log('错误:', result.error);
    }

    process.exit(0);
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

testEmailSend();
