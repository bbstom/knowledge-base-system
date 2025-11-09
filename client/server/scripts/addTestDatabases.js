require('dotenv').config();
const mongoose = require('mongoose');
const Database = require('../models/Database');

// 连接数据库
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      authSource: 'admin'
    });
    console.log('✅ 连接到MongoDB成功');
  } catch (error) {
    console.error('❌ 连接到MongoDB失败:', error);
    process.exit(1);
  }
};

// 添加测试数据库
const addTestDatabases = async () => {
  try {
    // 检查是否已有数据
    const existingCount = await Database.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  已存在 ${existingCount} 个数据库，跳过添加`);
      return;
    }

    const testDatabases = [
      {
        name: '身份证信息库',
        description: '包含全国身份证信息数据，支持姓名、身份证号查询，数据实时更新，准确率高达99.9%',
        price: 5,
        isActive: true,
        recordCount: 1500000,
        supportedTypes: ['idcard', 'name'],
        lastUpdated: new Date(),
        config: {
          timeout: 30000
        },
        stats: {
          totalSearches: 0,
          successRate: 0,
          avgResponseTime: 0
        }
      },
      {
        name: '手机号信息库',
        description: '手机号码归属地和运营商信息，实时更新，覆盖全国所有运营商',
        price: 3,
        isActive: true,
        recordCount: 2800000,
        supportedTypes: ['phone'],
        lastUpdated: new Date(),
        config: {
          timeout: 30000
        },
        stats: {
          totalSearches: 0,
          successRate: 0,
          avgResponseTime: 0
        }
      },
      {
        name: 'QQ号信息库',
        description: 'QQ号码相关信息查询，包括注册时间、等级等信息',
        price: 4,
        isActive: true,
        recordCount: 1200000,
        supportedTypes: ['qq'],
        lastUpdated: new Date(),
        config: {
          timeout: 30000
        },
        stats: {
          totalSearches: 0,
          successRate: 0,
          avgResponseTime: 0
        }
      },
      {
        name: '微信号信息库',
        description: '微信号相关信息查询，支持微信号、手机号关联查询',
        price: 6,
        isActive: true,
        recordCount: 980000,
        supportedTypes: ['wechat', 'phone'],
        lastUpdated: new Date(),
        config: {
          timeout: 30000
        },
        stats: {
          totalSearches: 0,
          successRate: 0,
          avgResponseTime: 0
        }
      },
      {
        name: '邮箱信息库',
        description: '邮箱地址相关信息查询，支持多种邮箱服务商',
        price: 3,
        isActive: true,
        recordCount: 1600000,
        supportedTypes: ['email'],
        lastUpdated: new Date(),
        config: {
          timeout: 30000
        },
        stats: {
          totalSearches: 0,
          successRate: 0,
          avgResponseTime: 0
        }
      }
    ];

    // 批量插入
    const result = await Database.insertMany(testDatabases);
    console.log(`✅ 成功添加 ${result.length} 个测试数据库`);
    
    // 显示添加的数据库
    result.forEach(db => {
      console.log(`   - ${db.name} (价格: ¥${db.price}, 记录: ${db.recordCount.toLocaleString()})`);
    });

  } catch (error) {
    console.error('❌ 添加测试数据库失败:', error);
  }
};

// 主函数
const main = async () => {
  await connectDB();
  await addTestDatabases();
  
  console.log('\n✅ 完成！');
  process.exit(0);
};

main();
