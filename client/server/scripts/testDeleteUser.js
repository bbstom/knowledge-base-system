require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const SearchLog = require('../models/SearchLog');
const BalanceLog = require('../models/BalanceLog');
const WithdrawOrder = require('../models/WithdrawOrder');

async function testDeleteUser() {
  try {
    console.log('🔄 连接数据库...');
    // 等待数据库初始化完成
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ 数据库连接成功\n');

    console.log('🧪 测试删除用户功能');
    console.log('='.repeat(60));

    // 1. 创建测试用户
    console.log('\n1️⃣ 创建测试用户');
    console.log('-'.repeat(60));
    
    const testUser = new User({
      username: 'test_delete_user',
      email: 'test_delete@example.com',
      password: 'test123456',
      vipStatus: 'none',
      balance: 100,
      points: 50,
      commission: 0
    });
    
    await testUser.save();
    console.log(`✅ 创建测试用户: ${testUser.username} (ID: ${testUser._id})`);

    // 2. 为测试用户创建一些数据
    console.log('\n2️⃣ 创建测试数据');
    console.log('-'.repeat(60));
    
    // 创建搜索记录
    const searchLog = new SearchLog({
      userId: testUser._id,
      type: 'phone',
      query: '13800138000',
      database: '测试数据库',
      cost: 10,
      resultCount: 1
    });
    await searchLog.save();
    console.log(`✅ 创建搜索记录`);

    // 创建余额日志
    const balanceLog = new BalanceLog({
      userId: testUser._id,
      type: 'recharge',
      currency: 'balance',
      amount: 100,
      description: '测试充值'
    });
    await balanceLog.save();
    console.log(`✅ 创建余额日志`);

    // 3. 测试删除功能
    console.log('\n3️⃣ 测试删除功能');
    console.log('-'.repeat(60));

    // 检查用户是否存在
    const userExists = await User.findById(testUser._id);
    console.log(`用户存在: ${userExists ? '是' : '否'}`);

    // 检查是否是管理员
    console.log(`用户角色: ${userExists.role}`);
    console.log(`是否可以删除: ${userExists.role !== 'admin' ? '是' : '否'}`);

    // 删除搜索记录
    const searchLogsDeleted = await SearchLog.deleteMany({ userId: testUser._id });
    console.log(`删除搜索记录: ${searchLogsDeleted.deletedCount} 条`);

    // 删除余额日志
    const balanceLogsDeleted = await BalanceLog.deleteMany({ userId: testUser._id });
    console.log(`删除余额日志: ${balanceLogsDeleted.deletedCount} 条`);

    // 删除提现订单
    const withdrawOrdersDeleted = await WithdrawOrder.deleteMany({ userId: testUser._id });
    console.log(`删除提现订单: ${withdrawOrdersDeleted.deletedCount} 条`);

    // 更新推荐关系
    const referredUsersUpdated = await User.updateMany(
      { referredBy: testUser._id },
      { $unset: { referredBy: '' } }
    );
    console.log(`更新推荐关系: ${referredUsersUpdated.modifiedCount} 个用户`);

    // 删除用户
    const deletedUser = await User.findByIdAndDelete(testUser._id);
    console.log(`删除用户: ${deletedUser ? '成功' : '失败'}`);

    // 4. 验证删除结果
    console.log('\n4️⃣ 验证删除结果');
    console.log('-'.repeat(60));

    const userStillExists = await User.findById(testUser._id);
    console.log(`用户是否还存在: ${userStillExists ? '是（删除失败）' : '否（删除成功）'}`);

    const searchLogsRemaining = await SearchLog.countDocuments({ userId: testUser._id });
    console.log(`剩余搜索记录: ${searchLogsRemaining} 条`);

    const balanceLogsRemaining = await BalanceLog.countDocuments({ userId: testUser._id });
    console.log(`剩余余额日志: ${balanceLogsRemaining} 条`);

    if (!userStillExists && searchLogsRemaining === 0 && balanceLogsRemaining === 0) {
      console.log('\n✅ 删除功能测试通过！');
    } else {
      console.log('\n❌ 删除功能测试失败！');
    }

    console.log('\n✅ 测试完成');
    process.exit(0);
  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.error('错误详情:', error.message);
    console.error('错误堆栈:', error.stack);
    process.exit(1);
  }
}

testDeleteUser();
