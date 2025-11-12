const database = require('../config/database');

async function diagnoseSearchIssue() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 诊断搜索功能问题');
  console.log('='.repeat(60) + '\n');

  try {
    // 1. 检查用户数据库连接
    console.log('1️⃣ 检查用户数据库连接...');
    const userConnection = database.userConnection;
    if (userConnection && userConnection.readyState === 1) {
      console.log('✅ 用户数据库已连接');
      console.log(`   数据库名: ${userConnection.name}`);
      console.log(`   主机: ${userConnection.host}:${userConnection.port}`);
    } else {
      console.log('❌ 用户数据库未连接');
    }

    // 2. 检查查询数据库连接
    console.log('\n2️⃣ 检查查询数据库连接...');
    const queryConnection = database.queryConnection;
    if (!queryConnection) {
      console.log('❌ 查询数据库未初始化');
      console.log('\n💡 这是导致 503 错误的原因！');
      console.log('\n解决方案：');
      console.log('1. 登录管理员后台：https://www.13140.cfd/admin');
      console.log('2. 进入"系统设置" → "数据库配置"');
      console.log('3. 添加查询数据库并保存');
      console.log('4. 重启服务器：pm2 restart 0');
      console.log('\n或运行快速配置脚本：');
      console.log('node scripts/saveQueryDatabaseConfigSimple.js');
      process.exit(1);
    }

    if (queryConnection.readyState !== 1) {
      console.log('❌ 查询数据库已配置但未连接');
      console.log(`   连接状态: ${queryConnection.readyState}`);
      console.log('\n💡 可能原因：');
      console.log('1. MongoDB 服务未启动');
      console.log('2. 连接信息错误');
      console.log('3. 网络问题');
    } else {
      console.log('✅ 查询数据库已连接');
      console.log(`   数据库名: ${queryConnection.name}`);
      console.log(`   主机: ${queryConnection.host}:${queryConnection.port}`);
    }

    // 3. 检查查询数据库中的集合
    console.log('\n3️⃣ 检查查询数据库中的集合...');
    const collections = await queryConnection.db.listCollections().toArray();
    console.log(`   找到 ${collections.length} 个集合`);
    
    if (collections.length === 0) {
      console.log('⚠️  数据库中没有集合（数据为空）');
    } else {
      console.log('\n   集合列表（前10个）:');
      collections.slice(0, 10).forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.name}`);
      });
      if (collections.length > 10) {
        console.log(`   ... 还有 ${collections.length - 10} 个集合`);
      }
    }

    // 4. 测试简单查询
    console.log('\n4️⃣ 测试简单查询...');
    if (collections.length > 0) {
      const testCollection = collections[0].name;
      const collection = queryConnection.db.collection(testCollection);
      const count = await collection.countDocuments();
      console.log(`✅ 查询成功`);
      console.log(`   测试集合: ${testCollection}`);
      console.log(`   记录数: ${count}`);
    } else {
      console.log('⚠️  无法测试查询（没有集合）');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 诊断完成 - 搜索功能应该可以正常工作');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ 诊断过程中出错:', error.message);
    console.error('\n详细错误:', error);
    process.exit(1);
  }
}

// 初始化数据库连接
database.initializeDatabase()
  .then(() => {
    return diagnoseSearchIssue();
  })
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('初始化失败:', error);
    process.exit(1);
  });
