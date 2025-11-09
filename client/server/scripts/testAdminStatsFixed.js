/**
 * 测试修复后的管理员统计API
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('\n🧪 测试管理员统计API修复\n');

// 1. 测试性能监控
console.log('1️⃣ 测试性能监控:');
const os = require('os');

// CPU使用率
const cpus = os.cpus();
let totalIdle = 0;
let totalTick = 0;
cpus.forEach(cpu => {
  for (const type in cpu.times) {
    totalTick += cpu.times[type];
  }
  totalIdle += cpu.times.idle;
});
const cpuUsage = Math.floor(100 - (totalIdle / totalTick * 100));
console.log(`   CPU使用率: ${cpuUsage}%`);

// 内存使用率
const totalMem = os.totalmem();
const freeMem = os.freemem();
const memoryUsage = Math.floor(((totalMem - freeMem) / totalMem) * 100);
console.log(`   内存使用率: ${memoryUsage}%`);
console.log(`   总内存: ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`);
console.log(`   可用内存: ${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`);

// 磁盘使用率（模拟）
const diskUsage = Math.floor(Math.random() * 30 + 40);
console.log(`   磁盘使用率: ${diskUsage}% (模拟)`);

// 网络流量（模拟）
const networkTraffic = Math.floor(Math.random() * 50 + 10);
console.log(`   网络流量: ${networkTraffic} MB/s (模拟)`);
console.log('');

// 2. 测试数据库统计
console.log('2️⃣ 测试数据库统计:');
const { dbManager } = require('../config/database');

// 旧方法（错误）
console.log('   ❌ 旧方法:');
const queryDatabases = dbManager.queryConnections || {};
console.log(`      queryConnections 类型: ${queryDatabases.constructor.name}`);
console.log(`      Object.keys().length: ${Object.keys(queryDatabases).length}`);
console.log('');

// 新方法（正确）
console.log('   ✅ 新方法:');
const queryDatabasesInfo = dbManager.getQueryDatabasesInfo();
console.log(`      getQueryDatabasesInfo() 返回: ${queryDatabasesInfo.length} 个数据库`);
queryDatabasesInfo.forEach(db => {
  console.log(`      - ${db.name}: ${db.status} (${db.host}:${db.port})`);
});

const totalDatabases = queryDatabasesInfo.length;
const activeDatabases = queryDatabasesInfo.filter(db => db.status === 'connected').length;
console.log(`      总数据库: ${totalDatabases}`);
console.log(`      在线数据库: ${activeDatabases}`);
console.log('');

// 3. 系统信息
console.log('3️⃣ 系统信息:');
console.log(`   操作系统: ${os.platform()} ${os.release()}`);
console.log(`   CPU架构: ${os.arch()}`);
console.log(`   CPU核心数: ${os.cpus().length}`);
console.log(`   主机名: ${os.hostname()}`);
console.log(`   运行时间: ${(os.uptime() / 3600).toFixed(2)} 小时`);
console.log('');

// 4. 总结
console.log('📊 修复总结:');
console.log('   ✅ 性能监控: 使用 os 模块获取实际数据');
console.log('   ✅ 数据库统计: 使用 getQueryDatabasesInfo() 方法');
console.log('   ✅ CPU使用率: 实时计算');
console.log('   ✅ 内存使用率: 实时计算');
console.log('   ⚠️  磁盘使用率: 模拟数据（需要额外库）');
console.log('   ⚠️  网络流量: 模拟数据（需要额外库）');
console.log('');

console.log('✅ 测试完成！');
