/**
 * 测试代码备份功能
 */

const backupService = require('../services/backupService');

async function testCodeBackup() {
  console.log('============================================================');
  console.log('🧪 测试代码备份功能');
  console.log('============================================================\n');

  try {
    // 初始化备份服务
    await backupService.init();
    console.log('✅ 备份服务初始化成功\n');

    // 创建包含代码的完整备份
    console.log('📦 开始创建完整备份（包含代码）...\n');
    const backup = await backupService.createBackup('manual', null, '测试备份-包含前后端代码');

    console.log('\n============================================================');
    console.log('✅ 备份测试完成');
    console.log('============================================================');
    console.log('备份信息:');
    console.log(`  ID: ${backup.backupId}`);
    console.log(`  文件: ${backup.filePath}`);
    console.log(`  大小: ${(backup.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  状态: ${backup.status}`);
    console.log('============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 备份测试失败:', error);
    process.exit(1);
  }
}

testCodeBackup();
