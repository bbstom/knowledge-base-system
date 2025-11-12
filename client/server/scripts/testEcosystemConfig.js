#!/usr/bin/env node

/**
 * 测试ecosystem.config.js是否正确加载环境变量
 */

const path = require('path');

console.log('=== 测试Ecosystem配置 ===\n');

try {
  // 先加载.env文件
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
  
  // 加载ecosystem配置
  const config = require('../../ecosystem.config.js');
  
  console.log('1. Ecosystem配置加载成功');
  console.log(`   应用名称: ${config.apps[0].name}`);
  console.log(`   脚本路径: ${config.apps[0].script}`);
  
  console.log('\n2. 环境变量配置:');
  const env = config.apps[0].env;
  
  const criticalVars = [
    'USER_MONGO_URI',
    'QUERY_MONGO_URI',
    'JWT_SECRET',
    'BEPUSDT_URL',
    'BEPUSDT_API_KEY'
  ];
  
  let allConfigured = true;
  
  criticalVars.forEach(varName => {
    const value = env[varName];
    if (value && value !== 'undefined') {
      console.log(`   ✓ ${varName}: ${value.substring(0, 30)}...`);
    } else {
      console.log(`   ✗ ${varName}: 未配置`);
      allConfigured = false;
    }
  });
  
  console.log('\n3. 其他配置:');
  console.log(`   NODE_ENV: ${env.NODE_ENV}`);
  console.log(`   PORT: ${env.PORT}`);
  console.log(`   TZ: ${env.TZ}`);
  
  if (allConfigured) {
    console.log('\n✅ 所有关键环境变量已正确配置！');
    console.log('\n下一步：运行以下命令启动PM2');
    console.log('   pm2 start ecosystem.config.js');
  } else {
    console.log('\n❌ 部分环境变量未配置，请检查server/.env文件');
  }
  
} catch (error) {
  console.error('❌ 加载配置失败:', error.message);
  console.error('\n请确保：');
  console.error('1. ecosystem.config.js文件存在');
  console.error('2. server/.env文件存在且配置正确');
  console.error('3. 已安装dotenv: npm install dotenv');
  process.exit(1);
}
