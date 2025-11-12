require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function clearDatabaseConfig() {
  let connection = null;
  
  try {
    const uri = process.env.USER_MONGO_URI;
    console.log('🔄 连接数据库...');
    
    connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });
    
    console.log('✅ 数据库连接成功');
    
    // 查找并删除数据库配置
    const SystemConfig = mongoose.model('SystemConfig', new mongoose.Schema({}, { strict: false }));
    
    const config = await SystemConfig.findOne();
    
    if (config && config.databases) {
      console.log('📝 发现数据库配置:');
      console.log(JSON.stringify(config.databases, null, 2));
      
      // 删除databases字段
      config.databases = undefined;
      await config.save();
      
      console.log('✅ 已清空数据库配置');
    } else {
      console.log('ℹ️  未找到数据库配置，无需清空');
    }
    
    await mongoose.disconnect();
    console.log('✅ 完成');
    process.exit(0);
  } catch (error) {
    console.error('❌ 失败:', error.message);
    if (connection) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

clearDatabaseConfig();
