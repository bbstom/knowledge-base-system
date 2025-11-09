/**
 * 验证 ReferralVisit 集合的索引
 * 
 * 运行方式：
 * node server/scripts/verifyReferralIndexes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const ReferralVisit = require('../models/ReferralVisit');

async function verifyIndexes() {
  try {
    // 连接数据库
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/knowbase';
    await mongoose.connect(dbUri);
    console.log('✅ 数据库连接成功');

    // 获取集合
    const collection = ReferralVisit.collection;

    // 获取现有索引
    const indexes = await collection.indexes();
    
    console.log('\n📊 当前索引列表:');
    console.log('='.repeat(60));
    
    indexes.forEach((index, i) => {
      console.log(`\n${i + 1}. ${index.name}`);
      console.log('   键:', JSON.stringify(index.key));
      if (index.expireAfterSeconds !== undefined) {
        console.log('   TTL:', index.expireAfterSeconds, '秒');
      }
      if (index.unique) {
        console.log('   唯一索引: 是');
      }
    });

    // 验证必需的索引
    console.log('\n\n🔍 验证必需索引:');
    console.log('='.repeat(60));

    const requiredIndexes = [
      { name: 'referralCode_1', key: { referralCode: 1 } },
      { name: 'fingerprint_1', key: { fingerprint: 1 } },
      { name: 'expiresAt_1', key: { expiresAt: 1 }, ttl: true },
      { name: 'fingerprint_1_referralCode_1', key: { fingerprint: 1, referralCode: 1 } },
      { name: 'ip_1_referralCode_1', key: { ip: 1, referralCode: 1 } },
      { name: 'fingerprint_1_converted_1_expiresAt_1', key: { fingerprint: 1, converted: 1, expiresAt: 1 } },
      { name: 'ip_1_converted_1_expiresAt_1', key: { ip: 1, converted: 1, expiresAt: 1 } },
      { name: 'referralCode_1_converted_1', key: { referralCode: 1, converted: 1 } }
    ];

    let allPresent = true;

    for (const required of requiredIndexes) {
      const found = indexes.find(idx => idx.name === required.name);
      
      if (found) {
        console.log(`✅ ${required.name}`);
        
        // 验证键是否匹配
        const keysMatch = JSON.stringify(found.key) === JSON.stringify(required.key);
        if (!keysMatch) {
          console.log(`   ⚠️  警告: 索引键不匹配`);
          console.log(`   期望: ${JSON.stringify(required.key)}`);
          console.log(`   实际: ${JSON.stringify(found.key)}`);
        }
        
        // 验证 TTL
        if (required.ttl && found.expireAfterSeconds === undefined) {
          console.log(`   ⚠️  警告: 缺少 TTL 配置`);
        }
      } else {
        console.log(`❌ ${required.name} - 缺失`);
        allPresent = false;
      }
    }

    // 统计信息
    console.log('\n\n📈 统计信息:');
    console.log('='.repeat(60));
    
    const stats = await collection.stats();
    console.log(`文档数量: ${stats.count}`);
    console.log(`存储大小: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`索引数量: ${stats.nindexes}`);
    console.log(`索引大小: ${(stats.totalIndexSize / 1024).toFixed(2)} KB`);

    // 查询性能测试
    console.log('\n\n⚡ 查询性能测试:');
    console.log('='.repeat(60));

    // 测试 1: 按指纹查询
    const testFingerprint = 'test_fingerprint_123';
    console.time('查询1: 按指纹查询');
    await ReferralVisit.findOne({
      fingerprint: testFingerprint,
      converted: false,
      expiresAt: { $gt: new Date() }
    }).lean();
    console.timeEnd('查询1: 按指纹查询');

    // 测试 2: 按IP查询
    const testIp = '192.168.1.1';
    console.time('查询2: 按IP查询');
    await ReferralVisit.findOne({
      ip: testIp,
      converted: false,
      expiresAt: { $gt: new Date() }
    }).lean();
    console.timeEnd('查询2: 按IP查询');

    // 测试 3: 转化标记查询
    const testCode = 'TEST123';
    console.time('查询3: 转化标记查询');
    await ReferralVisit.find({
      referralCode: testCode,
      converted: false
    }).limit(10).lean();
    console.timeEnd('查询3: 转化标记查询');

    // 总结
    console.log('\n\n📝 总结:');
    console.log('='.repeat(60));
    
    if (allPresent) {
      console.log('✅ 所有必需索引都已创建');
      console.log('✅ 数据库查询性能已优化');
    } else {
      console.log('⚠️  部分索引缺失，建议重新同步模型');
      console.log('💡 运行以下命令同步索引:');
      console.log('   await ReferralVisit.syncIndexes();');
    }

    console.log('\n✅ 验证完成');

  } catch (error) {
    console.error('❌ 验证失败:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 数据库连接已关闭');
  }
}

// 运行验证
verifyIndexes();
