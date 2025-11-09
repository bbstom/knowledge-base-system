const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const archiver = require('archiver');
const { userConnection } = require('../config/database');
const BackupModel = require('../models/Backup');

const execAsync = promisify(exec);

class BackupService {
  constructor() {
    this.backupDir = path.join(__dirname, '../backups');
    this.tempDir = path.join(__dirname, '../temp');
    this.version = require('../package.json').version;
    this.Backup = null;
  }
  
  // 初始化模型
  initModels() {
    if (!this.Backup) {
      this.Backup = BackupModel(userConnection);
    }
  }

  /**
   * 初始化备份目录
   */
  async init() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      await fs.mkdir(this.tempDir, { recursive: true });
      console.log('✅ 备份目录初始化成功');
    } catch (error) {
      console.error('❌ 备份目录初始化失败:', error);
      throw error;
    }
  }

  /**
   * 生成备份ID
   */
  generateBackupId() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return `backup_${timestamp}`;
  }

  /**
   * 检查磁盘空间
   */
  async checkDiskSpace() {
    try {
      // Windows 系统
      if (process.platform === 'win32') {
        const { stdout } = await execAsync('wmic logicaldisk get size,freespace,caption');
        console.log('💾 磁盘空间:', stdout);
        return true;
      }
      // Linux/Mac 系统
      const { stdout } = await execAsync('df -h');
      console.log('💾 磁盘空间:', stdout);
      return true;
    } catch (error) {
      console.warn('⚠️  无法检查磁盘空间:', error.message);
      return true; // 继续执行
    }
  }

  /**
   * 备份MongoDB数据库
   */
  async backupDatabase(tempPath) {
    console.log('📦 开始备份数据库...');
    
    const dbPath = path.join(tempPath, 'database');
    await fs.mkdir(dbPath, { recursive: true });

    try {
      // 从环境变量获取数据库连接信息
      const mongoUri = process.env.USER_MONGO_URI;
      if (!mongoUri) {
        console.warn('⚠️  未配置 USER_MONGO_URI，跳过数据库备份');
        return true;
      }

      // 首先尝试使用 mongodump（如果可用）
      try {
        await this.backupDatabaseWithMongodump(dbPath, mongoUri);
        console.log('✅ 数据库备份完成（使用 mongodump）');
        return true;
      } catch (mongodumpError) {
        console.warn('⚠️  mongodump 不可用，尝试使用原生驱动备份...');
        console.warn('   错误:', mongodumpError.message);
        
        // 使用 MongoDB 原生驱动备份
        await this.backupDatabaseWithDriver(dbPath);
        console.log('✅ 数据库备份完成（使用原生驱动）');
        return true;
      }
    } catch (error) {
      console.error('❌ 数据库备份失败:', error.message);
      console.warn('⚠️  继续备份其他内容...');
      return false;
    }
  }

  /**
   * 使用 mongodump 备份数据库
   */
  async backupDatabaseWithMongodump(dbPath, mongoUri) {
    // 解析MongoDB URI
    const uriMatch = mongoUri.match(/mongodb:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
    if (!uriMatch) {
      throw new Error('无法解析数据库连接字符串');
    }

    const [, username, password, host, port, database] = uriMatch;

    // 使用mongodump备份
    const dumpCmd = `mongodump --host ${host} --port ${port} --username ${username} --password ${password} --authenticationDatabase admin --db ${database} --out "${dbPath}"`;
    
    try {
      const { stdout, stderr } = await execAsync(dumpCmd);
      
      // 检查是否真的成功
      if (stderr && (stderr.includes('not found') || stderr.includes('command not found'))) {
        throw new Error('mongodump 命令不可用');
      }
      
      if (stderr && !stderr.includes('done')) {
        console.warn('⚠️  备份警告:', stderr);
      }
    } catch (error) {
      // 确保抛出异常以触发降级逻辑
      throw new Error(`mongodump 执行失败: ${error.message}`);
    }
  }

  /**
   * 使用 MongoDB 原生驱动备份数据库
   */
  async backupDatabaseWithDriver(dbPath) {
    const mongoose = require('mongoose');
    const connection = userConnection;

    if (!connection || connection.readyState !== 1) {
      throw new Error('数据库未连接');
    }

    // 获取所有集合
    const collections = await connection.db.listCollections().toArray();
    console.log(`📊 找到 ${collections.length} 个集合`);

    // 备份每个集合
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`  备份集合: ${collectionName}`);
      
      try {
        const collection = connection.db.collection(collectionName);
        const documents = await collection.find({}).toArray();
        
        // 保存为 JSON 文件
        const collectionPath = path.join(dbPath, `${collectionName}.json`);
        await fs.writeFile(
          collectionPath,
          JSON.stringify(documents, null, 2),
          'utf8'
        );
        
        console.log(`  ✅ ${collectionName}: ${documents.length} 条记录`);
      } catch (error) {
        console.warn(`  ⚠️  ${collectionName} 备份失败:`, error.message);
      }
    }

    // 保存备份元数据
    const metadata = {
      backupDate: new Date().toISOString(),
      backupMethod: 'native-driver',
      collections: collections.map(c => c.name),
      totalCollections: collections.length
    };
    
    await fs.writeFile(
      path.join(dbPath, '_metadata.json'),
      JSON.stringify(metadata, null, 2),
      'utf8'
    );
  }

  /**
   * 备份上传文件
   */
  async backupFiles(tempPath) {
    console.log('📁 开始备份文件...');
    
    const filesPath = path.join(tempPath, 'files');
    await fs.mkdir(filesPath, { recursive: true });

    try {
      // 备份上传的文件（如果有）
      const uploadsDir = path.join(__dirname, '../uploads');
      try {
        await fs.access(uploadsDir);
        await this.copyDirectory(uploadsDir, path.join(filesPath, 'uploads'));
        console.log('✅ 上传文件备份完成');
      } catch (error) {
        console.log('ℹ️  没有上传文件需要备份');
      }

      return true;
    } catch (error) {
      console.error('❌ 文件备份失败:', error.message);
      throw error;
    }
  }

  /**
   * 备份配置文件
   */
  async backupConfig(tempPath) {
    console.log('⚙️  开始备份配置...');
    
    const configPath = path.join(tempPath, 'config');
    await fs.mkdir(configPath, { recursive: true });

    try {
      // 备份 .env 文件
      const envFile = path.join(__dirname, '../.env');
      try {
        await fs.copyFile(envFile, path.join(configPath, '.env'));
        console.log('✅ .env 文件备份完成');
      } catch (error) {
        console.warn('⚠️  .env 文件不存在');
      }

      // 备份 package.json
      const packageFile = path.join(__dirname, '../package.json');
      await fs.copyFile(packageFile, path.join(configPath, 'package.json'));
      console.log('✅ package.json 备份完成');

      // 保存版本信息
      const versionInfo = {
        version: this.version,
        backupDate: new Date().toISOString(),
        nodeVersion: process.version,
        platform: process.platform
      };
      await fs.writeFile(
        path.join(configPath, 'version.json'),
        JSON.stringify(versionInfo, null, 2)
      );
      console.log('✅ 版本信息保存完成');

      return true;
    } catch (error) {
      console.error('❌ 配置备份失败:', error.message);
      throw error;
    }
  }

  /**
   * 压缩备份文件
   */
  async compressBackup(tempPath, backupId) {
    console.log('🗜️  开始压缩备份...');
    
    const zipPath = path.join(this.backupDir, `${backupId}.zip`);
    
    return new Promise((resolve, reject) => {
      const output = require('fs').createWriteStream(zipPath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // 最高压缩级别
      });

      output.on('close', () => {
        const size = archive.pointer();
        console.log(`✅ 备份压缩完成，大小: ${(size / 1024 / 1024).toFixed(2)} MB`);
        resolve({ zipPath, size });
      });

      archive.on('error', (err) => {
        console.error('❌ 压缩失败:', err);
        reject(err);
      });

      archive.pipe(output);
      archive.directory(tempPath, false);
      archive.finalize();
    });
  }

  /**
   * 创建完整备份
   */
  async createBackup(type = 'manual', userId = null, description = '') {
    this.initModels();
    
    const backupId = this.generateBackupId();
    const tempPath = path.join(this.tempDir, backupId);

    console.log('\n' + '='.repeat(60));
    console.log('🚀 开始创建备份');
    console.log('='.repeat(60));
    console.log(`备份ID: ${backupId}`);
    console.log(`类型: ${type}`);
    console.log(`版本: ${this.version}`);

    // 创建备份记录
    const backup = new this.Backup({
      backupId,
      version: this.version,
      type,
      status: 'running',
      filePath: `${backupId}.zip`,
      description,
      createdBy: userId
    });
    await backup.save();

    try {
      // 1. 检查磁盘空间
      await this.checkDiskSpace();

      // 2. 创建临时目录
      await fs.mkdir(tempPath, { recursive: true });

      // 3. 备份数据库
      await this.backupDatabase(tempPath);

      // 4. 备份文件
      await this.backupFiles(tempPath);

      // 5. 备份配置
      await this.backupConfig(tempPath);

      // 6. 备份后端代码
      await this.backupServerCode(tempPath);

      // 7. 备份前端代码
      await this.backupClientCode(tempPath);

      // 8. 压缩打包
      const { size } = await this.compressBackup(tempPath, backupId);

      // 9. 更新备份记录
      backup.status = 'completed';
      backup.size = size;
      await backup.save();

      // 10. 清理临时文件
      await this.cleanupTemp(tempPath);

      console.log('='.repeat(60));
      console.log('✅ 备份创建成功');
      console.log('='.repeat(60) + '\n');

      return backup;
    } catch (error) {
      console.error('❌ 备份失败:', error);
      
      // 更新备份记录为失败
      backup.status = 'failed';
      backup.error = error.message;
      await backup.save();

      // 清理临时文件
      await this.cleanupTemp(tempPath);

      throw error;
    }
  }

  /**
   * 获取备份列表
   */
  async getBackups() {
    this.initModels();
    return await this.Backup.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username email')
      .lean();
  }

  /**
   * 删除备份
   */
  async deleteBackup(backupId) {
    this.initModels();
    const backup = await this.Backup.findOne({ backupId });
    if (!backup) {
      throw new Error('备份不存在');
    }

    // 删除备份文件
    const filePath = path.join(this.backupDir, backup.filePath);
    try {
      await fs.unlink(filePath);
      console.log(`✅ 删除备份文件: ${backup.filePath}`);
    } catch (error) {
      console.warn(`⚠️  备份文件不存在: ${backup.filePath}`);
    }

    // 删除数据库记录
    await this.Backup.deleteOne({ backupId });
    console.log(`✅ 删除备份记录: ${backupId}`);

    return true;
  }

  /**
   * 清理旧备份
   */
  async cleanOldBackups(keepDays = 7) {
    this.initModels();
    console.log(`🧹 清理 ${keepDays} 天前的备份...`);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - keepDays);

    const oldBackups = await this.Backup.find({
      createdAt: { $lt: cutoffDate },
      type: 'auto' // 只清理自动备份
    });

    for (const backup of oldBackups) {
      try {
        await this.deleteBackup(backup.backupId);
      } catch (error) {
        console.error(`❌ 清理备份失败 ${backup.backupId}:`, error.message);
      }
    }

    console.log(`✅ 清理完成，删除了 ${oldBackups.length} 个旧备份`);
    return oldBackups.length;
  }

  /**
   * 备份后端代码
   */
  async backupServerCode(tempPath) {
    console.log('💻 开始备份后端代码...');
    
    const serverPath = path.join(tempPath, 'server');
    await fs.mkdir(serverPath, { recursive: true });

    const serverDir = path.join(__dirname, '..');
    const excludeDirs = ['node_modules', 'backups', 'temp', 'uploads', 'logs'];
    
    try {
      await this.copyDirectorySelective(serverDir, serverPath, excludeDirs);
      console.log('✅ 后端代码备份完成');
      return true;
    } catch (error) {
      console.error('❌ 后端代码备份失败:', error.message);
      throw error;
    }
  }

  /**
   * 备份前端代码
   */
  async backupClientCode(tempPath) {
    console.log('🎨 开始备份前端代码...');
    
    const clientPath = path.join(tempPath, 'client');
    await fs.mkdir(clientPath, { recursive: true });

    // 项目根目录（前端代码在根目录，不是 client 子目录）
    const projectRoot = path.join(__dirname, '../..');
    const excludeDirs = ['node_modules', 'dist', '.git', 'server', 'backups', 'temp'];
    
    try {
      // 备份前端源代码（src 目录和配置文件）
      const srcDir = path.join(projectRoot, 'src');
      try {
        await fs.access(srcDir);
        await this.copyDirectory(srcDir, path.join(clientPath, 'src'));
        console.log('✅ 前端源代码备份完成');
      } catch (error) {
        console.warn('⚠️  前端源代码目录不存在');
      }

      // 备份前端配置文件
      const configFiles = [
        'package.json',
        'package-lock.json',
        'vite.config.ts',
        'tsconfig.json',
        'tsconfig.node.json',
        'tailwind.config.js',
        'index.html',
        '.gitignore'
      ];

      for (const file of configFiles) {
        const filePath = path.join(projectRoot, file);
        try {
          await fs.access(filePath);
          await fs.copyFile(filePath, path.join(clientPath, file));
        } catch (error) {
          // 文件不存在，跳过
        }
      }
      console.log('✅ 前端配置文件备份完成');

      // 备份前端构建文件（如果存在）
      const distDir = path.join(projectRoot, 'dist');
      try {
        await fs.access(distDir);
        await this.copyDirectory(distDir, path.join(clientPath, 'dist'));
        console.log('✅ 前端构建文件备份完成');
      } catch (error) {
        console.warn('⚠️  前端构建文件不存在，跳过');
      }
    } catch (error) {
      console.error('❌ 前端代码备份失败:', error.message);
      throw error;
    }
    
    return true;
  }

  /**
   * 选择性复制目录（排除指定目录）
   */
  async copyDirectorySelective(src, dest, excludeDirs = []) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      // 跳过排除的目录
      if (excludeDirs.includes(entry.name)) {
        continue;
      }

      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectorySelective(srcPath, destPath, excludeDirs);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * 复制目录
   */
  async copyDirectory(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * 清理临时文件
   */
  async cleanupTemp(tempPath) {
    try {
      await fs.rm(tempPath, { recursive: true, force: true });
      console.log('🧹 临时文件清理完成');
    } catch (error) {
      console.warn('⚠️  临时文件清理失败:', error.message);
    }
  }
}

module.exports = new BackupService();
