require('dotenv').config();
const backupService = require('../services/backupService');

async function testBackup() {
  console.log('🚀 开始测试备份功能...\n');

  try {
    // 等待数据库连接（由 databaseManager 自动处理）
    console.log('1️⃣ 等待数据库连接...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ 继续执行\n');

    // 2. 初始化备份服务
    console.log('2️⃣ 初始化备份服务...');
    await backupService.init();
    console.log('✅ 备份服务初始化成功\n');

    // 3. 创建备份
    console.log('3️⃣ 创建备份...');
    const backup = await backupService.createBackup('manual', null, '测试备份');
    
    console.log('\n✅ 备份创建成功！');
    console.log('备份信息:');
    console.log('  - ID:', backup.backupId);
    console.log('  - 文件:', backup.filePath);
    console.log('  - 大小:', (backup.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('  - 状态:', backup.status);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 备份测试失败:', error);
    console.error('错误详情:', error.stack);
    process.exit(1);
  }
}

testBackup();
