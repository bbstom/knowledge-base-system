require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

// 测试数据库中的换行符
async function testDatabaseLineBreaks() {
  try {
    console.log('🔌 连接数据库...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    // 获取数据库集合
    const Database = mongoose.connection.collection('databases');
    const FAQ = mongoose.connection.collection('faqs');

    console.log('📊 检查数据清单中的换行符:');
    console.log('='.repeat(60));
    
    const databases = await Database.find({}).limit(5).toArray();
    
    if (databases.length === 0) {
      console.log('⚠️  没有找到数据清单');
    } else {
      databases.forEach((db, index) => {
        console.log(`\n${index + 1}. ${db.name}`);
        console.log('   描述:', JSON.stringify(db.description));
        console.log('   包含\\n:', db.description?.includes('\n') ? '✅ 是' : '❌ 否');
        if (db.description?.includes('\n')) {
          console.log('   换行符数量:', (db.description.match(/\n/g) || []).length);
        }
      });
    }

    console.log('\n\n📋 检查FAQ中的换行符:');
    console.log('='.repeat(60));
    
    const faqs = await FAQ.find({}).limit(5).toArray();
    
    if (faqs.length === 0) {
      console.log('⚠️  没有找到FAQ');
    } else {
      faqs.forEach((faq, index) => {
        console.log(`\n${index + 1}. ${faq.question}`);
        console.log('   答案:', JSON.stringify(faq.answer));
        console.log('   包含\\n:', faq.answer?.includes('\n') ? '✅ 是' : '❌ 否');
        if (faq.answer?.includes('\n')) {
          console.log('   换行符数量:', (faq.answer.match(/\n/g) || []).length);
        }
      });
    }

    console.log('\n\n💡 测试建议:');
    console.log('='.repeat(60));
    console.log('1. 如果数据中没有\\n，说明保存时换行符被移除了');
    console.log('2. 在管理后台编辑数据时，按Enter键应该插入\\n');
    console.log('3. 前端使用dangerouslySetInnerHTML将\\n转换为<br>显示');
    console.log('4. 清除浏览器缓存后刷新页面查看效果');

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 数据库连接已关闭');
  }
}

testDatabaseLineBreaks();
