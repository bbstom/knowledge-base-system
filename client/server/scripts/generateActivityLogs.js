/**
 * 生成示例活动日志
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

// 生成活动日志
const generateLogs = async () => {
  try {
    const ActivityLog = require('../models/ActivityLog');
    
    console.log('📝 生成示例活动日志\n');
    
    // 清除现有日志
    await ActivityLog.deleteMany({});
    console.log('🗑️  清除现有日志');
    
    // 生成示例日志
    const logs = [
      {
        type: 'user',
        message: '新用户注册: user123@example.com',
        createdAt: new Date(Date.now() - 5 * 60 * 1000) // 5分钟前
      },
      {
        type: 'search',
        message: '用户完成搜索: 手机号查询',
        createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10分钟前
      },
      {
        type: 'payment',
        message: '用户充值: $100',
        createdAt: new Date(Date.now() - 15 * 60 * 1000) // 15分钟前
      },
      {
        type: 'withdraw',
        message: '提现申请: $50',
        createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30分钟前
      },
      {
        type: 'system',
        message: '系统备份完成',
        createdAt: new Date(Date.now() - 60 * 60 * 1000) // 1小时前
      },
      {
        type: 'ticket',
        message: '新工单创建: 账户问题咨询',
        createdAt: new Date(Date.now() - 90 * 60 * 1000) // 1.5小时前
      },
      {
        type: 'commission',
        message: '佣金结算: $25',
        createdAt: new Date(Date.now() - 120 * 60 * 1000) // 2小时前
      }
    ];
    
    for (const log of logs) {
      await ActivityLog.create(log);
      console.log(`✅ 创建活动: ${log.message}`);
    }
    
    console.log(`\n✅ 成功生成 ${logs.length} 条活动日志`);
    
    // 测试获取最近活动
    console.log('\n📊 测试获取最近活动:');
    const recent = await ActivityLog.getRecent(5);
    recent.forEach((activity, index) => {
      const now = new Date();
      const diff = now - new Date(activity.createdAt);
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      
      let timeAgo;
      if (minutes < 1) {
        timeAgo = '刚刚';
      } else if (minutes < 60) {
        timeAgo = `${minutes}分钟前`;
      } else {
        timeAgo = `${hours}小时前`;
      }
      
      console.log(`${index + 1}. [${activity.type}] ${activity.message} - ${timeAgo}`);
    });
    
  } catch (error) {
    console.error('❌ 生成日志失败:', error);
  }
};

// 运行
const run = async () => {
  await connectDB();
  
  // 等待数据库连接完全建立
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await generateLogs();
  await mongoose.connection.close();
  console.log('\n👋 数据库连接已关闭');
  process.exit(0);
};

run();
