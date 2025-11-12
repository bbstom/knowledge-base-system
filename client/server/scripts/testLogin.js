require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function testLogin() {
  try {
    console.log('🔍 开始测试登录功能...\n');

    // 测试数据库连接
    console.log('1️⃣ 测试数据库连接...');
    const { userConnection } = require('../config/database');
    
    // 等待连接完成
    if (userConnection.readyState !== 1) {
      console.log('⏳ 等待数据库连接...');
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('连接超时')), 30000);
        userConnection.once('connected', () => {
          clearTimeout(timeout);
          resolve();
        });
        userConnection.once('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });
    }
    console.log('✅ 用户数据库已连接');

    // 测试User模型
    console.log('\n2️⃣ 测试User模型...');
    const User = require('../models/User');
    console.log('✅ User模型加载成功');

    // 查询一个用户
    console.log('\n3️⃣ 查询用户...');
    const users = await User.find().limit(1);
    if (users.length > 0) {
      console.log('✅ 找到用户:', {
        username: users[0].username,
        email: users[0].email,
        hasPassword: !!users[0].password
      });
    } else {
      console.log('⚠️ 数据库中没有用户');
    }

    // 测试bcrypt
    console.log('\n4️⃣ 测试密码验证...');
    const bcrypt = require('bcryptjs');
    const testPassword = 'test123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const isValid = await bcrypt.compare(testPassword, hashedPassword);
    console.log('✅ bcrypt工作正常:', isValid);

    // 测试JWT
    console.log('\n5️⃣ 测试JWT...');
    const jwt = require('jsonwebtoken');
    if (!process.env.JWT_SECRET) {
      console.log('❌ JWT_SECRET未设置');
    } else {
      const token = jwt.sign({ userId: 'test' }, process.env.JWT_SECRET, { expiresIn: '7d' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ JWT工作正常:', decoded.userId === 'test');
    }

    console.log('\n✅ 所有测试完成');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    console.error('错误详情:', error.stack);
    process.exit(1);
  }
}

testLogin();
