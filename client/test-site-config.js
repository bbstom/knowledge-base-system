import SiteConfig from './server/models/SiteConfig.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

async function testSiteConfig() {
  try {
    console.log('连接数据库...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    console.log('获取网站配置...');
    const config = await SiteConfig.getConfig();
    
    console.log('📋 当前网站配置:');
    console.log('=====================================');
    console.log('网站名称:', config.siteName);
    console.log('网站描述:', config.siteDescription);
    console.log('Logo URL:', config.logoUrl || '(未设置)');
    console.log('Favicon URL:', config.faviconUrl || '(未设置)');
    console.log('底部文字:', config.footerText);
    console.log('联系邮箱:', config.contactEmail);
    console.log('联系电话:', config.contactPhone);
    console.log('联系地址:', config.contactAddress);
    console.log('社交媒体:', JSON.stringify(config.socialLinks, null, 2));
    console.log('=====================================\n');

    console.log('✅ 测试完成');
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

testSiteConfig();
