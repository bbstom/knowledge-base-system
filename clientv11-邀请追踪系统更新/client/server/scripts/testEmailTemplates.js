const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const EmailTemplate = require('../models/EmailTemplate');

async function testEmailTemplates() {
  try {
    console.log('连接到数据库...');
    const mongoUri = process.env.USER_MONGO_URI || process.env.MONGODB_URI;
    console.log('MongoDB URI:', mongoUri ? '已配置' : '未配置');
    await mongoose.connect(mongoUri);
    console.log('数据库连接成功\n');

    // 1. 检查现有模板
    console.log('=== 检查现有模板 ===');
    const templates = await EmailTemplate.find();
    console.log(`找到 ${templates.length} 个模板`);
    
    if (templates.length > 0) {
      templates.forEach(t => {
        console.log(`- ${t.name}: ${t.subject} (${t.language}, active: ${t.isActive})`);
      });
    } else {
      console.log('数据库中没有模板');
    }

    // 2. 初始化默认模板
    console.log('\n=== 初始化默认模板 ===');
    const defaultTemplates = EmailTemplate.getDefaultTemplates();
    console.log(`默认模板数量: ${defaultTemplates.length}`);
    
    for (const templateData of defaultTemplates) {
      const existing = await EmailTemplate.findOne({ name: templateData.name });
      if (!existing) {
        const template = new EmailTemplate(templateData);
        await template.save();
        console.log(`✓ 创建模板: ${templateData.name}`);
      } else {
        console.log(`- 模板已存在: ${templateData.name}`);
      }
    }

    // 3. 再次检查
    console.log('\n=== 初始化后的模板列表 ===');
    const updatedTemplates = await EmailTemplate.find().sort({ name: 1 });
    console.log(`总共 ${updatedTemplates.length} 个模板:`);
    updatedTemplates.forEach(t => {
      console.log(`\n模板: ${t.name}`);
      console.log(`  主题: ${t.subject}`);
      console.log(`  语言: ${t.language}`);
      console.log(`  激活: ${t.isActive}`);
      console.log(`  变量: ${t.variables.map(v => v.name).join(', ')}`);
    });

    console.log('\n✓ 测试完成');
    process.exit(0);
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

testEmailTemplates();
