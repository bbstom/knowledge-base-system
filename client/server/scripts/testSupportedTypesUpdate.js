/**
 * 测试支持的搜索类型更新功能
 */

require('dotenv').config({ path: './server/.env' });
const databaseManager = require('../config/databaseManager');
const Database = require('../models/Database');

async function testSupportedTypesUpdate() {
  try {
    console.log('🧪 测试支持的搜索类型更新...\n');

    // 初始化数据库连接
    await databaseManager.initializeFromEnv();
    console.log('✅ 数据库连接已初始化\n');

    // 获取第一个数据库
    const databases = await Database.find({}).limit(1);
    
    if (databases.length === 0) {
      console.log('❌ 没有找到数据库记录');
      console.log('请先运行: node server/scripts/addSampleDatabases.js');
      return;
    }

    const testDb = databases[0];
    console.log('📝 测试数据库:');
    console.log(`   ID: ${testDb._id}`);
    console.log(`   名称: ${testDb.name}`);
    console.log(`   当前支持类型: ${testDb.supportedTypes.join(', ')}`);
    console.log('');

    // 测试1: 使用 searchTypes 字段更新
    console.log('测试1: 使用 searchTypes 字段更新');
    const newTypes1 = ['phone', 'idcard', 'email'];
    testDb.supportedTypes = newTypes1;
    await testDb.save();
    
    const verified1 = await Database.findById(testDb._id);
    console.log(`   更新为: ${verified1.supportedTypes.join(', ')}`);
    console.log(`   ✅ ${JSON.stringify(verified1.supportedTypes) === JSON.stringify(newTypes1) ? '成功' : '失败'}`);
    console.log('');

    // 测试2: 模拟前端发送 supportedTypes
    console.log('测试2: 模拟前端发送 supportedTypes');
    const newTypes2 = ['name', 'qq', 'wechat'];
    
    // 模拟后端处理逻辑
    const supportedTypes = newTypes2;  // 前端发送的字段
    if (supportedTypes !== undefined) {
      testDb.supportedTypes = supportedTypes;
    }
    await testDb.save();
    
    const verified2 = await Database.findById(testDb._id);
    console.log(`   更新为: ${verified2.supportedTypes.join(', ')}`);
    console.log(`   ✅ ${JSON.stringify(verified2.supportedTypes) === JSON.stringify(newTypes2) ? '成功' : '失败'}`);
    console.log('');

    // 测试3: 空数组
    console.log('测试3: 更新为空数组');
    testDb.supportedTypes = [];
    await testDb.save();
    
    const verified3 = await Database.findById(testDb._id);
    console.log(`   更新为: ${verified3.supportedTypes.length === 0 ? '空数组' : verified3.supportedTypes.join(', ')}`);
    console.log(`   ✅ ${verified3.supportedTypes.length === 0 ? '成功' : '失败'}`);
    console.log('');

    // 恢复原始数据
    console.log('恢复原始数据...');
    testDb.supportedTypes = ['phone', 'idcard'];
    await testDb.save();
    console.log('✅ 已恢复');

    console.log('\n✅ 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.error('错误详情:', error.message);
  } finally {
    await databaseManager.closeAll();
    console.log('\n已断开数据库连接');
  }
}

testSupportedTypesUpdate();
