const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function diagnoseQueryDatabase() {
  try {
    console.log('🔍 诊断查询数据库配置\n');
    console.log('='.repeat(60));

    // 1. 检查环境变量
    console.log('📋 步骤1: 检查环境变量');
    console.log('-----------------------------------');
    console.log(`USER_MONGO_URI: ${process.env.USER_MONGO_URI ? '✅ 已配置' : '❌ 未配置'}`);
    console.log(`QUERY_MONGO_URI: ${process.env.QUERY_MONGO_URI ? '✅ 已配置' : '❌ 未配置'}`);

    // 2. 连接用户数据库
    console.log('\n📋 步骤2: 连接用户数据库');
    console.log('-----------------------------------');
    await mongoose.connect(process.env.USER_MONGO_URI);
    console.log('✅ 用户数据库连接成功');

    // 3. 检查SystemConfig中的数据库配置
    console.log('\n📋 步骤3: 检查SystemConfig配置');
    console.log('-----------------------------------');
    
    const systemConfigSchema = new mongoose.Schema({
      databases: {
        user: mongoose.Schema.Types.Mixed,
        query: [mongoose.Schema.Types.Mixed]
      }
    }, { timestamps: true });

    const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);
    const config = await SystemConfig.findOne();

    if (!config) {
      console.log('❌ 未找到SystemConfig配置');
      console.log('\n💡 解决方案:');
      console.log('   1. 登录管理员后台');
      console.log('   2. 进入"系统设置" -> "数据库配置"');
      console.log('   3. 配置查询数据库并保存');
      return;
    }

    console.log('✅ 找到SystemConfig配置');

    // 检查用户数据库配置
    if (config.databases?.user) {
      console.log('\n用户数据库配置:');
      console.log(`  主机: ${config.databases.user.host || '未设置'}`);
      console.log(`  端口: ${config.databases.user.port || '未设置'}`);
      console.log(`  数据库: ${config.databases.user.database || '未设置'}`);
      console.log(`  启用: ${config.databases.user.enabled ? '是' : '否'}`);
    } else {
      console.log('\n❌ 用户数据库未配置');
    }

    // 检查查询数据库配置
    if (config.databases?.query && config.databases.query.length > 0) {
      console.log('\n查询数据库配置:');
      config.databases.query.forEach((db, index) => {
        console.log(`\n  ${index + 1}. ${db.name || '未命名'}`);
        console.log(`     ID: ${db.id || '未设置'}`);
        console.log(`     主机: ${db.host || '未设置'}:${db.port || '未设置'}`);
        console.log(`     数据库: ${db.database || '未设置'}`);
        console.log(`     用户名: ${db.username || '未设置'}`);
        console.log(`     密码: ${db.password ? '已设置' : '未设置'}`);
        console.log(`     启用: ${db.enabled ? '是' : '否'}`);
      });
    } else {
      console.log('\n❌ 查询数据库未配置');
      console.log('\n💡 解决方案:');
      console.log('   1. 登录管理员后台');
      console.log('   2. 进入"系统设置" -> "数据库配置"');
      console.log('   3. 点击"添加查询数据库"');
      console.log('   4. 填写数据库信息并保存');
    }

    // 4. 测试查询数据库连接
    if (config.databases?.query && config.databases.query.length > 0) {
      console.log('\n📋 步骤4: 测试查询数据库连接');
      console.log('-----------------------------------');

      const { decryptPassword, isEncrypted } = require('../utils/encryption');

      for (const db of config.databases.query) {
        if (!db.enabled) {
          console.log(`⏭️  跳过未启用的数据库: ${db.name}`);
          continue;
        }

        try {
          // 解密密码
          let password = db.password;
          if (isEncrypted(password)) {
            password = decryptPassword(password);
          }

          // 构建连接URI
          const uri = `mongodb://${db.username}:${encodeURIComponent(password)}@${db.host}:${db.port}/${db.database}?authSource=${db.authSource || 'admin'}`;
          
          console.log(`\n🧪 测试连接: ${db.name}`);
          console.log(`   URI: mongodb://${db.username}:***@${db.host}:${db.port}/${db.database}`);

          const testConn = await mongoose.createConnection(uri).asPromise();
          console.log(`   ✅ 连接成功`);

          // 列出集合
          const collections = await testConn.db.listCollections().toArray();
          console.log(`   📦 集合数量: ${collections.length}`);
          if (collections.length > 0) {
            console.log(`   📋 集合列表: ${collections.slice(0, 5).map(c => c.name).join(', ')}${collections.length > 5 ? '...' : ''}`);
          }

          await testConn.close();
        } catch (error) {
          console.log(`   ❌ 连接失败: ${error.message}`);
        }
      }
    }

    // 5. 检查database.js的queryConnection
    console.log('\n📋 步骤5: 检查database.js导出');
    console.log('-----------------------------------');
    
    const database = require('../config/database');
    const queryConnection = database.queryConnection;

    if (queryConnection) {
      console.log('✅ queryConnection 已初始化');
      console.log(`   数据库名: ${queryConnection.name}`);
      console.log(`   主机: ${queryConnection.host}`);
      console.log(`   连接状态: ${queryConnection.readyState === 1 ? '已连接' : '未连接'}`);
    } else {
      console.log('❌ queryConnection 为 null');
      console.log('\n💡 可能的原因:');
      console.log('   1. SystemConfig中未配置查询数据库');
      console.log('   2. 查询数据库连接失败');
      console.log('   3. 服务器启动时初始化失败');
      console.log('\n💡 解决方案:');
      console.log('   1. 确保在管理员后台配置了查询数据库');
      console.log('   2. 点击"测试连接"确保连接成功');
      console.log('   3. 保存配置后重启服务器');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 诊断完成！');
    
  } catch (error) {
    console.error('\n❌ 诊断失败:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

diagnoseQueryDatabase();
