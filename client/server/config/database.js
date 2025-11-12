const dbManager = require('./databaseManager');

/**
 * 数据库连接模块
 * 使用 DatabaseManager 统一管理所有数据库连接
 * 
 * 配置说明：
 * - 所有数据库配置统一在 .env 文件中管理
 * - USER_MONGO_URI: 用户数据库连接字符串
 * - QUERY_MONGO_URIS: 查询数据库连接字符串（多个用逗号分隔）
 * 
 * 兼容性说明：
 * - 保持原有的 userConnection 和 queryConnection 导出
 * - 新代码应该使用 dbManager 直接获取连接
 * - 旧代码可以继续使用 userConnection 和 queryConnection
 */

// 初始化数据库连接
async function initializeDatabase() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🔄 正在初始化数据库连接...');
    console.log('='.repeat(60));
    
    // 从环境变量初始化所有数据库连接
    const result = await dbManager.initializeFromEnv();
    
    if (result.success) {
      console.log('✅ 数据库初始化成功');
      
      // 显示连接信息
      const userConn = dbManager.getUserConnection();
      if (userConn) {
        console.log(`  📦 用户数据库: ${userConn.name} (${userConn.host}:${userConn.port})`);
        console.log(`     连接状态: ${userConn.readyState === 1 ? '已连接' : '未连接'}`);
      }
      
      const queryConns = dbManager.getAllQueryConnections();
      if (queryConns.length > 0) {
        console.log(`  📦 查询数据库: ${queryConns.length} 个`);
        queryConns.forEach((conn, index) => {
          console.log(`     ${index + 1}. ${conn.name} (${conn.host}:${conn.port})`);
          console.log(`        连接状态: ${conn.readyState === 1 ? '已连接' : '未连接'}`);
        });
      } else {
        console.log('  ⚠️  未配置查询数据库');
        console.log('  💡 请在 .env 文件中配置查询数据库：');
        console.log('     QUERY_MONGO_URIS=mongodb://localhost:27017/db1,mongodb://localhost:27017/db2');
      }
    } else {
      console.warn('⚠️  数据库初始化失败');
      console.warn(`  原因: ${result.message}`);
    }
    
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('❌ 数据库初始化错误:', error.message);
  }
}

// 立即初始化
initializeDatabase().catch(err => {
  console.error('数据库初始化失败:', err);
});

// 导出兼容接口
module.exports = {
  // 新接口：直接使用 dbManager
  dbManager,
  
  // 兼容接口：保持原有的导出方式
  get userConnection() {
    return dbManager.getUserConnection();
  },
  
  get queryConnection() {
    // 返回第一个查询数据库连接（兼容旧代码）
    const queryConns = dbManager.getAllQueryConnections();
    return queryConns.length > 0 ? queryConns[0] : null;
  },
  
  // 初始化函数（供外部调用）
  initializeDatabase
};
