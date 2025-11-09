require('dotenv').config();
const mongoose = require('mongoose');

async function inspectQueryDatabase() {
  try {
    console.log('连接到查询数据库...\n');
    
    const queryConnection = mongoose.createConnection(process.env.QUERY_MONGO_URI);
    
    await new Promise((resolve, reject) => {
      queryConnection.once('connected', resolve);
      queryConnection.once('error', reject);
    });
    
    console.log('✅ 查询数据库连接成功\n');
    
    // 获取所有集合
    const collections = await queryConnection.db.listCollections().toArray();
    
    console.log(`找到 ${collections.length} 个集合:\n`);
    
    for (const collection of collections) {
      console.log(`📁 集合名称: ${collection.name}`);
      
      // 获取集合统计
      const coll = queryConnection.db.collection(collection.name);
      const count = await coll.countDocuments();
      console.log(`   记录数: ${count}`);
      
      if (count > 0) {
        // 获取第一条记录作为示例
        const sample = await coll.findOne();
        console.log('   示例数据结构:');
        console.log('   字段列表:', Object.keys(sample).join(', '));
        console.log('   第一条记录:');
        console.log(JSON.stringify(sample, null, 2).split('\n').map(line => '   ' + line).join('\n'));
      }
      console.log('');
    }
    
    queryConnection.close();
    process.exit(0);
  } catch (error) {
    console.error('检查失败:', error);
    process.exit(1);
  }
}

inspectQueryDatabase();
