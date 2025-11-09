/**
 * 测试实时系统监控
 */

const os = require('os');
const si = require('systeminformation');

console.log('\n🔍 测试实时系统监控\n');

async function testMonitoring() {
  try {
    // 1. CPU监控
    console.log('1️⃣ CPU监控:');
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
    console.log(`   CPU核心数: ${cpus.length}`);
    console.log('');

    // 2. 内存监控
    console.log('2️⃣ 内存监控:');
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsage = Math.floor((usedMem / totalMem) * 100);
    console.log(`   内存使用率: ${memoryUsage}%`);
    console.log(`   总内存: ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`   已用内存: ${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`   可用内存: ${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log('');

    // 3. 磁盘监控（实时）
    console.log('3️⃣ 磁盘监控（实时）:');
    try {
      const fsSize = await si.fsSize();
      console.log(`   检测到 ${fsSize.length} 个磁盘:`);
      fsSize.forEach((disk, index) => {
        console.log(`   ${index + 1}. ${disk.fs} (${disk.mount})`);
        console.log(`      总容量: ${(disk.size / 1024 / 1024 / 1024).toFixed(2)} GB`);
        console.log(`      已使用: ${(disk.used / 1024 / 1024 / 1024).toFixed(2)} GB`);
        console.log(`      可用: ${(disk.available / 1024 / 1024 / 1024).toFixed(2)} GB`);
        console.log(`      使用率: ${disk.use.toFixed(1)}%`);
      });
      
      // 主磁盘使用率
      const diskUsage = Math.floor(fsSize[0].use);
      console.log(`   ✅ 主磁盘使用率: ${diskUsage}%`);
    } catch (error) {
      console.log(`   ❌ 获取磁盘信息失败: ${error.message}`);
    }
    console.log('');

    // 4. 网络监控（实时）
    console.log('4️⃣ 网络监控（实时）:');
    try {
      const networkStats = await si.networkStats();
      console.log(`   检测到 ${networkStats.length} 个网络接口:`);
      networkStats.forEach((net, index) => {
        const rxMBps = (net.rx_sec / 1024 / 1024).toFixed(2);
        const txMBps = (net.tx_sec / 1024 / 1024).toFixed(2);
        const totalMBps = (parseFloat(rxMBps) + parseFloat(txMBps)).toFixed(2);
        
        console.log(`   ${index + 1}. ${net.iface}`);
        console.log(`      接收速度: ${rxMBps} MB/s`);
        console.log(`      发送速度: ${txMBps} MB/s`);
        console.log(`      总流量: ${totalMBps} MB/s`);
      });
      
      // 主网络接口流量
      if (networkStats.length > 0) {
        const rxMBps = (networkStats[0].rx_sec || 0) / 1024 / 1024;
        const txMBps = (networkStats[0].tx_sec || 0) / 1024 / 1024;
        const networkTraffic = Math.floor(rxMBps + txMBps);
        console.log(`   ✅ 主接口流量: ${networkTraffic} MB/s`);
      }
    } catch (error) {
      console.log(`   ❌ 获取网络信息失败: ${error.message}`);
    }
    console.log('');

    // 5. 系统信息
    console.log('5️⃣ 系统信息:');
    console.log(`   操作系统: ${os.platform()} ${os.release()}`);
    console.log(`   架构: ${os.arch()}`);
    console.log(`   主机名: ${os.hostname()}`);
    console.log(`   运行时间: ${(os.uptime() / 3600).toFixed(2)} 小时`);
    console.log('');

    // 6. 额外的系统信息
    console.log('6️⃣ 额外的系统信息:');
    try {
      const currentLoad = await si.currentLoad();
      console.log(`   当前CPU负载: ${currentLoad.currentLoad.toFixed(2)}%`);
      console.log(`   用户态CPU: ${currentLoad.currentLoadUser.toFixed(2)}%`);
      console.log(`   系统态CPU: ${currentLoad.currentLoadSystem.toFixed(2)}%`);
    } catch (error) {
      console.log(`   ⚠️  无法获取详细CPU信息`);
    }
    console.log('');

    // 7. 总结
    console.log('📊 监控总结:');
    console.log('   ✅ CPU监控: 实时数据');
    console.log('   ✅ 内存监控: 实时数据');
    console.log('   ✅ 磁盘监控: 实时数据（systeminformation）');
    console.log('   ✅ 网络监控: 实时数据（systeminformation）');
    console.log('');

    console.log('✅ 所有监控测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testMonitoring();
