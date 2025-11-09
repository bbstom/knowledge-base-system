// 检查认证 token 是否有效
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// 从浏览器控制台获取的 token（如果有的话）
const testToken = process.argv[2];

if (!testToken) {
  console.log('❌ 没有提供 token');
  console.log('\n使用方法:');
  console.log('node server/scripts/checkAuthToken.js <your-token>');
  console.log('\n如何获取 token:');
  console.log('1. 打开浏览器开发者工具 (F12)');
  console.log('2. 进入 Application/应用 标签');
  console.log('3. 查看 Cookies');
  console.log('4. 找到名为 "token" 的 cookie');
  console.log('5. 复制它的值');
  process.exit(1);
}

try {
  const decoded = jwt.verify(testToken, JWT_SECRET);
  console.log('✅ Token 有效!');
  console.log('\n解码后的信息:');
  console.log(JSON.stringify(decoded, null, 2));
} catch (error) {
  console.log('❌ Token 无效或已过期!');
  console.log('\n错误信息:', error.message);
  console.log('\n解决方案:');
  console.log('1. 退出登录');
  console.log('2. 重新登录');
  console.log('   - 邮箱: admin@example.com');
  console.log('   - 密码: admin123');
}
