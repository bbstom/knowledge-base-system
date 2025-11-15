const Advertisement = require('./server/models/Advertisement');
const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

async function testCarouselAd() {
  try {
    console.log('连接数据库...');
    await mongoose.connect(process.env.USER_MONGO_URI || process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    console.log('测试创建轮播广告...');
    
    const testAd = new Advertisement({
      title: '测试轮播广告',
      content: '',  // 空内容
      type: 'carousel',
      carouselImages: [
        'https://picsum.photos/1200/400?random=1',
        'https://picsum.photos/1200/400?random=2',
        'https://picsum.photos/1200/400?random=3'
      ],
      carouselLinks: [
        'https://example.com/1',
        'https://example.com/2',
        'https://example.com/3'
      ],
      carouselInterval: 5000,
      carouselHeight: '400px',
      showControls: true,
      showIndicators: true,
      position: 'search',
      isActive: true,
      order: 0
    });

    console.log('保存广告...');
    await testAd.save();
    console.log('✅ 轮播广告创建成功！');
    console.log('广告ID:', testAd._id);
    console.log('广告类型:', testAd.type);
    console.log('图片数量:', testAd.carouselImages.length);
    
    // 清理测试数据
    console.log('\n清理测试数据...');
    await Advertisement.findByIdAndDelete(testAd._id);
    console.log('✅ 测试数据已清理');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error('详细信息:', error);
    process.exit(1);
  }
}

testCarouselAd();
