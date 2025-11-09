const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkDatabaseConfigSave() {
  try {
    console.log('🔗 连接数据库...');
    await mongoose.connect(process.env.USER_MONGO_URI);
    console.log('✅ 数据库连接成功\n');

    // 定义 SystemConfig Schema
    const systemConfigSchema = new mongoose.Schema({
      databases: {
        user: {
          name: String,
          type: String,
          host: String,
          port: Number,
          username: String,
          password: String,
          database: String,
          authSource: String,
          connectionPool: Number,
          timeout: Number,
          enabled: Boolean
        },
        query: [{
          id: String,
          name: String,
          type: String,
          host: String,
          port: Number,
          username: String,
          password: String,
          database: String,
          authSource: String,
          connectionPool: Number,
          timeout: Number,
          enabled: Boolean,
          description: String
        }]
      }
    }, { timestamps: true });

    const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);

    // 查询配置
    console.log('📊 查询数据库配置...');
    console.log('-----------------------------------');
    const config = await SystemConfig.findOne();
    
    if (!config) {
      console.log('❌ 未找到系统配置');
      return;
    }

    console.log('用户数据库配置:');
    if (config.databases?.user) {
      const user = config.databases.user;
      console.log(`  名称: ${user.name || '未设置'}`);
      console.log(`  主机: ${user.host || '未设置'}:${user.port || '未设置'}`);
      console.log(`  数据库: ${user.database || '未设置'}`);
      console.log(`  用户名: ${user.username || '未设置'}`);
      console.log(`  密码: ${user.password ? (user.password.length > 20 ? '已加密' : '明文') : '未设置'}`);
      console.log(`  启用: ${user.enabled ? '是' : '否'}`);
    } else {
      console.log('  ❌ 未配置');
    }

    console.log('\n查询数据库配置:');
    if (config.databases?.query && config.databases.query.length > 0) {
      config.databases.query.forEach((db, index) => {
        console.log(`\n  ${index + 1}. ${db.name || '未命名'}`);
        console.log(`     ID: ${db.id || '未设置'}`);
        console.log(`     主机: ${db.host || '未设置'}:${db.port || '未设置'}`);
        console.log(`     数据库: ${db.database || '未设置'}`);
        console.log(`     用户名: ${db.username || '未设置'}`);
        console.log(`     密码: ${db.password ? (db.password.length > 20 ? '已加密' : '明文') : '未设置'}`);
        console.log(`     启用: ${db.enabled ? '是' : '否'}`);
        console.log(`     描述: ${db.description || '无'}`);
      });
    } else {
      console.log('  ❌ 未配置查询数据库');
    }

    console.log('\n-----------------------------------');
    console.log('✅ 检查完成！');
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkDatabaseConfigSave();
