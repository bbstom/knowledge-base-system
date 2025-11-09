/**
 * 测试时区配置功能
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 创建用户数据库连接
const userConnection = mongoose.createConnection(process.env.USER_MONGO_URI, {
  bufferCommands: false
});

// 定义 SystemConfig 模型
const systemConfigSchema = new mongoose.Schema({
  timezone: {
    value: { type: String, default: 'Asia/Shanghai' },
    displayFormat: { type: String, default: 'YYYY-MM-DD HH:mm:ss' },
    enabled: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

systemConfigSchema.statics.getConfig = async function () {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

const SystemConfig = userConnection.model('SystemConfig', systemConfigSchema);

// 连接数据库
const connectDB = async () => {
  try {
    await new Promise((resolve, reject) => {
      userConnection.once('open', resolve);
      userConnection.once('error', reject);
    });
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
};

// 测试时区配置
const testTimezoneConfig = async () => {
  try {
    
    console.log('\n📋 测试时区配置功能\n');
    
    // 1. 获取当前配置
    console.log('1️⃣ 获取当前时区配置...');
    let config = await SystemConfig.getConfig();
    console.log('当前时区配置:', config.timezone || '未配置');
    
    // 2. 测试更新时区配置
    console.log('\n2️⃣ 测试更新时区配置...');
    config.timezone = {
      value: 'Asia/Tokyo',
      displayFormat: 'YYYY-MM-DD HH:mm:ss',
      enabled: true
    };
    await config.save();
    console.log('✅ 时区配置已更新为: Asia/Tokyo');
    
    // 3. 验证配置已保存
    console.log('\n3️⃣ 验证配置已保存...');
    config = await SystemConfig.getConfig();
    console.log('保存后的时区配置:', config.timezone);
    
    // 4. 测试时间显示
    console.log('\n4️⃣ 测试时间显示...');
    const now = new Date();
    console.log('当前系统时间:', now.toISOString());
    console.log('当前进程时区:', process.env.TZ || '未设置');
    console.log('本地时间字符串:', now.toLocaleString('zh-CN', { timeZone: config.timezone.value }));
    
    // 5. 测试不同时区
    console.log('\n5️⃣ 测试不同时区显示...');
    const timezones = [
      'Asia/Shanghai',
      'Asia/Tokyo',
      'America/New_York',
      'Europe/London',
      'UTC'
    ];
    
    timezones.forEach(tz => {
      const timeStr = now.toLocaleString('zh-CN', { timeZone: tz });
      console.log(`${tz.padEnd(20)} -> ${timeStr}`);
    });
    
    // 6. 恢复默认配置
    console.log('\n6️⃣ 恢复默认时区配置...');
    config.timezone = {
      value: 'Asia/Shanghai',
      displayFormat: 'YYYY-MM-DD HH:mm:ss',
      enabled: true
    };
    await config.save();
    console.log('✅ 已恢复为默认时区: Asia/Shanghai');
    
    console.log('\n✅ 所有测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
};

// 运行测试
const run = async () => {
  await connectDB();
  
  // 等待数据库连接完全建立
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testTimezoneConfig();
  
  console.log('\n👋 关闭数据库连接...');
  await userConnection.close();
  process.exit(0);
};

run();
