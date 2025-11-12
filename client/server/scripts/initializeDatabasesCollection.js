/**
 * 初始化 databases 集合
 * 从查询数据库中扫描所有集合并创建对应的 Database 记录
 */

require('dotenv').config({ path: './server/.env' });
const databaseManager = require('../config/databaseManager');
const Database = require('../models/Database');

async function initializeDatabasesCollection() {
  try {
    console.log('🚀 开始初始化 databases 集合...\n');

    // 初始化数据库连接
    await databaseManager.initializeFromEnv();
    console.log('✅ 数据库连接已初始化\n');

    // 获取所有查询数据库连接
    const queryConnections = databaseManager.getAllQueryConnections();
    console.log(`📊 找到 ${queryConnections.length} 个查询数据库\n`);

    let totalCreated = 0;
    let totalUpdated = 0;

    for (const { id, name: dbName, connection } of queryConnections) {
      console.log(`\n🔍 扫描查询数据库: ${dbName}`);
      
      try {
        // 获取所有集合
        const collections = await connection.db.listCollections().toArray();
        console.log(`   找到 ${collections.length} 个集合`);

        // 过滤掉系统集合
        const dataCollections = collections.filter(col => 
          !col.name.startsWith('system.')
        );

        console.log(`   其中 ${dataCollections.length} 个是数据集合\n`);

        for (const col of dataCollections) {
          const collectionName = col.name;
          
          // 检查是否已存在
          let database = await Database.findOne({ name: collectionName });

          if (database) {
            // 更新记录数
            const count = await connection.db.collection(collectionName).countDocuments();
            database.recordCount = count;
            database.lastUpdated = new Date();
            await database.save();
            
            console.log(`   ✓ 更新: ${collectionName} (${count} 条记录)`);
            totalUpdated++;
          } else {
            // 创建新记录
            const count = await connection.db.collection(collectionName).countDocuments();
            
            // 尝试从集合中获取一条数据来判断支持的搜索类型
            const sampleDoc = await connection.db.collection(collectionName).findOne();
            const supportedTypes = [];
            
            if (sampleDoc) {
              // 根据字段判断支持的搜索类型
              if (sampleDoc.phone || sampleDoc.手机 || sampleDoc.电话) supportedTypes.push('phone');
              if (sampleDoc.idcard || sampleDoc.身份证 || sampleDoc.证件号) supportedTypes.push('idcard');
              if (sampleDoc.name || sampleDoc.姓名) supportedTypes.push('name');
              if (sampleDoc.qq || sampleDoc.QQ) supportedTypes.push('qq');
              if (sampleDoc.weibo || sampleDoc.微博) supportedTypes.push('weibo');
              if (sampleDoc.wechat || sampleDoc.微信) supportedTypes.push('wechat');
              if (sampleDoc.email || sampleDoc.邮箱) supportedTypes.push('email');
              if (sampleDoc.address || sampleDoc.地址) supportedTypes.push('address');
              if (sampleDoc.company || sampleDoc.公司) supportedTypes.push('company');
            }

            database = new Database({
              name: collectionName,
              description: `${collectionName} 数据库`,
              source: dbName,
              isActive: true,
              status: 'normal',
              recordCount: count,
              supportedTypes: supportedTypes.length > 0 ? supportedTypes : ['phone', 'idcard'],
              lastUpdated: new Date()
            });

            await database.save();
            console.log(`   ✓ 创建: ${collectionName} (${count} 条记录, 支持: ${supportedTypes.join(', ') || '默认'})`);
            totalCreated++;
          }
        }

      } catch (error) {
        console.error(`   ❌ 扫描 ${dbName} 失败:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 初始化完成！');
    console.log('='.repeat(60));
    console.log(`📊 统计:`);
    console.log(`   - 新创建: ${totalCreated} 个数据库记录`);
    console.log(`   - 已更新: ${totalUpdated} 个数据库记录`);
    console.log(`   - 总计: ${totalCreated + totalUpdated} 个数据库记录`);

    // 验证结果
    const totalDatabases = await Database.countDocuments();
    console.log(`\n✅ databases 集合现在有 ${totalDatabases} 条记录`);

  } catch (error) {
    console.error('❌ 初始化失败:', error);
  } finally {
    await databaseManager.closeAll();
    console.log('\n已断开数据库连接');
  }
}

initializeDatabasesCollection();
