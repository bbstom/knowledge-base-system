const crypto = require('crypto');

// 模拟PHP的签名算法
function phpSignature(params, token) {
  // 1. 排序参数
  const sorted = Object.keys(params).sort();
  
  // 2. 过滤空值并拼接
  let sign = '';
  for (const key of sorted) {
    const val = params[key];
    // PHP: if ($val == '') continue;
    if (val === '' || val === null || val === undefined) continue;
    // PHP: if ($key != 'signature')
    if (key === 'signature') continue;
    
    if (sign !== '') {
      sign += '&';
    }
    sign += `${key}=${val}`;
  }
  
  // 3. 拼接token
  const stringToSign = sign + token;
  
  // 4. MD5
  const signature = crypto.createHash('md5')
    .update(stringToSign)
    .digest('hex')
    .toLowerCase();
  
  console.log('📋 PHP算法模拟:');
  console.log('  排序后的键:', sorted);
  console.log('  拼接字符串:', sign);
  console.log('  加token后:', stringToSign);
  console.log('  MD5签名:', signature);
  
  return signature;
}

// 我们当前的签名算法
function ourSignature(params, token) {
  const sortedParams = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  
  const stringToSign = sortedParams + token;
  
  const signature = crypto.createHash('md5')
    .update(stringToSign)
    .digest('hex')
    .toLowerCase();
  
  console.log('\n📋 我们的算法:');
  console.log('  拼接字符串:', sortedParams);
  console.log('  加token后:', stringToSign);
  console.log('  MD5签名:', signature);
  
  return signature;
}

// 测试数据
const testParams = {
  address: '',
  trade_type: 'usdt.trc20',
  order_id: 'TEST123456',
  name: '充值订单-TEST123456',
  timeout: 1800,
  rate: '',
  amount: 100,
  notify_url: 'http://example.com/notify',
  redirect_url: 'http://example.com/return'
};

const testToken = 'your_secret_key_here';

console.log('🧪 测试BEpusdt签名算法\n');
console.log('测试参数:', JSON.stringify(testParams, null, 2));
console.log('Token:', testToken);
console.log('\n' + '='.repeat(60));

const phpSig = phpSignature(testParams, testToken);
const ourSig = ourSignature(testParams, testToken);

console.log('\n' + '='.repeat(60));
console.log('\n✅ 结果对比:');
console.log('  PHP算法:', phpSig);
console.log('  我们的算法:', ourSig);
console.log('  是否一致:', phpSig === ourSig ? '✅ 一致' : '❌ 不一致');

// 测试空值处理
console.log('\n\n🧪 测试空值处理\n');
console.log('='.repeat(60));

const testParams2 = {
  address: '',  // 空字符串
  trade_type: 'usdt.trc20',
  order_id: 'TEST123456',
  name: '充值订单-TEST123456',
  timeout: 1800,
  rate: '',  // 空字符串
  amount: 100,
  notify_url: 'http://example.com/notify',
  redirect_url: 'http://example.com/return'
};

console.log('测试参数（包含空字符串）:', JSON.stringify(testParams2, null, 2));

const phpSig2 = phpSignature(testParams2, testToken);
const ourSig2 = ourSignature(testParams2, testToken);

console.log('\n✅ 结果对比:');
console.log('  PHP算法:', phpSig2);
console.log('  我们的算法:', ourSig2);
console.log('  是否一致:', phpSig2 === ourSig2 ? '✅ 一致' : '❌ 不一致');
