const mongoose = require('mongoose');
const { encryptPassword, decryptPassword, isEncrypted } = require('../utils/encryption');

/**
 * 数据库连接管理器
 * 统一管理用户数据库和查询数据库的连接
 */
class DatabaseManager {
  constructor() {
    this.userConnection = null;
    this.queryConnections = new Map();
    this.connectionOptions = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true,
      bufferCommands: false,
    };
  }

  /**
   * 构建 MongoDB 连接字符串
   * @param {Object} config - 数据库配置
   * @returns {String} MongoDB URI
   */
  buildMongoURI(config) {
    const { host, port, username, password, database, authSource } = config;
    
    // 如果密码已加密，需要解密
    let decryptedPassword = password;
    if (password && isEncrypted(password)) {
      try {
        console.log('🔓 检测到加密密码，正在解密...');
        decryptedPassword = decryptPassword(password);
      } catch (error) {
        console.error('❌ 密码解密失败:', error.message);
        decryptedPassword = password;
      }
    }
    
    // 构建连接字符串
    if (username && decryptedPassword) {
      // 如果有用户名和密码，添加 authSource 参数（默认为 admin）
      const auth = authSource || 'admin';
      return `mongodb://${username}:${encodeURIComponent(decryptedPassword)}@${host}:${port}/${database}?authSource=${auth}`;
    }
    return `mongodb://${host}:${port}/${database}`;
  }

  /**
   * 连接用户数据库
   * @param {Object} config - 数据库配置
   * @returns {Promise<Object>} 连接结果
   */
  async connectUserDatabase(config) {
    try {
      // 如果已有连接，先关闭
      if (this.userConnection) {
        console.log('🔄 关闭现有用户数据库连接...');
        await this.userConnection.close();
      }

      const uri = this.buildMongoURI(config);
      console.log(`🔄 正在连接用户数据库: ${config.host}:${config.port}/${config.database}`);
      
      this.userConnection = mongoose.createConnection(uri, this.connectionOptions);

      // 等待连接成功或失败
      await new Promise((resolve, reject) => {
        this.userConnection.once('connected', resolve);
        this.userConnection.once('error', reject);
        setTimeout(() => reject(new Error('连接超时')), 30000);
      });

      console.log('✅ 用户数据库连接成功');
      
      // 设置事件监听
      this.userConnection.on('error', (err) => {
        console.error('❌ 用户数据库连接错误:', err.message);
      });

      this.userConnection.on('disconnected', () => {
        console.warn('⚠️  用户数据库连接断开');
      });

      return { success: true, message: '用户数据库连接成功' };
    } catch (error) {
      console.error('❌ 用户数据库连接失败:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 从 URI 连接用户数据库（用于环境变量配置）
   * @param {String} uri - MongoDB 连接字符串
   * @returns {Promise<Object>} 连接结果
   */
  async connectUserDatabaseFromURI(uri) {
    try {
      // 如果已有连接，先关闭
      if (this.userConnection) {
        console.log('🔄 关闭现有用户数据库连接...');
        await this.userConnection.close();
      }

      console.log('🔄 正在从 URI 连接用户数据库...');
      
      this.userConnection = mongoose.createConnection(uri, this.connectionOptions);

      // 等待连接成功或失败
      await new Promise((resolve, reject) => {
        this.userConnection.once('connected', resolve);
        this.userConnection.once('error', reject);
        setTimeout(() => reject(new Error('连接超时')), 30000);
      });

      console.log('✅ 用户数据库连接成功');
      
      // 设置事件监听
      this.userConnection.on('error', (err) => {
        console.error('❌ 用户数据库连接错误:', err.message);
      });

      this.userConnection.on('disconnected', () => {
        console.warn('⚠️  用户数据库连接断开');
      });

      return { success: true, message: '用户数据库连接成功' };
    } catch (error) {
      console.error('❌ 用户数据库连接失败:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 连接查询数据库
   * @param {Object} config - 数据库配置
   * @returns {Promise<Object>} 连接结果
   */
  async connectQueryDatabase(config) {
    try {
      // 如果已有连接，先关闭
      const existingConn = this.queryConnections.get(config.id);
      if (existingConn) {
        console.log(`🔄 关闭现有查询数据库连接: ${config.name}`);
        await existingConn.close();
      }

      const uri = this.buildMongoURI(config);
      console.log(`🔄 正在连接查询数据库: ${config.name} (${config.host}:${config.port}/${config.database})`);
      
      const connection = mongoose.createConnection(uri, this.connectionOptions);

      // 等待连接成功或失败
      await new Promise((resolve, reject) => {
        connection.once('connected', resolve);
        connection.once('error', reject);
        setTimeout(() => reject(new Error('连接超时')), 30000);
      });

      this.queryConnections.set(config.id, connection);
      console.log(`✅ 查询数据库 [${config.name}] 连接成功`);
      
      // 设置事件监听
      connection.on('error', (err) => {
        console.error(`❌ 查询数据库 [${config.name}] 连接错误:`, err.message);
      });

      connection.on('disconnected', () => {
        console.warn(`⚠️  查询数据库 [${config.name}] 连接断开`);
      });

      return { success: true, message: `查询数据库 [${config.name}] 连接成功` };
    } catch (error) {
      console.error(`❌ 查询数据库 [${config.name}] 连接失败:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 测试数据库连接
   * @param {Object} config - 数据库配置
   * @returns {Promise<Object>} 测试结果
   */
  async testConnection(config) {
    let testConn = null;
    try {
      const uri = this.buildMongoURI(config);
      console.log(`🧪 测试数据库连接: ${config.host}:${config.port}/${config.database}`);
      
      testConn = mongoose.createConnection(uri, {
        ...this.connectionOptions,
        serverSelectionTimeoutMS: 10000
      });

      // 等待连接成功或失败
      await new Promise((resolve, reject) => {
        testConn.once('connected', resolve);
        testConn.once('error', reject);
        setTimeout(() => reject(new Error('连接超时')), 10000);
      });

      console.log('✅ 数据库连接测试成功');
      await testConn.close();
      
      return { success: true, message: '连接测试成功' };
    } catch (error) {
      console.error('❌ 数据库连接测试失败:', error.message);
      if (testConn) {
        try {
          await testConn.close();
        } catch (closeError) {
          // 忽略关闭错误
        }
      }
      return { success: false, message: error.message };
    }
  }

  /**
   * 从 SystemConfig 初始化所有连接
   * @returns {Promise<Object>} 初始化结果
   */
  async initializeFromConfig() {
    try {
      console.log('🚀 开始初始化数据库连接...');
      
      // 首先使用 .env 连接到用户数据库以读取配置
      const defaultURI = process.env.USER_MONGO_URI;
      if (!defaultURI) {
        throw new Error('USER_MONGO_URI 未在 .env 中配置');
      }

      console.log('🔄 使用默认配置连接用户数据库...');
      this.userConnection = mongoose.createConnection(defaultURI, this.connectionOptions);
      
      await new Promise((resolve, reject) => {
        this.userConnection.once('connected', resolve);
        this.userConnection.once('error', reject);
        setTimeout(() => reject(new Error('连接超时')), 30000);
      });

      console.log('✅ 使用默认配置连接用户数据库成功');

      // 设置事件监听
      this.userConnection.on('error', (err) => {
        console.error('❌ 用户数据库连接错误:', err.message);
      });

      this.userConnection.on('disconnected', () => {
        console.warn('⚠️  用户数据库连接断开');
      });

      // 尝试读取 SystemConfig
      try {
        // 动态加载 SystemConfig 模型
        const SystemConfigSchema = require('../models/SystemConfig').schema;
        const SystemConfig = this.userConnection.model('SystemConfig', SystemConfigSchema);
        
        const config = await SystemConfig.findOne();

        if (config && config.databases) {
          console.log('📝 发现数据库配置，检查是否需要重新连接...');
          
          // 如果有配置的用户数据库且与默认不同，重新连接
          if (config.databases.user && config.databases.user.enabled) {
            const configuredURI = this.buildMongoURI(config.databases.user);
            if (configuredURI !== defaultURI) {
              console.log('🔄 使用配置的用户数据库重新连接...');
              await this.connectUserDatabase(config.databases.user);
            } else {
              console.log('✅ 配置的用户数据库与默认相同，无需重新连接');
            }
          }

          // 连接所有启用的查询数据库
          if (config.databases.query && Array.isArray(config.databases.query)) {
            console.log(`🔄 发现 ${config.databases.query.length} 个查询数据库配置`);
            for (const queryDB of config.databases.query) {
              if (queryDB.enabled) {
                await this.connectQueryDatabase(queryDB);
              } else {
                console.log(`⏭️  跳过未启用的查询数据库: ${queryDB.name}`);
              }
            }
          }
        } else {
          console.log('ℹ️  未找到数据库配置，使用默认配置');
        }
      } catch (configError) {
        console.warn('⚠️  读取数据库配置失败，使用默认配置:', configError.message);
      }

      console.log('✅ 数据库初始化完成');
      return { success: true };
    } catch (error) {
      console.error('❌ 数据库初始化失败:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取用户数据库连接
   * @returns {Connection} Mongoose 连接对象
   */
  getUserConnection() {
    if (!this.userConnection) {
      throw new Error('用户数据库未连接');
    }
    return this.userConnection;
  }

  /**
   * 获取查询数据库连接
   * @param {String} id - 数据库ID
   * @returns {Connection} Mongoose 连接对象
   */
  getQueryConnection(id) {
    const connection = this.queryConnections.get(id);
    if (!connection) {
      throw new Error(`查询数据库 [${id}] 未连接`);
    }
    return connection;
  }

  /**
   * 获取所有查询数据库连接
   * @returns {Array<Connection>} 连接对象数组
   */
  getAllQueryConnections() {
    return Array.from(this.queryConnections.values());
  }

  /**
   * 获取所有查询数据库信息
   * @returns {Array<Object>} 数据库信息数组
   */
  getQueryDatabasesInfo() {
    const info = [];
    for (const [id, connection] of this.queryConnections.entries()) {
      info.push({
        id,
        name: connection.name,
        readyState: connection.readyState,
        host: connection.host,
        port: connection.port
      });
    }
    return info;
  }

  /**
   * 关闭所有数据库连接
   * @returns {Promise<void>}
   */
  async closeAll() {
    console.log('🔄 关闭所有数据库连接...');
    
    // 关闭用户数据库
    if (this.userConnection) {
      await this.userConnection.close();
      console.log('✅ 用户数据库连接已关闭');
    }

    // 关闭所有查询数据库
    for (const [id, connection] of this.queryConnections.entries()) {
      await connection.close();
      console.log(`✅ 查询数据库 [${id}] 连接已关闭`);
    }
    
    this.queryConnections.clear();
    console.log('✅ 所有数据库连接已关闭');
  }
}

// 单例模式
const dbManager = new DatabaseManager();

module.exports = dbManager;
