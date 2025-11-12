require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function diagnose() {
  console.log('='.repeat(60));
  console.log('🔍 诊断登录问题');
  console.log('='.repeat(60));
  console.log('');
  
  // 1. 检查环境变量
  console.log('[1] 检查环境变量配置');
  console.log(`USER_MONGO_URI: ${process.env.USER_MONGO_URI ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`QUERY_MONGO_URIS: ${process.env.QUERY_MONGO_URIS ? '✅ 已配置' : '⚠️  未配置'}`);
  console.log('');
  
  // 2. 测试数据库连接
  console.log('[2] 测试数据库连接');
  let connection = null;
  
  try {
    const uri = process.env.USER_MONGO_URI;
    console.log('🔄 连接用户数据库...');
    
    connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });
    
    console.log('✅ 数据库连接成功');
    console.log(`   数据库名: ${connection.connection.name}`);
    console.log(`   连接状态: ${connection.connection.readyState === 1 ? '已连接' : '未连接'}`);
    console.log('');
    
    // 3. 检查 SystemConfig
    console.log('[3] 检查 SystemConfig 中的数据库配置');
    const SystemConfig = mongoose.model('SystemConfig', new mongoose.Schema({}, { strict: false }));
    
    const config = await SystemConfig.findOne();
    
    if (config && config.databases) {
      console.log('⚠️  发现数据库配置（这会导致问题）:');
      console.log(JSON.stringify(config.databases, null, 2));
      console.log('');
      console.log('❌ 需要清空配置！');
      console.log('   执行: node server/scripts/clearDatabaseConfig.js');
    } else {
      console.log('✅ 未发现数据库配置（正常）');
    }
    console.log('');
    
    // 4. 测试 User 模型查询
    console.log('[4] 测试 User 模型查询');
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      username: String
    }));
    
    const userCount = await User.countDocuments();
    console.log(`✅ 查询成功，用户数量: ${userCount}`);
    console.log('');
    
    // 5. 测试登录查询
    console.log('[5] 测试登录查询');
    const testUser = await User.findOne().limit(1);
    if (testUser) {
      console.log(`✅ 查询成功，找到用户: ${testUser.email || testUser.username}`);
    } else {
      console.log('⚠️  数据库中没有用户');
    }
    console.log('');
    
    await mongoose.disconnect();
    
    console.log('='.repeat(60));
    console.log('✅ 诊断完成');
    console.log('='.repeat(60));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 诊断失败:', error.message);
    console.error(error.stack);
    
    if (connection) {
      await mongoose.disconnect();
    }
    
    process.exit(1);
  }
}

diagnose();
