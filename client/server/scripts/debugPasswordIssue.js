/**
 * 调试密码问题
 * 测试不同长度的密码
 */

const dbManager = require('../config/databaseManager');

async function debugPasswordIssue() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 调试密码问题');
  console.log('='.repeat(60));

  const correctPassword = 'Ubuntu123!';
  const shortPassword = 'Ubuntu'; // 6 个字符，和日志中的长度一致

  console.log('\n正确密码:', correctPassword);
  console.log('长度:', correctPassword.length);
  console.log('\n前端发送的密码长度:', 6);
  console.log('可能的密码:', shortPassword);

  // 测试正确密码
  console.log('\n' + '-'.repeat(60));
  console.log('测试 1: 使用正确密码');
  console.log('-'.repeat(60));
  
  const config1 = {
    host: '172.16.254.15',
    port: 27017,
    username: 'chroot',
    password: correctPassword,
    database: 'userdata',
    authSource: 'admin'
  };

  console.log('密码长度:', config1.password.length);
  const result1 = await dbManager.testConnection(config1);
  console.log('结果:', result1.success ? '✅ 成功' : '❌ 失败');
  if (!result1.success) {
    console.log('错误:', result1.message);
  }

  // 测试短密码
  console.log('\n' + '-'.repeat(60));
  console.log('测试 2: 使用 6 字符密码（模拟前端）');
  console.log('-'.repeat(60));
  
  const config2 = {
    host: '172.16.254.15',
    port: 27017,
    username: 'chroot',
    password: shortPassword,
    database: 'userdata',
    authSource: 'admin'
  };

  console.log('密码长度:', config2.password.length);
  const result2 = await dbManager.testConnection(config2);
  console.log('结果:', result2.success ? '✅ 成功' : '❌ 失败');
  if (!result2.success) {
    console.log('错误:', result2.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('结论');
  console.log('='.repeat(60));
  console.log('\n问题原因: 前端只发送了密码的前 6 个字符');
  console.log('\n可能的原因:');
  console.log('1. 前端输入框中只输入了部分密码');
  console.log('2. 密码被截断（不太可能，代码中没有限制）');
  console.log('3. 复制粘贴时只复制了部分内容');
  console.log('\n解决方案:');
  console.log('1. 在前端重新输入完整密码: Ubuntu123!');
  console.log('2. 确保密码输入框显示完整密码（点击眼睛图标查看）');
  console.log('3. 密码长度应该是 10 个字符，不是 6 个');
  console.log('\n');

  process.exit(0);
}

debugPasswordIssue();
