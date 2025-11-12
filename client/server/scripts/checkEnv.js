require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

console.log('🔍 检查环境变量...\n');
console.log('USER_MONGO_URI:', process.env.USER_MONGO_URI ? '✅ 已设置' : '❌ 未设置');
console.log('QUERY_MONGO_URI:', process.env.QUERY_MONGO_URI ? '✅ 已设置' : '❌ 未设置');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ 已设置' : '❌ 未设置');
console.log('\n完整的 USER_MONGO_URI:');
console.log(process.env.USER_MONGO_URI);
