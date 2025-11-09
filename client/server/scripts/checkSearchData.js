require('dotenv').config();
const SearchData = require('../models/SearchData');
const Database = require('../models/Database');

async function checkSearchData() {
  try {
    console.log('检查搜索数据...\n');

    // 获取所有数据库
    const databases = await Database.find();
    console.log(`找到 ${databases.length} 个数据库\n`);

    for (const db of databases) {
      console.log(`数据库: ${db.name} (${db._id})`);
      
      // 统计该数据库的数据
      const count = await SearchData.countDocuments({ databaseId: db._id });
      console.log(`  记录数: ${count}`);

      if (count > 0) {
        // 获取第一条数据作为示例
        const sample = await SearchData.findOne({ databaseId: db._id }).lean();
        
        console.log('  示例数据:');
        console.log('    data字段类型:', typeof sample.data);
        console.log('    data内容:', sample.data);
        console.log('    searchableFields:', sample.searchableFields);
        
        // 检查data字段是否是Map
        if (sample.data && typeof sample.data === 'object') {
          if (sample.data instanceof Map) {
            console.log('    ✓ data是Map类型');
          } else if (sample.data.constructor.name === 'Map') {
            console.log('    ✓ data是Map类型（通过constructor检测）');
          } else {
            console.log('    ✗ data不是Map类型，是:', sample.data.constructor.name);
            console.log('    需要修复此数据！');
          }
        }
      }
      console.log('');
    }

    // 检查是否有孤立数据（没有关联数据库）
    const orphanCount = await SearchData.countDocuments({ 
      databaseId: { $nin: databases.map(d => d._id) } 
    });
    
    if (orphanCount > 0) {
      console.log(`⚠️  发现 ${orphanCount} 条孤立数据（没有关联的数据库）`);
    }

    console.log('\n检查完成！');
    process.exit(0);
  } catch (error) {
    console.error('检查失败:', error);
    process.exit(1);
  }
}

// 连接数据库
require('../config/database');

// 等待数据库连接
setTimeout(() => {
  checkSearchData();
}, 2000);
