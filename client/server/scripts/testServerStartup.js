/**
 * 测试服务器启动逻辑
 * 验证数据库管理器集成是否正常工作
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testServerStartup() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 测试服务器启动逻辑');
  console.log('='.repeat(60));

  try {
    // 测试1: 导入数据库模块
    console.log('\n📝 测试1: 导入数据库模块');
    console.log('-'.repeat(60));
    const { dbManager, initializeDatabase } = require('../config/database');
    console.log('✅ 数据库模块导入成功');

    // 等待初始化完成
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 测试2: 检查用户数据库连接
    console.log('\n📝 测试2: 检查用户数据库连接');
    console.log('-'.repeat(60));
    const userConn = dbManager.getUserConnection();
    if (userConn) {
      console.log('✅ 用户数据库连接正常');
      console.log(`   连接状态: ${userConn.readyState} (1=已连接)`);
      console.log(`   数据库名: ${userConn.name}`);
      console.log(`   主机: ${userConn.host}`);
      console.log(`   端口: ${userConn.port}`);
    } else {
      console.log('❌ 用户数据库未连接');
    }

    // 测试3: 检查查询数据库连接
    console.log('\n📝 测试3: 检查查询数据库连接');
    console.log('-'.repeat(60));
    const queryConns = dbManager.getAllQueryConnections();
    if (queryConns.length > 0) {
      console.log(`✅ 发现 ${queryConns.length} 个查询数据库连接`);
      queryConns.forEach((conn, index) => {
        console.log(`   ${index + 1}. ${conn.name} (${conn.host}:${conn.port}) - 状态: ${conn.readyState}`);
      });
    } else {
      console.log('ℹ️  未配置查询数据库');
    }

    // 测试4: 测试健康检查数据
    console.log('\n📝 测试4: 测试健康检查数据');
    console.log('-'.repeat(60));
    
    const userDbStatus = userConn ? {
      connected: userConn.readyState === 1,
      readyState: userConn.readyState,
      name: userConn.name,
      host: userConn.host,
      port: userConn.port
    } : {
      connected: false,
      message: '未配置用户数据库'
    };
    
    const queryDbStatus = queryConns.map(conn => ({
      id: conn.id,
      name: conn.name,
      connected: conn.readyState === 1,
      readyState: conn.readyState,
      host: conn.host,
      port: conn.port
    }));
    
    const isHealthy = userDbStatus.connected && 
                     (queryConns.length === 0 || queryDbStatus.every(q => q.connected));
    
    console.log('健康检查结果:');
    console.log(`  整体状态: ${isHealthy ? '✅ 健康' : '❌ 异常'}`);
    console.log(`  用户数据库: ${userDbStatus.connected ? '✅ 已连接' : '❌ 未连接'}`);
    console.log(`  查询数据库: ${queryDbStatus.length} 个`);

    // 测试5: 测试优雅关闭
    console.log('\n📝 测试5: 测试优雅关闭');
    console.log('-'.repeat(60));
    console.log('🔄 关闭所有数据库连接...');
    await dbManager.closeAll();
    console.log('✅ 所有连接已关闭');

    console.log('\n' + '='.repeat(60));
    console.log('✅ 所有测试完成');
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行测试
testServerStartup();
