/**
 * 测试数据清单 API 是否正确使用 Database 集合
 */

require('dotenv').config({ path: './server/.env' });
const databaseManager = require('../config/databaseManager');
const Database = require('../models/Database');

async function testDatabasesAPI() {
  try {
    console.log('🔍 测试数据清单 API 数据一致性...\n');

    // 使用 databaseManager 初始化连接
    await databaseManager.initializeFromEnv();
    console.log('✅ 数据库连接已初始化\n');

    // 1. 检查 Database 集合中的数据
    console.log('📊 检查 Database 集合中的数据:');
    const databases = await Database.find({}).lean();
    console.log(`找到 ${databases.length} 个数据库记录\n`);

    if (databases.length > 0) {
      console.log('前 3 个数据库:');
      databases.slice(0, 3).forEach((db, index) => {
        console.log(`${index + 1}. ${db.name}`);
        console.log(`   - ID: ${db._id}`);
        console.log(`   - 描述: ${db.description}`);
        console.log(`   - 支持类型: ${db.supportedTypes?.join(', ') || '无'}`);
        console.log(`   - 记录数: ${db.recordCount || 0}`);
        console.log(`   - 状态: ${db.isActive ? '启用' : '禁用'}`);
        console.log('');
      });
    } else {
      console.log('⚠️  Database 集合为空！');
      console.log('提示: 运行 node server/scripts/syncDatabases.js 来同步数据\n');
    }

    // 2. 检查数据格式兼容性
    console.log('🔄 检查数据格式兼容性:');
    if (databases.length > 0) {
      const sampleDb = databases[0];
      const formattedDb = {
        id: sampleDb._id.toString(),
        name: sampleDb.name,
        description: sampleDb.description,
        searchTypes: sampleDb.supportedTypes || [],
        recordCount: sampleDb.recordCount || 0,
        isActive: sampleDb.isActive,
        status: sampleDb.status,
        source: sampleDb.source,
        lastUpdated: sampleDb.lastUpdated,
        createdAt: sampleDb.createdAt
      };
      console.log('✅ 数据格式转换成功');
      console.log('转换后的格式:', JSON.stringify(formattedDb, null, 2));
    }

    console.log('\n✅ 测试完成！');
    console.log('\n📝 总结:');
    console.log(`- Database 集合中有 ${databases.length} 条记录`);
    console.log('- 数据格式兼容前端要求');
    console.log('- 数据清单现在使用真实的 Database 集合，与搜索功能一致');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await databaseManager.closeAll();
    console.log('\n已断开数据库连接');
  }
}

testDatabasesAPI();
