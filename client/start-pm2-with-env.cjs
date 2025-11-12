#!/usr/bin/env node

/**
 * PM2启动脚本 - 自动加载.env文件
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('=== PM2环境变量启动脚本 ===\n');

// 1. 加载.env文件
const envPath = path.join(__dirname, 'server/.env');
console.log('1. 加载环境变量...');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env文件不存在:', envPath);
  process.exit(1);
}

require('dotenv').config({ path: envPath });
console.log('   ✓ 环境变量已加载');

// 2. 验证关键环境变量
console.log('\n2. 验证关键环境变量...');
const requiredVars = ['USER_MONGO_URI', 'QUERY_MONGO_URI', 'JWT_SECRET'];
let allPresent = true;

requiredVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`   ✓ ${varName}`);
  } else {
    console.log(`   ✗ ${varName} 未设置`);
    allPresent = false;
  }
});

if (!allPresent) {
  console.error('\n❌ 部分环境变量未配置，请检查.env文件');
  process.exit(1);
}

// 3. 停止旧进程
console.log('\n3. 停止旧PM2进程...');
try {
  execSync('pm2 stop base2', { stdio: 'ignore' });
  execSync('pm2 delete base2', { stdio: 'ignore' });
  console.log('   ✓ 旧进程已停止');
} catch (error) {
  console.log('   ℹ 没有运行中的进程');
}

// 4. 启动PM2进程
console.log('\n4. 启动PM2进程...');

try {
  // 使用ecosystem配置启动，并传递当前环境变量
  execSync('pm2 start ecosystem.config.js', {
    stdio: 'inherit',
    env: process.env
  });
  
  console.log('\n   ✓ PM2进程已启动');
  
  // 5. 显示状态
  console.log('\n5. PM2状态:');
  execSync('pm2 status', { stdio: 'inherit' });
  
  // 6. 显示日志
  console.log('\n6. 最新日志:');
  execSync('pm2 logs base2 --lines 20 --nostream', { stdio: 'inherit' });
  
  console.log('\n✅ 启动完成！');
  console.log('\n常用命令:');
  console.log('  查看实时日志: pm2 logs base2');
  console.log('  查看状态: pm2 status');
  console.log('  重启服务: pm2 restart base2');
  console.log('  停止服务: pm2 stop base2');
  
} catch (error) {
  console.error('\n❌ 启动失败:', error.message);
  console.error('\n请检查:');
  console.error('1. PM2是否已安装: npm install -g pm2');
  console.error('2. 端口3001是否被占用');
  console.error('3. 数据库连接是否正常');
  process.exit(1);
}
