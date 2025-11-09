const dbManager = require('./databaseManager');

/**
 * 数据库连接模块
 * 使用 DatabaseManager 统一管理所有数据库连接
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
    
    // 从 SystemConfig 初始化所有数据库连接
    const result = await dbManager.initializeFromConfig();
    
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
        console.log('  💡 请在管理员后台配置查询数据库：');
        console.log('     1. 登录管理员后台');
        console.log('     2. 进入"系统设置" -> "数据库配置"');
        console.log('     3. 添加查询数据库并保存');
        console.log('     4. 重启服务器');
      }
    } else {
      console.warn('⚠️  数据库初始化失败，使用默认配置');
      console.warn(`  原因: ${result.message}`);
    }
    
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('❌ 数据库初始化错误:', error.message);
    console.error('   将尝试使用环境变量配置...');
    
    // 如果从 SystemConfig 初始化失败，尝试使用环境变量
    if (process.env.USER_MONGO_URI) {
      try {
        await dbManager.connectUserDatabaseFromURI(process.env.USER_MONGO_URI);
        console.log('✅ 使用环境变量连接用户数据库成功');
      } catch (envError) {
        console.error('❌ 使用环境变量连接失败:', envError.message);
      }
    }
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
