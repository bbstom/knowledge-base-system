const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testSearchQuery() {
  try {
    console.log('🔍 测试搜索查询\n');
    console.log('='.repeat(60));

    // 1. 连接用户数据库
    console.log('📋 步骤1: 连接用户数据库');
    console.log('-----------------------------------');
    await mongoose.connect(process.env.USER_MONGO_URI);
    console.log('✅ 用户数据库连接成功');

    // 2. 获取SystemConfig中的查询数据库配置
    console.log('\n📋 步骤2: 获取查询数据库配置');
    console.log('-----------------------------------');
    
    const systemConfigSchema = new mongoose.Schema({
      databases: {
        query: [mongoose.Schema.Types.Mixed]
      }
    }, { timestamps: true });

    const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);
    const config = await SystemConfig.findOne();

    if (!config || !config.databases?.query || config.databases.query.length === 0) {
      console.log('❌ 未找到查询数据库配置');
      return;
    }

    const queryDb = config.databases.query[0];
    console.log(`✅ 找到查询数据库: ${queryDb.name}`);
    console.log(`   主机: ${queryDb.host}:${queryDb.port}`);
    console.log(`   数据库: ${queryDb.database}`);

    // 3. 连接查询数据库
    console.log('\n📋 步骤3: 连接查询数据库');
    console.log('-----------------------------------');

    const { decryptPassword, isEncrypted } = require('../utils/encryption');
    
    let password = queryDb.password;
    if (isEncrypted(password)) {
      password = decryptPassword(password);
    }

    const uri = `mongodb://${queryDb.username}:${encodeURIComponent(password)}@${queryDb.host}:${queryDb.port}/${queryDb.database}?authSource=${queryDb.authSource || 'admin'}`;
    
    console.log(`连接URI: mongodb://${queryDb.username}:***@${queryDb.host}:${queryDb.port}/${queryDb.database}`);

    const queryConn = await mongoose.createConnection(uri).asPromise();
    console.log('✅ 查询数据库连接成功');

    // 4. 列出所有集合
    console.log('\n📋 步骤4: 列出所有集合');
    console.log('-----------------------------------');
    
    const collections = await queryConn.db.listCollections().toArray();
    console.log(`找到 ${collections.length} 个集合`);
    
    // 过滤系统集合
    const SYSTEM_COLLECTIONS = [
      'sitesettings', 'systemconfigs', 'commissiontransactions', 'transactions',
      'searchdatas', 'users', 'invitationlogs', 'withdrawalrequests',
      'useractivities', 'databases', 'admins', 'searchlogs', 'balancelogs'
    ];
    
    const dataCollections = collections.filter(c => !SYSTEM_COLLECTIONS.includes(c.name));
    console.log(`可搜索集合: ${dataCollections.length} 个`);
    console.log(`集合列表: ${dataCollections.map(c => c.name).join(', ')}`);

    // 5. 测试搜索身份证号
    console.log('\n📋 步骤5: 测试搜索身份证号');
    console.log('-----------------------------------');
    
    const searchQuery = '331004199310061612';
    console.log(`搜索关键词: ${searchQuery}`);
    console.log(`搜索类型: 身份证`);

    // 身份证字段映射
    const idcardFields = [
      '身份证', '证件号码', '身份证号', '身份证号码', '证件号', 
      'identityNumber', 'cardNumber', 'idCard', 'ID Number', 
      'Identity', 'Card Number', 'idNumber', 'ID', 'id', 'CardNo', 'CtfTp'
    ];

    console.log(`\n搜索字段: ${idcardFields.join(', ')}`);

    let totalResults = 0;
    let searchErrors = [];

    // 搜索每个集合
    for (const collectionInfo of dataCollections) {
      try {
        const collection = queryConn.db.collection(collectionInfo.name);
        
        // 构建查询条件
        const orConditions = idcardFields.map(field => ({
          [field]: { $regex: `^${searchQuery}$`, $options: 'i' }
        }));
        
        // 执行搜索
        const results = await collection.find({
          $or: orConditions
        }).limit(50).toArray();
        
        if (results.length > 0) {
          console.log(`\n✅ ${collectionInfo.name}: 找到 ${results.length} 条记录`);
          
          // 显示第一条记录的字段
          if (results[0]) {
            const fields = Object.keys(results[0]).filter(k => k !== '_id');
            console.log(`   字段: ${fields.slice(0, 10).join(', ')}${fields.length > 10 ? '...' : ''}`);
            
            // 显示匹配的字段
            for (const field of idcardFields) {
              if (results[0][field]) {
                console.log(`   匹配字段: ${field} = ${results[0][field]}`);
                break;
              }
            }
          }
          
          totalResults += results.length;
        } else {
          console.log(`   ${collectionInfo.name}: 0 条记录`);
        }
      } catch (error) {
        console.log(`   ❌ ${collectionInfo.name}: ${error.message}`);
        searchErrors.push({ collection: collectionInfo.name, error: error.message });
      }
    }

    // 6. 总结
    console.log('\n' + '='.repeat(60));
    console.log('📊 搜索总结');
    console.log('-----------------------------------');
    console.log(`搜索集合数: ${dataCollections.length}`);
    console.log(`找到结果数: ${totalResults}`);
    console.log(`搜索错误数: ${searchErrors.length}`);

    if (searchErrors.length > 0) {
      console.log('\n❌ 搜索错误:');
      searchErrors.forEach(err => {
        console.log(`   ${err.collection}: ${err.error}`);
      });
    }

    if (totalResults === 0) {
      console.log('\n💡 未找到结果的可能原因:');
      console.log('   1. 数据库中没有这个身份证号的记录');
      console.log('   2. 字段名称不匹配（数据库使用了其他字段名）');
      console.log('   3. 数据格式不匹配（有空格、特殊字符等）');
      console.log('\n💡 建议:');
      console.log('   1. 检查数据库中的实际字段名');
      console.log('   2. 查看一条示例记录的结构');
      console.log('   3. 确认身份证号的存储格式');
    }

    console.log('\n✅ 测试完成！');
    
    await queryConn.close();
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    console.error('错误详情:', error.stack);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testSearchQuery();
