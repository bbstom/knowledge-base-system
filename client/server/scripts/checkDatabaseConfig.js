/**
 * 检查数据库中保存的配置
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkDatabaseConfig() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 检查数据库中的配置');
  console.log('='.repeat(60));

  try {
    // 连接数据库
    const uri = process.env.USER_MONGO_URI;
    console.log('\n🔄 连接数据库...');
    await mongoose.connect(uri);
    console.log('✅ 数据库连接成功');

    // 查询 SystemConfig
    const SystemConfig = mongoose.model('SystemConfig', new mongoose.Schema({}, { strict: false }));
    
    const config = await SystemConfig.findOne();
    
    if (!config) {
      console.log('\n❌ 数据库中没有找到 SystemConfig 文档');
      console.log('这可能是首次使用，需要创建配置');
    } else {
      console.log('\n✅ 找到 SystemConfig 文档');
      console.log('\n完整配置:');
      console.log(JSON.stringify(config.toObject(), null, 2));
      
      console.log('\n' + '-'.repeat(60));
      console.log('数据库配置详情:');
      console.log('-'.repeat(60));
      
      if (config.databases) {
        console.log('\n📦 databases 字段存在');
        
        if (config.databases.user) {
          console.log('\n用户数据库配置:');
          console.log(JSON.stringify({
            ...config.databases.user,
            password: config.databases.user.password ? `***${config.databases.user.password.length}字符***` : '(空)'
          }, null, 2));
        } else {
          console.log('\n❌ 用户数据库配置不存在');
        }
        
        if (config.databases.query) {
          console.log('\n查询数据库配置:');
          console.log(`数量: ${config.databases.query.length}`);
          config.databases.query.forEach((db, index) => {
            console.log(`\n查询数据库 ${index + 1}:`);
            console.log(JSON.stringify({
              ...db,
              password: db.password ? `***${db.password.length}字符***` : '(空)'
            }, null, 2));
          });
        } else {
          console.log('\n查询数据库配置: []');
        }
      } else {
        console.log('\n❌ databases 字段不存在');
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('检查完成');
    console.log('='.repeat(60) + '\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkDatabaseConfig();
