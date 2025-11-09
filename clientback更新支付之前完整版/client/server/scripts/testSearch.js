require('dotenv').config();
const { queryConnection } = require('../config/database');
const Database = require('../models/Database');

async function testSearch() {
  try {
    console.log('开始测试搜索功能...\n');

    // 等待数据库连接
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 1. 检查Database集合
    console.log('1. 检查Database集合:');
    const databases = await Database.find({ isActive: true });
    console.log(`   找到 ${databases.length} 个启用的数据库`);
    
    if (databases.length === 0) {
      console.log('   ⚠️  没有启用的数据库！');
      console.log('   请在用户数据库的databases集合中添加数据库记录');
      process.exit(1);
    }

    databases.forEach(db => {
      console.log(`   - ${db.name} (ID: ${db._id})`);
    });
    console.log('');

    // 2. 测试查询数据库连接
    console.log('2. 测试查询数据库集合:');
    const collections = await queryConnection.db.listCollections().toArray();
    console.log(`   查询数据库中有 ${collections.length} 个集合`);
    
    const collectionNames = collections.map(c => c.name);
    console.log(`   集合列表: ${collectionNames.join(', ')}`);
    console.log('');

    // 3. 检查数据库名称是否匹配
    console.log('3. 检查数据库名称匹配:');
    for (const db of databases) {
      const exists = collectionNames.includes(db.name);
      if (exists) {
        console.log(`   ✓ ${db.name} - 集合存在`);
        
        // 获取集合记录数
        const collection = queryConnection.db.collection(db.name);
        const count = await collection.countDocuments();
        console.log(`     记录数: ${count}`);
        
        if (count > 0) {
          // 获取第一条记录
          const sample = await collection.findOne();
          console.log(`     字段: ${Object.keys(sample).join(', ')}`);
        }
      } else {
        console.log(`   ✗ ${db.name} - 集合不存在！`);
        console.log(`     可能的匹配: ${collectionNames.filter(c => c.includes(db.name.substring(0, 5))).join(', ')}`);
      }
    }
    console.log('');

    // 4. 测试搜索
    console.log('4. 测试搜索功能:');
    const testQueries = [
      { type: 'name', query: '陈', field: '姓名' },
      { type: 'name', query: '曹', field: '姓名' },
      { type: 'phone', query: '182', field: '手机号' }
    ];

    for (const test of testQueries) {
      console.log(`\n   测试: 搜索${test.type} = "${test.query}"`);
      
      const fieldMapping = {
        name: ['姓名', 'Name', 'name', '名字'],
        phone: ['手机号', 'Mobile', 'phone', 'Tel', '电话']
      };
      
      const searchFields = fieldMapping[test.type] || [];
      const searchRegex = new RegExp(test.query, 'i');
      const orConditions = searchFields.map(field => ({
        [field]: searchRegex
      }));

      let totalResults = 0;
      
      for (const db of databases) {
        try {
          const collection = queryConnection.db.collection(db.name);
          const results = await collection.find({
            $or: orConditions
          }).limit(5).toArray();

          if (results.length > 0) {
            console.log(`   ✓ 在 ${db.name} 中找到 ${results.length} 条记录`);
            results.forEach((r, i) => {
              const matchedField = searchFields.find(f => r[f] && searchRegex.test(r[f]));
              console.log(`     [${i+1}] ${matchedField}: ${r[matchedField]}`);
            });
            totalResults += results.length;
          }
        } catch (error) {
          console.log(`   ✗ 搜索 ${db.name} 失败: ${error.message}`);
        }
      }

      if (totalResults === 0) {
        console.log(`   ⚠️  没有找到匹配的记录`);
      }
    }

    console.log('\n测试完成！');
    process.exit(0);
  } catch (error) {
    console.error('测试失败:', error);
    process.exit(1);
  }
}

testSearch();
