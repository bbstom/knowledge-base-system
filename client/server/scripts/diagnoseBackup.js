const fs = require('fs').promises;
const path = require('path');

async function diagnoseBackup() {
  console.log('🔍 开始诊断备份问题...\n');

  // 1. 检查环境变量
  console.log('1️⃣ 检查环境变量:');
  console.log('USER_MONGO_URI:', process.env.USER_MONGO_URI ? '✅ 已配置' : '❌ 未配置');
  if (process.env.USER_MONGO_URI) {
    const uri = process.env.USER_MONGO_URI;
    const match = uri.match(/mongodb:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
    if (match) {
      console.log('  - 数据库: ' + match[5]);
      console.log('  - 主机: ' + match[3] + ':' + match[4]);
    }
  }
  console.log();

  // 2. 检查 mongodump 命令
  console.log('2️⃣ 检查 mongodump 命令:');
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    const { stdout } = await execAsync('mongodump --version');
    console.log('✅ mongodump 已安装');
    console.log('版本:', stdout.trim());
  } catch (error) {
    console.log('❌ mongodump 未安装或不在 PATH 中');
    console.log('错误:', error.message);
  }
  console.log();

  // 3. 检查前端源代码目录
  console.log('3️⃣ 检查前端源代码目录:');
  const projectRoot = path.join(__dirname, '../..');
  const srcDir = path.join(projectRoot, 'src');
  
  try {
    await fs.access(srcDir);
    const files = await fs.readdir(srcDir);
    console.log('✅ src 目录存在');
    console.log('路径:', srcDir);
    console.log('文件数:', files.length);
    console.log('示例文件:', files.slice(0, 5).join(', '));
  } catch (error) {
    console.log('❌ src 目录不存在');
    console.log('路径:', srcDir);
  }
  console.log();

  // 4. 检查前端构建目录
  console.log('4️⃣ 检查前端构建目录:');
  const distDir = path.join(projectRoot, 'dist');
  
  try {
    await fs.access(distDir);
    const files = await fs.readdir(distDir);
    console.log('✅ dist 目录存在');
    console.log('路径:', distDir);
    console.log('文件数:', files.length);
  } catch (error) {
    console.log('⚠️  dist 目录不存在（需要先构建前端）');
    console.log('路径:', distDir);
  }
  console.log();

  // 5. 检查上传文件目录
  console.log('5️⃣ 检查上传文件目录:');
  const uploadsDir = path.join(__dirname, '../uploads');
  
  try {
    await fs.access(uploadsDir);
    const files = await fs.readdir(uploadsDir);
    console.log('✅ uploads 目录存在');
    console.log('路径:', uploadsDir);
    console.log('文件数:', files.length);
  } catch (error) {
    console.log('ℹ️  uploads 目录不存在（正常，如果没有上传文件）');
    console.log('路径:', uploadsDir);
  }
  console.log();

  // 6. 检查备份目录权限
  console.log('6️⃣ 检查备份目录:');
  const backupDir = path.join(__dirname, '../backups');
  const tempDir = path.join(__dirname, '../temp');
  
  try {
    await fs.access(backupDir);
    console.log('✅ backups 目录存在');
    console.log('路径:', backupDir);
    
    // 列出最近的备份文件
    const backups = await fs.readdir(backupDir);
    const zipFiles = backups.filter(f => f.endsWith('.zip'));
    console.log('备份文件数:', zipFiles.length);
    if (zipFiles.length > 0) {
      console.log('最新备份:', zipFiles[zipFiles.length - 1]);
    }
  } catch (error) {
    console.log('❌ backups 目录不存在');
  }
  
  try {
    await fs.access(tempDir);
    console.log('✅ temp 目录存在');
  } catch (error) {
    console.log('ℹ️  temp 目录不存在（正常）');
  }
  console.log();

  // 7. 测试路径解析
  console.log('7️⃣ 测试路径解析:');
  console.log('__dirname:', __dirname);
  console.log('项目根目录:', projectRoot);
  console.log('server 目录:', path.join(__dirname, '..'));
  console.log();

  // 8. 建议
  console.log('📋 诊断建议:');
  console.log('-----------------------------------');
  
  if (!process.env.USER_MONGO_URI) {
    console.log('❌ 需要配置 USER_MONGO_URI 环境变量');
  }
  
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    await execAsync('mongodump --version');
  } catch (error) {
    console.log('❌ 需要安装 MongoDB Database Tools');
    console.log('   下载地址: https://www.mongodb.com/try/download/database-tools');
  }
  
  try {
    await fs.access(srcDir);
  } catch (error) {
    console.log('❌ 前端源代码目录不存在，请检查项目结构');
  }
  
  console.log('-----------------------------------');
}

diagnoseBackup().catch(console.error);
