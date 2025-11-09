/**
 * 测试密码编码问题
 */

const { encryptPassword, decryptPassword, isEncrypted } = require('../utils/encryption');

const testPassword = 'Ubuntu123!';

console.log('\n' + '='.repeat(60));
console.log('🧪 测试密码编码');
console.log('='.repeat(60));

console.log('\n原始密码:', testPassword);
console.log('是否加密:', isEncrypted(testPassword));
console.log('URL 编码:', encodeURIComponent(testPassword));

// 测试加密
const encrypted = encryptPassword(testPassword);
console.log('\n加密后:', encrypted);
console.log('是否加密:', isEncrypted(encrypted));

// 测试解密
const decrypted = decryptPassword(encrypted);
console.log('解密后:', decrypted);
console.log('解密正确:', decrypted === testPassword);

// 测试 buildMongoURI 的逻辑
console.log('\n' + '-'.repeat(60));
console.log('测试 buildMongoURI 的密码判断逻辑');
console.log('-'.repeat(60));

console.log('\n原始密码包含冒号:', testPassword.includes(':'));
console.log('加密密码包含冒号:', encrypted.includes(':'));

// 模拟 buildMongoURI 的逻辑
function testBuildURI(password) {
  let decryptedPassword = password;
  if (password && password.includes(':')) {
    console.log('  ⚠️  密码包含冒号，尝试解密...');
    try {
      decryptedPassword = decryptPassword(password);
      console.log('  ✅ 解密成功');
    } catch (error) {
      console.log('  ❌ 解密失败:', error.message);
      decryptedPassword = password;
    }
  } else {
    console.log('  ℹ️  密码不包含冒号，不解密');
  }
  
  const uri = `mongodb://chroot:${encodeURIComponent(decryptedPassword)}@172.16.254.15:27017/userdata?authSource=admin`;
  return uri;
}

console.log('\n测试原始密码:');
const uri1 = testBuildURI(testPassword);
console.log('URI:', uri1.replace(/Ubuntu123[^@]+/, 'Ubuntu123***'));

console.log('\n测试加密密码:');
const uri2 = testBuildURI(encrypted);
console.log('URI:', uri2.replace(/Ubuntu123[^@]+/, 'Ubuntu123***'));

console.log('\n' + '='.repeat(60));
console.log('结论');
console.log('='.repeat(60));
console.log('问题: buildMongoURI 使用 password.includes(":") 来判断是否加密');
console.log('这个判断不准确，应该使用 isEncrypted() 函数');
console.log('\n');
