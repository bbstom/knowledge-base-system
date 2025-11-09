const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { userConnection, queryConnection } = require('../config/database');
const User = require('../models/User');
const SearchLog = require('../models/SearchLog');

async function testSearchHistory() {
  try {
    console.log('✅ 测试搜索历史数据\n');

    const email = 'kail.say.one@gmail.com';
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ 未找到用户: ${email}`);
      return;
    }

    console.log('用户信息:');
    console.log('==================');
    console.log('用户名:', user.username);
    console.log('用户ID:', user._id);

    // 查询搜索历史
    const searchLogs = await SearchLog.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    console.log('\n搜索历史记录:');
    console.log('==================');
    console.log('总记录数:', await SearchLog.countDocuments({ userId: user._id }));
    
    if (searchLogs.length > 0) {
      console.log('\n最近10条记录:');
      searchLogs.forEach((log, index) => {
        console.log(`\n${index + 1}. ${log.type} 搜索`);
        console.log('   查询内容:', log.query);
        console.log('   消耗积分:', log.pointsCost);
        console.log('   结果数量:', log.resultCount);
        console.log('   搜索时间:', new Date(log.createdAt).toLocaleString('zh-CN'));
      });
    } else {
      console.log('暂无搜索记录');
    }

    // 测试API返回格式
    console.log('\n\nAPI返回格式示例:');
    console.log('==================');
    console.log(JSON.stringify({
      success: true,
      data: {
        history: searchLogs.slice(0, 3),
        pagination: {
          page: 1,
          limit: 50,
          total: searchLogs.length,
          pages: Math.ceil(searchLogs.length / 50)
        }
      }
    }, null, 2));

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await userConnection.close();
    await queryConnection.close();
    console.log('\n数据库连接已关闭');
  }
}

testSearchHistory();
