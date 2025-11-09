require('dotenv').config();
const Advertisement = require('../models/Advertisement');

async function addTestAdvertisements() {
  try {
    console.log('开始添加测试广告...');

    // 清除现有广告
    await Advertisement.deleteMany({});
    console.log('已清除现有广告');

    // 添加测试广告
    const advertisements = [
      {
        title: '欢迎使用信息搜索平台',
        content: `
          <div class="text-center">
            <h3 class="text-xl font-bold text-blue-600 mb-2">🎉 新用户福利</h3>
            <p class="text-gray-700">注册即送100积分，立即开始搜索！</p>
          </div>
        `,
        position: 'search',
        isActive: true,
        order: 1
      },
      {
        title: 'VIP会员优惠',
        content: `
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-purple-600 mb-1">💎 升级VIP会员</h3>
              <p class="text-gray-700">享受更多搜索次数和专属服务</p>
            </div>
            <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
              立即升级
            </button>
          </div>
        `,
        position: 'search',
        isActive: true,
        order: 2
      },
      {
        title: '推荐有奖',
        content: `
          <div class="bg-gradient-to-r from-orange-100 to-red-100 p-4 rounded-lg">
            <h3 class="text-lg font-bold text-orange-600 mb-2">🎁 推荐好友得奖励</h3>
            <p class="text-gray-700">邀请好友注册，双方均可获得积分奖励！</p>
          </div>
        `,
        position: 'search',
        isActive: true,
        order: 3
      }
    ];

    for (const ad of advertisements) {
      const newAd = new Advertisement(ad);
      await newAd.save();
      console.log(`✓ 已添加广告: ${ad.title}`);
    }

    console.log('\n测试广告添加完成！');
    console.log(`共添加 ${advertisements.length} 条广告`);
    
    process.exit(0);
  } catch (error) {
    console.error('添加测试广告失败:', error);
    process.exit(1);
  }
}

// 连接数据库
require('../config/database');

// 等待数据库连接
setTimeout(() => {
  addTestAdvertisements();
}, 2000);
