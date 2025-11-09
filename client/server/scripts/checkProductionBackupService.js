#!/usr/bin/env node

/**
 * 检查生产服务器上的 backupService.js 是否包含修复代码
 * 
 * 使用方法：
 * node server/scripts/checkProductionBackupService.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 检查 backupService.js 修复状态...\n');

const backupServicePath = path.join(__dirname, '../services/backupService.js');

try {
  // 读取文件内容
  const content = fs.readFileSync(backupServicePath, 'utf8');
  
  // 检查关键函数是否存在
  const checks = {
    'backupDatabaseWithDriver': content.includes('backupDatabaseWithDriver'),
    'backupDatabaseWithMongodump': content.includes('backupDatabaseWithMongodump'),
    '降级逻辑': content.includes('mongodump 不可用，尝试使用原生驱动备份'),
    '原生驱动备份': content.includes('await this.backupDatabaseWithDriver(dbPath)')
  };
  
  console.log('📋 检查结果：\n');
  
  let allPassed = true;
  for (const [check, passed] of Object.entries(checks)) {
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${check}: ${passed ? '存在' : '缺失'}`);
    if (!passed) allPassed = false;
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (allPassed) {
    console.log('✅ 所有修复代码都已存在！');
    console.log('\n建议操作：');
    console.log('1. 重启服务器：pm2 restart knowledge-base');
    console.log('2. 测试备份：node server/scripts/testBackupNow.js');
  } else {
    console.log('❌ 代码需要更新！');
    console.log('\n修复方案：');
    console.log('\n方案 1: 从 Git 拉取最新代码（推荐）');
    console.log('  cd /var/www/html/knowledge-base-system');
    console.log('  git pull origin main');
    console.log('  pm2 restart knowledge-base');
    console.log('\n方案 2: 手动替换文件');
    console.log('  将本地的 server/services/backupService.js 上传到生产服务器');
    console.log('  覆盖 /var/www/html/knowledge-base-system/server/services/backupService.js');
    console.log('  pm2 restart knowledge-base');
  }
  
  console.log('='.repeat(60) + '\n');
  
  process.exit(allPassed ? 0 : 1);
  
} catch (error) {
  console.error('❌ 检查失败:', error.message);
  process.exit(1);
}
