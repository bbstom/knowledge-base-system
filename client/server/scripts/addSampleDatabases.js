/**
 * 添加示例数据库记录到 databases 集合
 */

require('dotenv').config({ path: './server/.env' });
const databaseManager = require('../config/databaseManager');
const Database = require('../models/Database');

async function addSampleDatabases() {
  try {
    console.log('🚀 开始添加示例数据库记录...\n');

    // 初始化数据库连接
    await databaseManager.initializeFromEnv();
    console.log('✅ 数据库连接已初始化\n');

    // 检查是否已有数据
    const existingCount = await Database.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  databases 集合已有 ${existingCount} 条记录`);
      console.log('是否要继续添加示例数据？这不会删除现有数据。\n');
    }

    // 示例数据
    const sampleDatabases = [
      {
        name: '示例数据库1',
        description: '这是一个示例数据库，包含手机号和身份证查询',
        source: '官方数据',
        isActive: true,
        status: 'normal',
        recordCount: 1000000,
        supportedTypes: ['phone', 'idcard'],
        lastUpdated: new Date()
      },
      {
        name: '示例数据库2',
        description: '这是另一个示例数据库，包含姓名和QQ查询',
        source: '官方数据',
        isActive: true,
        status: 'normal',
        recordCount: 500000,
        supportedTypes: ['name', 'qq'],
        lastUpdated: new Date()
      },
      {
        name: '示例数据库3',
        description: '综合数据库，支持多种查询类型',
        source: '第三方数据',
        isActive: false,
        status: 'maintenance',
        recordCount: 2000000,
        supportedTypes: ['phone', 'idcard', 'name', 'email'],
        lastUpdated: new Date()
      }
    ];

    let added = 0;
    let skipped = 0;

    for (const dbData of sampleDatabases) {
      // 检查是否已存在同名数据库
      const existing = await Database.findOne({ name: dbData.name });
      
      if (existing) {
        console.log(`⏭️  跳过: ${dbData.name} (已存在)`);
        skipped++;
      } else {
        const database = new Database(dbData);
        await database.save();
        console.log(`✅ 添加: ${dbData.name}`);
        added++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 完成！');
    console.log('='.repeat(60));
    console.log(`📊 统计:`);
    console.log(`   - 新添加: ${added} 条`);
    console.log(`   - 已跳过: ${skipped} 条`);

    // 验证结果
    const totalDatabases = await Database.countDocuments();
    console.log(`\n✅ databases 集合现在有 ${totalDatabases} 条记录`);

    // 显示所有记录
    const allDatabases = await Database.find({}).lean();
    console.log('\n📋 当前所有数据库记录:');
    allDatabases.forEach((db, index) => {
      console.log(`\n${index + 1}. ${db.name}`);
      console.log(`   ID: ${db._id}`);
      console.log(`   描述: ${db.description}`);
      console.log(`   支持类型: ${db.supportedTypes.join(', ')}`);
      console.log(`   记录数: ${db.recordCount}`);
      console.log(`   状态: ${db.isActive ? '启用' : '禁用'} (${db.status})`);
    });

  } catch (error) {
    console.error('❌ 添加失败:', error);
  } finally {
    await databaseManager.closeAll();
    console.log('\n已断开数据库连接');
  }
}

addSampleDatabases();
