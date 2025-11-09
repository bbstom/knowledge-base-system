/**
 * 直接测试 MongoDB 连接
 * 不依赖服务器和登录
 */

const mongoose = require('mongoose');

async function testDirectConnection() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 直接测试 MongoDB 连接');
  console.log('='.repeat(60));

  // 测试配置
  const config = {
    host: '172.16.254.15',
    port: 27017,
    username: 'chroot',
    password: 'Ubuntu123!',
    database: 'userdata',
    authSource: 'admin'
  };

  console.log('\n📝 测试配置:');
  console.log(JSON.stringify({
    ...config,
    password: '***隐藏***'
  }, null, 2));

  // 测试不同的 URI 格式
  const testCases = [
    {
      name: '标准格式 (authSource=admin)',
      uri: `mongodb://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}?authSource=admin`
    },
    {
      name: 'URL 编码密码 (authSource=admin)',
      uri: `mongodb://${config.username}:${encodeURIComponent(config.password)}@${config.host}:${config.port}/${config.database}?authSource=admin`
    },
    {
      name: '标准格式 (authSource=userdata)',
      uri: `mongodb://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}?authSource=userdata`
    },
    {
      name: 'URL 编码密码 (authSource=userdata)',
      uri: `mongodb://${config.username}:${encodeURIComponent(config.password)}@${config.host}:${config.port}/${config.database}?authSource=userdata`
    },
    {
      name: '无 authSource',
      uri: `mongodb://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`
    },
    {
      name: 'URL 编码密码 (无 authSource)',
      uri: `mongodb://${config.username}:${encodeURIComponent(config.password)}@${config.host}:${config.port}/${config.database}`
    }
  ];

  let successCount = 0;
  let failCount = 0;

  for (const testCase of testCases) {
    console.log('\n' + '-'.repeat(60));
    console.log(`🔍 测试: ${testCase.name}`);
    console.log(`URI: ${testCase.uri.replace(/Ubuntu123[^@]+/, 'Ubuntu123***')}`);
    
    try {
      const conn = await mongoose.createConnection(testCase.uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
      }).asPromise();
      
      console.log('✅ 连接成功!');
      
      // 尝试列出集合
      try {
        const collections = await conn.db.listCollections().toArray();
        console.log(`   数据库中有 ${collections.length} 个集合`);
        if (collections.length > 0) {
          console.log('   集合列表:', collections.map(c => c.name).join(', '));
        }
      } catch (err) {
        console.log('   ⚠️  无法列出集合:', err.message);
      }
      
      await conn.close();
      successCount++;
      
      // 如果成功了，就不再测试其他的
      console.log('\n' + '='.repeat(60));
      console.log('✅ 找到可用的连接方式！');
      console.log('='.repeat(60));
      console.log('\n推荐使用的配置:');
      console.log(JSON.stringify({
        type: 'mongodb',
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        database: config.database,
        authSource: testCase.uri.includes('authSource=admin') ? 'admin' : 
                   testCase.uri.includes('authSource=userdata') ? 'userdata' : undefined,
        needsUrlEncoding: testCase.name.includes('URL 编码')
      }, null, 2));
      break;
      
    } catch (error) {
      console.log('❌ 连接失败');
      console.log('   错误:', error.message);
      if (error.code) {
        console.log('   错误代码:', error.code);
      }
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 测试结果汇总');
  console.log('='.repeat(60));
  console.log(`成功: ${successCount}`);
  console.log(`失败: ${failCount}`);
  
  if (successCount === 0) {
    console.log('\n❌ 所有连接尝试都失败了');
    console.log('\n可能的原因:');
    console.log('1. MongoDB 服务器未运行或无法访问');
    console.log('2. 用户名或密码错误');
    console.log('3. 用户没有访问该数据库的权限');
    console.log('4. 防火墙阻止了连接');
    console.log('5. MongoDB 配置不允许远程连接');
    console.log('\n建议:');
    console.log('1. 检查 MongoDB 服务器状态');
    console.log('2. 验证用户凭据');
    console.log('3. 检查用户权限: db.getUser("chroot")');
    console.log('4. 检查网络连接: ping 172.16.254.15');
  }
  
  console.log('\n');
  process.exit(successCount > 0 ? 0 : 1);
}

// 运行测试
testDirectConnection().catch(err => {
  console.error('\n❌ 测试过程出错:', err);
  process.exit(1);
});
