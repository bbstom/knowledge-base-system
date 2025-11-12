require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function diagnoseLogin() {
  try {
    console.log('🔍 诊断登录问题...\n');

    // 1. 检查环境变量
    console.log('1️⃣ 检查环境变量:');
    console.log('   USER_MONGO_URI:', process.env.USER_MONGO_URI ? '✅ 已设置' : '❌ 未设置');
    console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ 已设置' : '❌ 未设置');

    // 2. 测试直接连接
    console.log('\n2️⃣ 测试直接MongoDB连接:');
    const uri = process.env.USER_MONGO_URI;
    
    if (!uri) {
      console.log('❌ USER_MONGO_URI 未设置');
      process.exit(1);
    }

    console.log('   连接URI:', uri.replace(/:[^:@]+@/, ':****@'));
    
    const conn = await mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    }).asPromise();

    console.log('   ✅ 直接连接成功');

    // 3. 测试查询用户
    console.log('\n3️⃣ 测试查询用户:');
    const UserSchema = new mongoose.Schema({
      username: String,
      email: String,
      password: String,
      points: Number,
      balance: Number,
      isVip: Boolean,
      role: String
    });
    
    const User = conn.model('User', UserSchema);
    
    const userCount = await User.countDocuments();
    console.log('   用户总数:', userCount);

    if (userCount > 0) {
      const testUser = await User.findOne({ email: 'admin@example.com' });
      if (testUser) {
        console.log('   ✅ 找到测试用户:', {
          username: testUser.username,
          email: testUser.email,
          hasPassword: !!testUser.password,
          passwordLength: testUser.password ? testUser.password.length : 0,
          role: testUser.role
        });

        // 4. 测试密码验证
        console.log('\n4️⃣ 测试密码验证:');
        const bcrypt = require('bcryptjs');
        
        // 测试常见密码
        const testPasswords = ['admin123', 'Admin123', 'admin', '123456'];
        
        for (const pwd of testPasswords) {
          try {
            const isValid = await bcrypt.compare(pwd, testUser.password);
            console.log(`   密码 "${pwd}":`, isValid ? '✅ 正确' : '❌ 错误');
            if (isValid) break;
          } catch (err) {
            console.log(`   密码 "${pwd}": ❌ 验证失败 -`, err.message);
          }
        }
      } else {
        console.log('   ⚠️  未找到 admin@example.com 用户');
        
        // 列出前5个用户
        const users = await User.find().limit(5).select('username email role');
        console.log('\n   现有用户列表:');
        users.forEach(u => {
          console.log(`   - ${u.email} (${u.username}) [${u.role}]`);
        });
      }
    } else {
      console.log('   ⚠️  数据库中没有用户');
    }

    // 5. 测试JWT
    console.log('\n5️⃣ 测试JWT:');
    const jwt = require('jsonwebtoken');
    try {
      const token = jwt.sign({ userId: 'test123' }, process.env.JWT_SECRET, { expiresIn: '7d' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('   ✅ JWT 工作正常');
    } catch (err) {
      console.log('   ❌ JWT 错误:', err.message);
    }

    await conn.close();
    console.log('\n✅ 诊断完成');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 诊断失败:', error.message);
    console.error('错误堆栈:', error.stack);
    process.exit(1);
  }
}

diagnoseLogin();
