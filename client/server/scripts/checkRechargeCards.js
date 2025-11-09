/**
 * 检查充值卡数据
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { userConnection } = require('../config/database');

async function checkCards() {
  try {
    console.log('\n🔍 检查充值卡数据\n');
    
    // 等待连接建立
    await new Promise((resolve) => {
      if (userConnection.readyState === 1) {
        resolve();
      } else {
        userConnection.once('connected', resolve);
      }
    });
    
    const db = userConnection.db;
    
    // 列出所有集合
    const collections = await db.listCollections().toArray();
    console.log('📋 所有集合:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // 查找充值卡相关的集合
    const cardCollections = collections.filter(col => 
      col.name.toLowerCase().includes('card') || 
      col.name.toLowerCase().includes('recharge')
    );
    
    console.log('\n💳 充值卡相关集合:');
    if (cardCollections.length === 0) {
      console.log('   ❌ 未找到充值卡集合');
    } else {
      for (const col of cardCollections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`   - ${col.name}: ${count} 条记录`);
        
        if (count > 0) {
          const sample = await db.collection(col.name).findOne();
          console.log(`     示例数据:`, JSON.stringify(sample, null, 2).substring(0, 200));
        }
      }
    }
    
    // 尝试直接查询 rechargecards 集合
    console.log('\n🔍 查询 rechargecards 集合:');
    try {
      const rechargeCards = db.collection('rechargecards');
      const count = await rechargeCards.countDocuments();
      console.log(`   总数: ${count}`);
      
      if (count > 0) {
        const cards = await rechargeCards.find().limit(5).toArray();
        console.log(`   前5条记录:`);
        cards.forEach((card, index) => {
          console.log(`   ${index + 1}. 卡密: ${card.code}, 类型: ${card.type}, 状态: ${card.status}`);
        });
      }
    } catch (error) {
      console.log(`   ❌ 查询失败: ${error.message}`);
    }
    
    await userConnection.close();
    console.log('\n✅ 检查完成\n');
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
    process.exit(1);
  }
}

checkCards();
