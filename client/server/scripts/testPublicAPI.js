const http = require('http');

async function testPublicAPI() {
  console.log('🧪 测试公开配置API\n');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/system-config/public-config',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('📡 API响应状态:', res.statusCode);
        console.log('-----------------------------------');
        
        try {
          const result = JSON.parse(data);
          console.log('返回数据:');
          console.log(JSON.stringify(result, null, 2));
          
          if (result.success && result.data) {
            console.log('\n✅ API工作正常');
            console.log(`余额提现最低金额: $${result.data.withdraw?.minWithdrawAmountBalance || '未设置'}`);
            console.log(`USDT提现最低金额: $${result.data.withdraw?.minWithdrawAmount || '未设置'}`);
          } else {
            console.log('\n❌ API返回失败');
          }
          
          resolve(result);
        } catch (error) {
          console.error('❌ 解析响应失败:', error);
          console.log('原始响应:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ 请求失败:', error.message);
      console.log('\n💡 提示: 请确保服务器正在运行 (npm start)');
      reject(error);
    });

    req.end();
  });
}

testPublicAPI().catch(() => process.exit(1));
