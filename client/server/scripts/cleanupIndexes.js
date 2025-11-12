/**
 * 清理数据库索引，只保留 all_text_index 和 _id 索引
 * 删除其他所有索引以优化性能和存储空间
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

// 系统集合列表（不处理）
const SYSTEM_COLLECTIONS = [
  'sitesettings', 'systemconfigs', 'commissiontransactions', 'transactions',
  'searchdatas', 'users', 'invitationlogs', 'withdrawalrequests',
  'useractivities', 'databases', 'admins', 'searchlogs', 'balancelogs',
  'lotteryactivities', 'lotteryrecords', 'tickets', 'emailtemplates',
  'verificationcodes', 'ratelimits', 'activitylogs', 'backups'
];

async function cleanupIndexes() {
  try {
    console.log('='.repeat(60));
    console.log('开始清理数据库索引');
    console.log('='.repeat(60));
    
    // 检查查询数据库环境变量
    const queryUris = process.env.QUERY_MONGO_URIS;
    if (!queryUris) {
      console.error('✗ 错误: QUERY_MONGO_URIS 环境变量未设置');
      console.log('请检查 server/.env 文件');
      process.exit(1);
    }
    
    // 获取第一个查询数据库URI
    const queryUri = queryUris.split(',')[0].trim();
    console.log(`连接到查询数据库: ${queryUri.replace(/:[^:@]+@/, ':****@')}\n`);
    
    // 直接连接到查询数据库
    const queryConnection = await mongoose.createConnection(queryUri).asPromise();
    console.log(`✓ 查询数据库已连接: ${queryConnection.name}\n`);
    
    // 获取所有集合
    const allCollections = await queryConnection.db.listCollections().toArray();
    const collections = allCollections.filter(c => 
      !SYSTEM_COLLECTIONS.includes(c.name)
    );
    
    console.log(`找到 ${collections.length} 个数据集合\n`);
    
    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let totalIndexesRemoved = 0;
    
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`处理集合: ${collectionName}`);
      
      try {
        const collection = queryConnection.db.collection(collectionName);
        
        // 获取当前所有索引
        const indexes = await collection.indexes();
        
        if (indexes.length <= 1) {
          console.log(`  ⊘ 跳过（只有默认 _id 索引）\n`);
          skippedCount++;
          continue;
        }
        
        console.log(`  当前索引数量: ${indexes.length}`);
        
        // 显示所有索引
        indexes.forEach(index => {
          console.log(`    - ${index.name}: ${JSON.stringify(index.key)}`);
        });
        
        // 删除除了 _id 和 all_text_index 之外的所有索引
        let removedCount = 0;
        for (const index of indexes) {
          const indexName = index.name;
          
          // 保留 _id 索引（默认）和 all_text_index
          if (indexName === '_id_' || indexName === 'all_text_index') {
            console.log(`    ✓ 保留: ${indexName}`);
            continue;
          }
          
          try {
            await collection.dropIndex(indexName);
            console.log(`    ✗ 删除: ${indexName}`);
            removedCount++;
            totalIndexesRemoved++;
          } catch (dropError) {
            console.log(`    ⚠ 删除失败: ${indexName} - ${dropError.message}`);
          }
        }
        
        console.log(`  ✓ 删除了 ${removedCount} 个索引\n`);
        processedCount++;
        
      } catch (error) {
        console.error(`  ✗ 错误: ${error.message}\n`);
        errorCount++;
      }
    }
    
    console.log('='.repeat(60));
    console.log('索引清理完成');
    console.log('='.repeat(60));
    console.log(`处理成功: ${processedCount} 个集合`);
    console.log(`跳过: ${skippedCount} 个集合`);
    console.log(`处理失败: ${errorCount} 个集合`);
    console.log(`总共删除: ${totalIndexesRemoved} 个索引`);
    console.log('\n现在每个集合只保留:');
    console.log('  - _id_ (默认主键索引)');
    console.log('  - all_text_index (文本搜索索引)');
    console.log('\n这将:');
    console.log('  ✓ 减少存储空间占用');
    console.log('  ✓ 提高写入性能');
    console.log('  ✓ 简化索引管理');
    console.log('  ✓ 保持搜索性能（通过文本索引）');
    
    await queryConnection.close();
    
  } catch (error) {
    console.error('清理索引失败:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

cleanupIndexes();
