const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const EmailTemplate = require('../models/EmailTemplate');

async function testAPI() {
  try {
    console.log('连接到数据库...');
    const mongoUri = process.env.USER_MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('数据库连接成功\n');

    // 模拟 API 调用
    console.log('=== 模拟 GET /api/email-templates ===');
    const templates = await EmailTemplate.find().sort({ name: 1 });
    
    const apiResponse = {
      success: true,
      data: templates
    };
    
    console.log('API 响应:');
    console.log(JSON.stringify(apiResponse, null, 2));
    
    console.log('\n=== 数据验证 ===');
    console.log('data 是数组?', Array.isArray(apiResponse.data));
    console.log('模板数量:', apiResponse.data.length);
    
    if (apiResponse.data.length > 0) {
      console.log('\n第一个模板:');
      console.log(JSON.stringify(apiResponse.data[0], null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

testAPI();
