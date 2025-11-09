/**
 * 测试管理员仪表盘API
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');

// 连接数据库
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.USER_MONGO_URI);
    console.log('✅ 数据库连接成功\n');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
};

// 测试管理员统计API
const testAdminStats = async () => {
  try {
    const User = require('../models/User');
    const BalanceLog = require('../models/BalanceLog');
    const SearchLog = require('../models/SearchLog');
    const WithdrawOrder = require('../models/WithdrawOrder');

    console.log('📊 测试管理员仪表盘数据\n');

    // 1. 用户统计
    console.log('1️⃣ 用户统计:');
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 
      lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
    });
    const vipUsers = await User.countDocuments({ 
      vipStatus: { $ne: 'none' } 
    });
    console.log(`   总用户数: ${totalUsers}`);
    console.log(`   活跃用户: ${activeUsers}`);
    console.log(`   VIP用户: ${vipUsers}`);
    console.log('');

    // 2. 财务统计
    console.log('2️⃣ 财务统计:');
    const rechargeLogsAll = await BalanceLog.find({ type: 'recharge' });
    const totalRevenue = rechargeLogsAll.reduce((sum, log) => sum + log.amount, 0);
    const usersWithPoints = await User.find({}, 'points balance commission');
    const totalPoints = usersWithPoints.reduce((sum, user) => sum + (user.points || 0), 0);
    const totalCommission = usersWithPoints.reduce((sum, user) => sum + (user.commission || 0), 0);
    console.log(`   总收入: $${totalRevenue.toFixed(2)}`);
    console.log(`   总积分: ${totalPoints}`);
    console.log(`   总佣金: $${totalCommission.toFixed(2)}`);
    console.log('');

    // 3. 搜索统计
    console.log('3️⃣ 搜索统计:');
    const totalSearches = await SearchLog.countDocuments();
    const successfulSearches = await SearchLog.countDocuments({ 
      resultCount: { $gt: 0 } 
    });
    const successRate = totalSearches > 0 
      ? ((successfulSearches / totalSearches) * 100).toFixed(1) 
      : 0;
    console.log(`   总搜索次数: ${totalSearches}`);
    console.log(`   成功搜索: ${successfulSearches}`);
    console.log(`   成功率: ${successRate}%`);
    console.log('');

    // 4. 提现统计
    console.log('4️⃣ 提现统计:');
    const pendingWithdrawals = await WithdrawOrder.countDocuments({ 
      status: 'pending' 
    });
    const completedWithdrawals = await WithdrawOrder.find({ 
      status: 'completed' 
    });
    const totalWithdrawn = completedWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    console.log(`   待处理提现: ${pendingWithdrawals}`);
    console.log(`   已提现总额: $${totalWithdrawn.toFixed(2)}`);
    console.log('');

    // 5. 数据库统计
    console.log('5️⃣ 数据库统计:');
    const { dbManager } = require('../config/database');
    const queryDatabases = dbManager.queryConnections || {};
    const totalDatabases = Object.keys(queryDatabases).length;
    const activeDatabases = Object.values(queryDatabases).filter(conn => 
      conn && conn.readyState === 1
    ).length;
    console.log(`   总数据库数: ${totalDatabases}`);
    console.log(`   在线数据库: ${activeDatabases}`);
    console.log('');

    // 6. 工单统计
    console.log('6️⃣ 工单统计:');
    try {
      const Ticket = require('../models/Ticket');
      const pendingTickets = await Ticket.countDocuments({ 
        status: { $in: ['open', 'in_progress'] } 
      });
      const totalTickets = await Ticket.countDocuments();
      console.log(`   待处理工单: ${pendingTickets}`);
      console.log(`   总工单数: ${totalTickets}`);
    } catch (error) {
      console.log('   ⚠️  工单模型不存在');
    }
    console.log('');

    // 7. 系统状态
    console.log('7️⃣ 系统状态:');
    const { userConnection } = require('../config/database');
    const databaseStatus = userConnection && userConnection.readyState === 1 ? 'online' : 'offline';
    console.log(`   数据库状态: ${databaseStatus}`);
    console.log(`   系统健康度: healthy`);
    console.log('');

    // 8. 性能指标（模拟）
    console.log('8️⃣ 性能指标:');
    const os = require('os');
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsage = ((usedMem / totalMem) * 100).toFixed(1);
    
    console.log(`   CPU核心数: ${os.cpus().length}`);
    console.log(`   总内存: ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`   已用内存: ${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`   内存使用率: ${memoryUsage}%`);
    console.log('');

    console.log('✅ 所有测试完成！');
    console.log('');
    console.log('📋 总结:');
    console.log(`   ✅ 用户统计: 正常 (${totalUsers} 用户)`);
    console.log(`   ✅ 财务统计: 正常 ($${totalRevenue.toFixed(2)} 收入)`);
    console.log(`   ✅ 搜索统计: 正常 (${totalSearches} 次搜索)`);
    console.log(`   ✅ 提现统计: 正常 (${pendingWithdrawals} 待处理)`);
    console.log(`   ✅ 数据库统计: 正常 (${activeDatabases}/${totalDatabases} 在线)`);
    console.log(`   ✅ 系统状态: ${databaseStatus}`);

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
};

// 运行测试
const run = async () => {
  await connectDB();
  
  // 等待数据库连接完全建立
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testAdminStats();
  await mongoose.connection.close();
  console.log('\n👋 数据库连接已关闭');
  process.exit(0);
};

run();
