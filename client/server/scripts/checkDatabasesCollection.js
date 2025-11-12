/**
 * 检查 databases 集合中的数据
 */

require('dotenv').config({ path: './server/.env' });
const databaseManager = require('../config/databaseManager');
const Database = require('../models/Database');

async function checkDatabasesCollection() {
  try {
    console.log('🔍 检查 databases 集合...\n');

    // 初始化数据库连接
    await databaseManager.initializeFromEnv();
    console.log('✅ 数据库连接已初始化\n');

    // 获取集合名
    const collectionName = Database.collection.name;
    console.log(`📦 Database 模型使用的集合名: ${collectionName}\n`);

    // 查询数据
    const databases = await Database.find({}).lean();
    console.log(`找到 ${databases.length} 条记录\n`);

    if (databases.length > 0) {
      console.log('前 5 条记录:');
      databases.slice(0, 5).forEach((db, index) => {
        console.log(`\n${index + 1}. ${db.name}`);
        console.log(`   ID: ${db._id}`);
        console.log(`   描述: ${db.description || '无'}`);
        console.log(`   支持类型: ${db.supportedTypes?.join(', ') || '无'}`);
        console.log(`   记录数: ${db.recordCount || 0}`);
        console.log(`   状态: ${db.isActive ? '启用' : '禁用'}`);
      });
    } else {
      console.log('⚠️  databases 集合为空！');
      
      // 检查是否有其他可能的集合名
      const userConnection = databaseManager.getUserConnection();
      const collections = await userConnection.db.listCollections().toArray();
      
      console.log('\n📋 用户数据库中的所有集合:');
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
      
      // 检查是否有 database 或 Databases 等变体
      const possibleNames = ['database', 'Database', 'Databases', 'DATABASES'];
      for (const name of possibleNames) {
        const found = collections.find(col => col.name === name);
        if (found) {
          console.log(`\n⚠️  发现可能的集合: ${name}`);
          const count = await userConnection.db.collection(name).countDocuments();
          console.log(`   该集合有 ${count} 条记录`);
        }
      }
    }

    console.log('\n✅ 检查完成！');

  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await databaseManager.closeAll();
    console.log('\n已断开数据库连接');
  }
}

checkDatabasesCollection();
