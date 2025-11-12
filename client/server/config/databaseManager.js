const mongoose = require('mongoose');

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
   * 从环境变量初始化所有连接
   * @returns {Promise<Object>} 初始化结果
   */
  async initializeFromEnv() {
    try {
      console.log('🚀 开始从环境变量初始化数据库连接...');
      
      // 连接用户数据库
      const userURI = process.env.USER_MONGO_URI;
      if (!userURI) {
        throw new Error('USER_MONGO_URI 未在 .env 中配置');
      }

      console.log('🔄 连接用户数据库...');
      this.userConnection = mongoose.createConnection(userURI, this.connectionOptions);
      
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

      // 连接查询数据库（如果配置了）
      const queryURIs = process.env.QUERY_MONGO_URIS;
      if (queryURIs) {
        const uriList = queryURIs.split(',').map(uri => uri.trim()).filter(uri => uri);
        
        if (uriList.length > 0) {
          console.log(`🔄 发现 ${uriList.length} 个查询数据库配置`);
          
          for (let i = 0; i < uriList.length; i++) {
            const uri = uriList[i];
            const id = `query_${i + 1}`;
            
            try {
              console.log(`🔄 正在连接查询数据库 ${i + 1}...`);
              const connection = mongoose.createConnection(uri, this.connectionOptions);
              
              await new Promise((resolve, reject) => {
                connection.once('connected', resolve);
                connection.once('error', reject);
                setTimeout(() => reject(new Error('连接超时')), 30000);
              });
              
              this.queryConnections.set(id, connection);
              console.log(`✅ 查询数据库 ${i + 1} [${connection.name}] 连接成功`);
              
              // 设置事件监听
              connection.on('error', (err) => {
                console.error(`❌ 查询数据库 ${i + 1} 连接错误:`, err.message);
              });

              connection.on('disconnected', () => {
                console.warn(`⚠️  查询数据库 ${i + 1} 连接断开`);
              });
            } catch (error) {
              console.error(`❌ 查询数据库 ${i + 1} 连接失败:`, error.message);
            }
          }
        }
      } else {
        console.log('ℹ️  未配置查询数据库（QUERY_MONGO_URIS）');
      }

      console.log('✅ 数据库初始化完成');
      return { success: true };
    } catch (error) {
      console.error('❌ 数据库初始化失败:', error.message);
      return { success: false, message: error.message };
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
