/**
 * 测试BEPUSDT签名算法
 * 用于验证签名生成是否正确
 */

const crypto = require('crypto');

// 测试参数
const params = {
  order_id: 'ORDER1760989068003617',
  amount: 200,
  currency: 'USDT',
  merchant_id: '1000',
  notify_url: 'http://localhost:5173/api/payment/notify',
  redirect_url: 'http://localhost:5173/dashboard/recharge'
};

const token = '1000';  // secret_key

// 按key字母顺序排序
const sortedKeys = Object.keys(params).sort();

console.log('📋 排序后的keys:', sortedKeys);

// 拼接签名字符串
let signString = '';
for (const key of sortedKeys) {
  const value = params[key];
  
  // 跳过空值
  if (value === '' || value === null || value === undefined) {
    continue;
  }
  
  // 跳过signature字段
  if (key === 'signature') {
    continue;
  }
  
  // 添加&分隔符（第一个参数除外）
  if (signString !== '') {
    signString += '&';
  }
  
  signString += `${key}=${value}`;
}

console.log('\n📝 签名字符串（不含token）:');
console.log(signString);

// 最后加上token
signString += token;

console.log('\n📝 签名字符串（含token）:');
console.log(signString);

// 生成MD5签名
const signature = crypto.createHash('md5').update(signString).digest('hex');

console.log('\n🔐 生成的签名:');
console.log(signature);

console.log('\n✅ 测试完成！');
console.log('如果这个签名与服务器日志中的签名一致，说明算法正确。');
console.log('如果BEPUSDT仍然返回签名错误，可能是：');
console.log('1. BEPUSDT的merchant_id或secret_key配置不正确');
console.log('2. BEPUSDT服务端使用了不同的签名算法');
console.log('3. 需要联系BEPUSDT服务提供商确认签名规则');
