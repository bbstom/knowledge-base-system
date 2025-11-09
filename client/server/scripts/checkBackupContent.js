const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function checkBackupContent() {
  console.log('🔍 检查备份文件内容...\n');

  const backupDir = path.join(__dirname, '../backups');
  
  try {
    // 1. 列出所有备份文件
    const files = await fs.readdir(backupDir);
    const zipFiles = files.filter(f => f.endsWith('.zip'));
    
    if (zipFiles.length === 0) {
      console.log('❌ 没有找到备份文件');
      console.log('请先创建一个备份');
      return;
    }

    // 2. 检查最新的备份文件
    zipFiles.sort().reverse();
    const latestBackup = zipFiles[0];
    const backupPath = path.join(backupDir, latestBackup);
    
    console.log(`📦 检查备份文件: ${latestBackup}`);
    console.log(`路径: ${backupPath}\n`);

    // 3. 获取文件大小
    const stats = await fs.stat(backupPath);
    console.log(`文件大小: ${(stats.size / 1024 / 1024).toFixed(2)} MB\n`);

    // 4. 解压到临时目录检查
    const tempDir = path.join(__dirname, '../temp/check_backup');
    await fs.mkdir(tempDir, { recursive: true });

    console.log('📦 解压备份文件...');
    
    // 使用 PowerShell 解压（Windows）
    if (process.platform === 'win32') {
      const cmd = `powershell -command "Expand-Archive -Path '${backupPath}' -DestinationPath '${tempDir}' -Force"`;
      await execAsync(cmd);
    } else {
      // Linux/Mac
      await execAsync(`unzip -o "${backupPath}" -d "${tempDir}"`);
    }

    console.log('✅ 解压完成\n');

    // 5. 检查目录结构
    const checkDir = async (dirName, displayName) => {
      const dirPath = path.join(tempDir, dirName);
      try {
        await fs.access(dirPath);
        const files = await fs.readdir(dirPath, { withFileTypes: true });
        const fileCount = files.filter(f => f.isFile()).length;
        const dirCount = files.filter(f => f.isDirectory()).length;
        
        if (fileCount === 0 && dirCount === 0) {
          console.log(`${displayName}: ❌ 空目录`);
          return { empty: true, files: [], dirs: [] };
        } else {
          console.log(`${displayName}: ✅ ${fileCount} 个文件, ${dirCount} 个子目录`);
          return { empty: false, files, dirs: files.filter(f => f.isDirectory()).map(f => f.name) };
        }
      } catch (error) {
        console.log(`${displayName}: ❌ 目录不存在`);
        return { empty: true, files: [], dirs: [] };
      }
    };

    console.log('📊 备份内容分析:\n');
    
    const database = await checkDir('database', '1️⃣  数据库备份 (database/)');
    const server = await checkDir('server', '2️⃣  后端代码 (server/)');
    const client = await checkDir('client', '3️⃣  前端代码 (client/)');
    const config = await checkDir('config', '4️⃣  配置文件 (config/)');
    const filesDir = await checkDir('files', '5️⃣  上传文件 (files/)');

    
    console.log();

    // 6. 检查数据库备份详情
    if (!database.empty) {
      console.log('📊 数据库备份详情:\n');
      const dbPath = path.join(tempDir, 'database');
      const dbFiles = await fs.readdir(dbPath);
      
      const jsonFiles = dbFiles.filter(f => f.endsWith('.json'));
      const bsonFiles = dbFiles.filter(f => f.endsWith('.bson'));
      
      if (jsonFiles.length > 0) {
        console.log(`   备份格式: JSON (原生驱动)`);
        console.log(`   集合数量: ${jsonFiles.filter(f => f !== '_metadata.json').length}`);
        console.log(`   集合列表:`);
        for (const file of jsonFiles) {
          if (file !== '_metadata.json') {
            const filePath = path.join(dbPath, file);
            const stats = await fs.stat(filePath);
            const collectionName = path.basename(file, '.json');
            console.log(`      - ${collectionName}: ${(stats.size / 1024).toFixed(2)} KB`);
          }
        }
      } else if (bsonFiles.length > 0) {
        console.log(`   备份格式: BSON (mongodump)`);
        console.log(`   集合数量: ${bsonFiles.length}`);
      }
      console.log();
    }

    // 7. 总结
    console.log('='.repeat(60));
    console.log('📋 备份状态总结:');
    console.log('='.repeat(60));
    
    const issues = [];
    if (database.empty) issues.push('❌ 数据库备份为空');
    if (server.empty) issues.push('❌ 后端代码备份为空');
    if (client.empty) issues.push('⚠️  前端代码备份为空（可能未构建）');
    if (config.empty) issues.push('❌ 配置文件备份为空');
    
    if (issues.length === 0) {
      console.log('✅ 备份完整，所有内容都已备份');
    } else {
      console.log('⚠️  备份存在问题:');
      issues.forEach(issue => console.log(`   ${issue}`));
    }
    
    console.log('='.repeat(60));

    // 8. 清理临时目录
    console.log('\n🧹 清理临时文件...');
    await fs.rm(tempDir, { recursive: true, force: true });
    console.log('✅ 清理完成');

  } catch (error) {
    console.error('❌ 检查失败:', error);
    console.error(error.stack);
  }
}

checkBackupContent();
