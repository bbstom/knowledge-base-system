const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 连接数据库
const connectDB = async () => {
  try {
    const mongoUri = process.env.USER_MONGO_URI || 'mongodb://localhost:27017/infosearch';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB连接成功');
    console.log('📍 连接地址:', mongoUri.replace(/\/\/.*@/, '//<credentials>@'));
  } catch (error) {
    console.error('❌ MongoDB连接失败:', error);
    process.exit(1);
  }
};

// 用户Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  balance: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  commission: { type: Number, default: 0 },
  isVip: { type: Boolean, default: false },
  vipExpireAt: Date,
  role: { type: String, default: 'user' },
  referralCode: String,
  referredBy: mongoose.Schema.Types.ObjectId,
  totalRecharged: { type: Number, default: 0 },
  totalConsumed: { type: Number, default: 0 },
  lastDailyClaimAt: Date,
  referralCount: { type: Number, default: 0 },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const checkUsers = async () => {
  try {
    await connectDB();

    console.log('\n📊 检查所有用户数据...\n');

    const users = await User.find({}).select('-password');
    
    if (users.length === 0) {
      console.log('⚠️  数据库中没有用户');
      return;
    }

    console.log(`找到 ${users.length} 个用户:\n`);

    users.forEach((user, index) => {
      console.log(`--- 用户 ${index + 1} ---`);
      console.log(`ID: ${user._id}`);
      console.log(`用户名: ${user.username}`);
      console.log(`邮箱: ${user.email}`);
      console.log(`角色: ${user.role}`);
      console.log(`积分: ${user.points}`);
      console.log(`余额: ${user.balance}`);
      console.log(`佣金: ${user.commission}`);
      console.log(`VIP状态: ${user.isVip ? '是' : '否'}`);
      console.log(`VIP到期: ${user.vipExpireAt || '无'}`);
      console.log(`推荐码: ${user.referralCode || '无'}`);
      console.log(`推荐人数: ${user.referralCount || 0}`);
      console.log(`注册时间: ${user.createdAt}`);
      console.log(`头像: ${user.avatar || '无'}`);
      console.log('');
    });

    // 检查管理员用户
    const adminUsers = users.filter(u => u.role === 'admin');
    console.log(`\n👑 管理员用户数量: ${adminUsers.length}`);
    if (adminUsers.length > 0) {
      adminUsers.forEach(admin => {
        console.log(`  - ${admin.username} (${admin.email})`);
      });
    }

    // 检查数据异常
    console.log('\n🔍 数据检查:');
    const zeroBalanceUsers = users.filter(u => u.balance === 0 && u.points === 0);
    console.log(`  - 积分和余额都为0的用户: ${zeroBalanceUsers.length}`);
    
    const missingFields = users.filter(u => 
      u.referralCount === undefined || 
      u.avatar === undefined
    );
    console.log(`  - 缺少新字段的用户: ${missingFields.length}`);

  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ 数据库连接已关闭');
  }
};

checkUsers();
