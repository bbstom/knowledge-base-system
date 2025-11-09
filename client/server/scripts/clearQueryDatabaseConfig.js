const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function clearConfig() {
  try {
    console.log('🗑️  清除查询数据库配置\n');

    await mongoose.connect(process.env.USER_MONGO_URI);
    console.log('✅ 连接成功');

    const db = mongoose.connection.db;
    const collection = db.collection('systemconfigs');

    // 删除查询数据库配置
    const result = await collection.updateOne(
      {},
      {
        $unset: {
          'databases.query': ''
        },
        $set: {
          updatedAt: new Date()
        }
      }
    );

    console.log('\n✅ 查询数据库配置已清除');
    console.log(`   修改记录数: ${result.modifiedCount}`);

    // 验证
    const saved = await collection.findOne({});
    if (!saved.databases?.query || saved.databases.query.length === 0) {
      console.log('\n✅ 验证成功：查询数据库配置已清空');
    }

    console.log('\n💡 下一步:');
    console.log('   1. 登录管理员后台');
    console.log('   2. 进入"系统设置" -> "数据库配置"');
    console.log('   3. 点击"添加查询数据库"');
    console.log('   4. 填写正确的第三方数据库信息');
    console.log('   5. 点击"测试连接"确认连接成功');
    console.log('   6. 点击"保存配置"');
    console.log('   7. 重启服务器');
    
  } catch (error) {
    console.error('\n❌ 失败:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

clearConfig();
