/**
 * 为查询数据库的集合创建索引
 * 这将大幅提升搜索速度
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

// 系统集合列表（不创建索引）
const SYSTEM_COLLECTIONS = [
  'sitesettings', 'systemconfigs', 'commissiontransactions', 'transactions',
  'searchdatas', 'users', 'invitationlogs', 'withdrawalrequests',
  'useractivities', 'databases', 'admins', 'searchlogs', 'balancelogs'
];

// 常用搜索字段
const SEARCH_FIELDS = [
  '姓名', 'Name', 'name',
  '身份证', '身份证号', 'idCard', 'ID',
  '手机', 'phone', 'mobile', '电话',
  'QQ', 'qq', 'qqNumber',
  '微信', 'wechat', '微信号',
  '微博', 'weibo', '微博号',
  '邮箱', 'email', 'Email',
  '地址', 'Address', 'address',
  '公司', 'Company', 'company'
];

async function createIndexes() {
  try {
    console.log('='.repeat(60));
    console.log('开始为查询数据库创建索引');
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
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`处理集合: ${collectionName}`);
      
      try {
        const collection = queryConnection.db.collection(collectionName);
        
        // 获取集合中的第一条文档，检查哪些字段存在
        const sampleDoc = await collection.findOne({});
        
        if (!sampleDoc) {
          console.log(`  ⊘ 跳过（集合为空）\n`);
          skipCount++;
          continue;
        }
        
        // 检查哪些搜索字段在这个集合中存在
        const existingFields = SEARCH_FIELDS.filter(field => 
          sampleDoc.hasOwnProperty(field)
        );
        
        if (existingFields.length === 0) {
          console.log(`  ⊘ 跳过（没有可索引的字段）\n`);
          skipCount++;
          continue;
        }
        
        console.log(`  找到 ${existingFields.length} 个可索引字段: ${existingFields.join(', ')}`);
        
        // 为每个存在的字段创建索引
        let indexCount = 0;
        for (const field of existingFields) {
          try {
            await collection.createIndex(
              { [field]: 1 },
              { 
                background: true, // 后台创建，不阻塞其他操作
                name: `idx_${field}` // 索引名称
              }
            );
            indexCount++;
          } catch (err) {
            // 索引可能已存在，忽略错误
            if (!err.message.includes('already exists')) {
              console.log(`    ⚠ ${field}: ${err.message}`);
            }
          }
        }
        
        console.log(`  ✓ 创建了 ${indexCount} 个索引\n`);
        successCount++;
        
      } catch (error) {
        console.error(`  ✗ 错误: ${error.message}\n`);
        errorCount++;
      }
    }
    
    console.log('='.repeat(60));
    console.log('索引创建完成');
    console.log('='.repeat(60));
    console.log(`成功: ${successCount} 个集合`);
    console.log(`跳过: ${skipCount} 个集合`);
    console.log(`失败: ${errorCount} 个集合`);
    console.log('\n索引将在后台创建，可能需要几分钟时间');
    console.log('创建完成后，搜索速度将大幅提升！');
    
  } catch (error) {
    console.error('创建索引失败:', error);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

createIndexes();
