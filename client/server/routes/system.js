const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const backupService = require('../services/backupService');
const versionService = require('../services/versionService');
const upgradeService = require('../services/upgradeService');
const path = require('path');
const fs = require('fs');

/**
 * 认证中间件
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未登录'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: '认证失败'
    });
  }
};

/**
 * 管理员权限中间件
 */
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }
  next();
};

/**
 * 获取当前版本信息
 * GET /api/system/version
 */
router.get('/version', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const currentVersion = versionService.getCurrentVersion();
    const versionInfo = await versionService.getCurrentVersionInfo();

    res.json({
      success: true,
      data: {
        currentVersion,
        ...versionInfo.toObject()
      }
    });
  } catch (error) {
    console.error('获取版本信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取版本信息失败',
      error: error.message
    });
  }
});

/**
 * 获取版本历史
 * GET /api/system/version/history
 */
router.get('/version/history', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const history = await versionService.getVersionHistory();

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('获取版本历史失败:', error);
    res.status(500).json({
      success: false,
      message: '获取版本历史失败',
      error: error.message
    });
  }
});

/**
 * 创建备份
 * POST /api/system/backup
 */
router.post('/backup', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { description } = req.body;

    console.log(`\n📦 管理员 ${req.user.username} 请求创建备份`);

    const backup = await backupService.createBackup('manual', req.user._id, description);

    res.json({
      success: true,
      message: '备份创建成功',
      data: backup
    });
  } catch (error) {
    console.error('创建备份失败:', error);
    res.status(500).json({
      success: false,
      message: '创建备份失败',
      error: error.message
    });
  }
});

/**
 * 获取备份列表
 * GET /api/system/backups
 */
router.get('/backups', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const backups = await backupService.getBackups();

    res.json({
      success: true,
      data: backups
    });
  } catch (error) {
    console.error('获取备份列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取备份列表失败',
      error: error.message
    });
  }
});

/**
 * 删除备份
 * DELETE /api/system/backup/:backupId
 */
router.delete('/backup/:backupId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { backupId } = req.params;

    console.log(`\n🗑️  管理员 ${req.user.username} 请求删除备份: ${backupId}`);

    await backupService.deleteBackup(backupId);

    res.json({
      success: true,
      message: '备份删除成功'
    });
  } catch (error) {
    console.error('删除备份失败:', error);
    res.status(500).json({
      success: false,
      message: '删除备份失败',
      error: error.message
    });
  }
});

/**
 * 下载备份
 * GET /api/system/backup/:backupId/download
 */
router.get('/backup/:backupId/download', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { backupId } = req.params;
    const { userConnection } = require('../config/database');
    const BackupModel = require('../models/Backup');
    const Backup = BackupModel(userConnection);
    
    const backup = await Backup.findOne({ backupId });
    if (!backup) {
      return res.status(404).json({
        success: false,
        message: '备份不存在'
      });
    }

    const filePath = path.join(__dirname, '../backups', backup.filePath);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: '备份文件不存在'
      });
    }

    console.log(`\n📥 管理员 ${req.user.username} 下载备份: ${backupId}`);

    // 设置响应头
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${backup.filePath}"`);

    // 发送文件
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('下载备份失败:', error);
    res.status(500).json({
      success: false,
      message: '下载备份失败',
      error: error.message
    });
  }
});

/**
 * 清理旧备份
 * POST /api/system/backup/cleanup
 */
router.post('/backup/cleanup', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { keepDays = 7 } = req.body;

    console.log(`\n🧹 管理员 ${req.user.username} 请求清理旧备份（保留${keepDays}天）`);

    const deletedCount = await backupService.cleanOldBackups(keepDays);

    res.json({
      success: true,
      message: `清理完成，删除了 ${deletedCount} 个旧备份`,
      data: { deletedCount }
    });
  } catch (error) {
    console.error('清理备份失败:', error);
    res.status(500).json({
      success: false,
      message: '清理备份失败',
      error: error.message
    });
  }
});

/**
 * 获取系统信息
 * GET /api/system/info
 */
router.get('/info', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const os = require('os');
    
    const systemInfo = {
      version: versionService.getCurrentVersion(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem()
      },
      cpu: os.cpus()[0].model,
      cpuCount: os.cpus().length
    };

    res.json({
      success: true,
      data: systemInfo
    });
  } catch (error) {
    console.error('获取系统信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取系统信息失败',
      error: error.message
    });
  }
});

/**
 * 检查更新
 * GET /api/system/check-update
 */
router.get('/check-update', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log(`\n🔍 管理员 ${req.user.username} 检查系统更新`);

    const updateInfo = await upgradeService.checkUpdate();

    res.json({
      success: true,
      data: updateInfo
    });
  } catch (error) {
    console.error('检查更新失败:', error);
    res.status(500).json({
      success: false,
      message: '检查更新失败',
      error: error.message
    });
  }
});

/**
 * 执行升级
 * POST /api/system/upgrade
 */
router.post('/upgrade', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { targetVersion } = req.body;

    if (!targetVersion) {
      return res.status(400).json({
        success: false,
        message: '请指定目标版本'
      });
    }

    console.log(`\n🚀 管理员 ${req.user.username} 请求升级到 v${targetVersion}`);

    // 异步执行升级（避免请求超时）
    upgradeService.upgrade(targetVersion, req.user._id)
      .then(result => {
        console.log('✅ 升级完成');
      })
      .catch(error => {
        console.error('❌ 升级失败:', error);
      });

    res.json({
      success: true,
      message: '升级任务已启动，请稍后查看升级状态'
    });
  } catch (error) {
    console.error('启动升级失败:', error);
    res.status(500).json({
      success: false,
      message: '启动升级失败',
      error: error.message
    });
  }
});

/**
 * 获取升级历史
 * GET /api/system/upgrade-history
 */
router.get('/upgrade-history', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const history = await upgradeService.getUpgradeHistory();

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('获取升级历史失败:', error);
    res.status(500).json({
      success: false,
      message: '获取升级历史失败',
      error: error.message
    });
  }
});

/**
 * 回滚到指定备份
 * POST /api/system/rollback
 */
router.post('/rollback', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { backupId } = req.body;

    if (!backupId) {
      return res.status(400).json({
        success: false,
        message: '请指定备份ID'
      });
    }

    console.log(`\n🔄 管理员 ${req.user.username} 请求回滚到备份: ${backupId}`);

    // 异步执行回滚（避免请求超时）
    upgradeService.rollback(backupId)
      .then(result => {
        console.log('✅ 回滚完成');
      })
      .catch(error => {
        console.error('❌ 回滚失败:', error);
      });

    res.json({
      success: true,
      message: '回滚任务已启动，请稍后查看结果'
    });
  } catch (error) {
    console.error('启动回滚失败:', error);
    res.status(500).json({
      success: false,
      message: '启动回滚失败',
      error: error.message
    });
  }
});

module.exports = router;
