const { userConnection } = require('../config/database');
const SystemVersionModel = require('../models/SystemVersion');
const semver = require('semver');

class VersionService {
  constructor() {
    this.currentVersion = require('../package.json').version;
    this.SystemVersion = null;
  }
  
  // 初始化模型
  initModels() {
    if (!this.SystemVersion) {
      this.SystemVersion = SystemVersionModel(userConnection);
    }
  }

  /**
   * 获取当前版本
   */
  getCurrentVersion() {
    return this.currentVersion;
  }

  /**
   * 获取版本历史
   */
  async getVersionHistory() {
    this.initModels();
    return await this.SystemVersion.find()
      .sort({ releaseDate: -1 })
      .lean();
  }

  /**
   * 获取当前版本信息
   */
  async getCurrentVersionInfo() {
    this.initModels();
    let versionInfo = await this.SystemVersion.findOne({ version: this.currentVersion });
    
    if (!versionInfo) {
      // 如果数据库中没有当前版本信息，创建一个
      versionInfo = await this.SystemVersion.create({
        version: this.currentVersion,
        releaseDate: new Date(),
        changelog: '当前运行版本',
        isCurrent: true
      });
    }

    return versionInfo;
  }

  /**
   * 比较版本
   */
  compareVersions(v1, v2) {
    return semver.compare(v1, v2);
  }

  /**
   * 检查是否有新版本
   */
  isNewerVersion(targetVersion) {
    return semver.gt(targetVersion, this.currentVersion);
  }

  /**
   * 更新版本信息
   */
  async updateVersion(version, data) {
    this.initModels();
    // 将所有版本的 isCurrent 设为 false
    await this.SystemVersion.updateMany({}, { isCurrent: false });

    // 创建或更新版本信息
    const versionInfo = await this.SystemVersion.findOneAndUpdate(
      { version },
      {
        ...data,
        version,
        isCurrent: true
      },
      { upsert: true, new: true }
    );

    // 更新 package.json 中的版本号
    this.currentVersion = version;

    return versionInfo;
  }

  /**
   * 初始化版本信息
   */
  async initVersion() {
    this.initModels();
    const existing = await this.SystemVersion.findOne({ version: this.currentVersion });
    
    if (!existing) {
      await this.SystemVersion.create({
        version: this.currentVersion,
        releaseDate: new Date(),
        changelog: '初始版本',
        features: [
          '用户管理系统',
          '积分系统',
          '推荐系统',
          '充值系统',
          '提现系统',
          '搜索功能',
          '工单系统',
          '邮件系统'
        ],
        isCurrent: true
      });
      console.log(`✅ 初始化版本信息: v${this.currentVersion}`);
    }
  }
}

module.exports = new VersionService();
