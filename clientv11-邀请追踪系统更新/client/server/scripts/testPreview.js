const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const EmailTemplate = require('../models/EmailTemplate');

async function testPreview() {
  try {
    console.log('连接到数据库...');
    const mongoUri = process.env.USER_MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('数据库连接成功\n');

    // 获取模板
    const template = await EmailTemplate.findOne({ name: 'verification_code' });
    
    if (!template) {
      console.log('模板不存在');
      process.exit(1);
    }

    console.log('=== 模板信息 ===');
    console.log('名称:', template.name);
    console.log('主题:', template.subject);
    console.log('变量:', JSON.stringify(template.variables, null, 2));
    
    // 测试渲染
    console.log('\n=== 测试渲染 ===');
    const testData = {
      code: '123456',
      username: '测试用户',
      email: 'test@example.com',
      siteName: '信息查询系统',
      siteUrl: 'http://localhost:5173',
      logoUrl: 'http://localhost:5173/logo.png',
      expireMinutes: '10',
      year: '2025'
    };
    
    console.log('测试数据:', JSON.stringify(testData, null, 2));
    
    const rendered = template.render(testData);
    
    console.log('\n=== 渲染结果 ===');
    console.log('HTML 长度:', rendered.html.length);
    console.log('主题:', rendered.subject);
    
    // 检查是否还有未替换的变量
    const unreplacedVars = rendered.html.match(/\{\{[^}]+\}\}/g);
    if (unreplacedVars) {
      console.log('\n未替换的变量:', unreplacedVars);
    } else {
      console.log('\n✓ 所有变量都已替换');
    }
    
    // 检查特定内容
    if (rendered.html.includes('测试用户')) {
      console.log('✓ username 已替换');
    } else {
      console.log('✗ username 未替换');
    }
    
    if (rendered.html.includes('test@example.com')) {
      console.log('✓ email 已替换');
    } else {
      console.log('✗ email 未替换');
    }
    
    if (rendered.html.includes('123456')) {
      console.log('✓ code 已替换');
    } else {
      console.log('✗ code 未替换');
    }

    process.exit(0);
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

testPreview();
