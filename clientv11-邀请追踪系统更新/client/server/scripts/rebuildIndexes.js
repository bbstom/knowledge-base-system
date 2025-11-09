require('dotenv').config();
const mongoose = require('mongoose');

async function rebuildIndexes() {
  try {
    // 连接数据库
    const mongoUri = process.env.MONGODB_USER_URI || process.env.USER_MONGO_URI;
    
    if (!mongoUri) {
      console.error('❌ 错误：未找到数据库连接字符串');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ 数据库连接成功\n');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // 1. 获取所有现有索引
    console.log('📝 当前索引列表:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log('  -', index.name, JSON.stringify(index.key));
    });

    // 2. 删除 referralCode 相关的所有索引
    console.log('\n📝 删除 referralCode 索引...');
    try {
      await collection.dropIndex('referralCode_1');
      console.log('✅ 已删除 referralCode_1');
    } catch (error) {
      console.log('ℹ️  referralCode_1 不存在');
    }

    try {
      await collection.dropIndex('referral_code_1');
      console.log('✅ 已删除 referral_code_1');
    } catch (error) {
      console.log('ℹ️  referral_code_1 不存在');
    }

    // 3. 为所有 null 的 referralCode 生成新值
    console.log('\n📝 检查并修复 referralCode...');
    const usersWithNull = await collection.find({ 
      $or: [
        { referralCode: null },
        { referralCode: { $exists: false } }
      ]
    }).toArray();

    if (usersWithNull.length > 0) {
      console.log(`发现 ${usersWithNull.length} 个用户需要生成推荐码`);
      
      for (const user of usersWithNull) {
        const newCode = generateReferralCode();
        await collection.updateOne(
          { _id: user._id },
          { $set: { referralCode: newCode } }
        );
        console.log(`✅ ${user.username || user.email} - ${newCode}`);
      }
    } else {
      console.log('✅ 所有用户都有推荐码');
    }

    // 4. 创建新的稀疏唯一索引
    console.log('\n📝 创建新的稀疏索引...');
    await collection.createIndex(
      { referralCode: 1 },
      { 
        unique: true, 
        sparse: true,
        name: 'referralCode_1'
      }
    );
    console.log('✅ 已创建稀疏索引');

    // 5. 验证索引
    console.log('\n📝 验证新索引:');
    const newIndexes = await collection.indexes();
    const referralIndex = newIndexes.find(idx => idx.name === 'referralCode_1');
    if (referralIndex) {
      console.log('✅ referralCode 索引信息:');
      console.log('   unique:', referralIndex.unique);
      console.log('   sparse:', referralIndex.sparse);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 索引重建完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n现在可以创建管理员了:');
    console.log('node scripts/createAdmin.js\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ 重建索引失败:', error);
    process.exit(1);
  }
}

// 生成推荐码
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 运行脚本
rebuildIndexes();
