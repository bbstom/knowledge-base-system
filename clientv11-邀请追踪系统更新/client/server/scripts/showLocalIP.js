/**
 * 显示本机IP地址
 * 用于配置BEpusdt Webhook或局域网访问
 */

const os = require('os');

function getNetworkInterfaces() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // 跳过内部地址
      if (iface.internal) continue;
      
      addresses.push({
        name,
        family: iface.family,
        address: iface.address,
        netmask: iface.netmask
      });
    }
  }
  
  return addresses;
}

console.log('🌐 本机网络接口信息\n');
console.log('='.repeat(60));

const interfaces = getNetworkInterfaces();

// IPv4地址
const ipv4 = interfaces.filter(i => i.family === 'IPv4');
if (ipv4.length > 0) {
  console.log('\n📡 IPv4 地址:');
  ipv4.forEach(iface => {
    console.log(`  ${iface.name}: ${iface.address}`);
  });
}

// IPv6地址
const ipv6 = interfaces.filter(i => i.family === 'IPv6');
if (ipv6.length > 0) {
  console.log('\n📡 IPv6 地址:');
  ipv6.forEach(iface => {
    console.log(`  ${iface.name}: ${iface.address}`);
  });
}

console.log('\n' + '='.repeat(60));

// 获取主要的局域网IP
const mainIP = ipv4.find(i => 
  i.address.startsWith('192.168.') || 
  i.address.startsWith('10.') || 
  i.address.startsWith('172.')
);

if (mainIP) {
  const port = process.env.PORT || 3001;
  console.log('\n💡 配置建议:\n');
  console.log('1. 后端服务器地址:');
  console.log(`   http://${mainIP.address}:${port}`);
  console.log('');
  console.log('2. BEpusdt Webhook URL:');
  console.log(`   http://${mainIP.address}:${port}/api/recharge/webhook`);
  console.log('');
  console.log('3. 前端访问地址（如果前端也在本机）:');
  console.log(`   http://${mainIP.address}:5173`);
  console.log('');
  console.log('4. 更新 .env 文件:');
  console.log(`   BACKEND_URL=http://${mainIP.address}:${port}`);
  console.log('');
  console.log('⚠️  注意:');
  console.log('   - 确保防火墙允许端口访问');
  console.log('   - 局域网内的设备可以通过这个IP访问');
  console.log('   - 如果需要公网访问，需要配置端口转发或使用内网穿透');
} else {
  console.log('\n⚠️  未找到局域网IP地址');
  console.log('   可能原因:');
  console.log('   - 未连接到网络');
  console.log('   - 只有回环地址（localhost）');
}

console.log('\n' + '='.repeat(60));
