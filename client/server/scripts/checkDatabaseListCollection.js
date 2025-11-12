/**
 * 检查 databaselist 集合中的数据
 */

require('dotenv').config({ path: './server/.env' });
const databaseManager = require('../config/databaseManager');

async function checkDatabaseListCollection() {
  try {
    console.log('🔍 检查 databaselist 集合...\n');

    // 初始化数据库连接
    await databaseManager.initializeFromEnv();
    console.log('✅ 数据库连接已初始化\n');

    // 获取用户数据库连接
    const userConnection = databaseManager.getUserConnection();

    // 检查 databaselist 集合
    const collections = await userConnection.db.listCollections().toArray();
    const hasDbList = collections.find(col => col.name === 'databaselist');

    if (hasDbList) {
      console.log('✅ 找到 databaselist 集合\n');
      
      // 查询数据
      const dbList = await userConnection.db.collection('databaselist').find({}).toArray();
      console.log(`📊 databaselist 集合中有 ${dbList.length} 条记录\n`);

      if (dbList.length > 0) {
        console.log('前 5 条记录:');
        dbList.slice(0, 5).forEach((db, index) => {
          console.log(`\n${index + 1}. ${db.name || db.databaseName || 'Unknown'}`);
          console.log(`   ID: ${db._id}`);
          console.log(`   完整数据:`, JSON.stringify(db, null, 2));
        });
      }
    } else {
      console.log('❌ 未找到 databaselist 集合');
      console.log('\n📋 用户数据库中的所有集合:');
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    }

    console.log('\n✅ 检查完成！');

  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await databaseManager.closeAll();
    console.log('\n已断开数据库连接');
  }
}

checkDatabaseListCollection();
