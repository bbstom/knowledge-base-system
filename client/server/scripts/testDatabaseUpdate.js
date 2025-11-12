/**
 * 测试数据库更新功能
 */

require('dotenv').config({ path: './server/.env' });
const databaseManager = require('../config/databaseManager');
const Database = require('../models/Database');

async function testDatabaseUpdate() {
  try {
    console.log('🧪 测试数据库更新功能...\n');

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
    console.log(`   描述: ${testDb.description}`);
    console.log('');

    // 测试更新
    console.log('🔄 尝试更新数据库...');
    
    const updateData = {
      description: '更新后的描述 - ' + new Date().toLocaleString(),
      recordCount: testDb.recordCount + 100,
      isActive: !testDb.isActive
    };

    console.log('更新数据:', updateData);
    console.log('');

    // 方法1: 使用 findByIdAndUpdate
    console.log('方法1: 使用 findByIdAndUpdate');
    const updated1 = await Database.findByIdAndUpdate(
      testDb._id,
      updateData,
      { new: true }
    );
    console.log('✅ 更新成功');
    console.log(`   新描述: ${updated1.description}`);
    console.log(`   新记录数: ${updated1.recordCount}`);
    console.log(`   新状态: ${updated1.isActive ? '启用' : '禁用'}`);
    console.log('');

    // 方法2: 使用 save
    console.log('方法2: 使用 save');
    testDb.description = '使用save更新 - ' + new Date().toLocaleString();
    await testDb.save();
    console.log('✅ 更新成功');
    console.log(`   新描述: ${testDb.description}`);
    console.log('');

    // 验证更新
    const verified = await Database.findById(testDb._id);
    console.log('✅ 验证更新结果:');
    console.log(`   ID: ${verified._id}`);
    console.log(`   名称: ${verified.name}`);
    console.log(`   描述: ${verified.description}`);
    console.log(`   记录数: ${verified.recordCount}`);
    console.log(`   状态: ${verified.isActive ? '启用' : '禁用'}`);

  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.error('错误详情:', error.message);
    if (error.stack) {
      console.error('堆栈:', error.stack);
    }
  } finally {
    await databaseManager.closeAll();
    console.log('\n已断开数据库连接');
  }
}

testDatabaseUpdate();
