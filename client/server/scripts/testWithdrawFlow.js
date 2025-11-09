const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testWithdrawFlow() {
  try {
    console.log('🔗 连接数据库...');
    await mongoose.connect(process.env.USER_MONGO_URI);
    console.log('✅ 数据库连接成功\n');

    // 直接定义 SystemConfig Schema
    const systemConfigSchema = new mongoose.Schema({
      points: {
        minWithdrawAmountBalance: { type: Number, default: 1 },
        minWithdrawAmount: { type: Number, default: 10 },
        withdrawFee: { type: Number, default: 5 }
      }
    }, { timestamps: true });

    const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);

    // 1. 获取数据库配置
    console.log('📊 步骤1: 从数据库获取配置');
    console.log('-----------------------------------');
    const config = await SystemConfig.findOne();
    
    if (!config) {
      console.log('❌ 未找到系统配置');
      return;
    }

    console.log('数据库中的配置:');
    console.log(`  minWithdrawAmountBalance: ${config.points?.minWithdrawAmountBalance}`);
    console.log(`  minWithdrawAmount: ${config.points?.minWithdrawAmount}`);
    console.log(`  withdrawFee: ${config.points?.withdrawFee}%\n`);

    // 2. 模拟公开API返回
    console.log('📊 步骤2: 公开API返回的数据');
    console.log('-----------------------------------');
    const publicConfig = {
      withdraw: {
        minWithdrawAmount: config.points?.minWithdrawAmount || 10,
        minWithdrawAmountBalance: config.points?.minWithdrawAmountBalance || 1,
        withdrawFee: config.points?.withdrawFee || 0
      }
    };
    console.log(JSON.stringify(publicConfig, null, 2));
    console.log('');

    // 3. 模拟前端接收
    console.log('📊 步骤3: 前端接收到的配置');
    console.log('-----------------------------------');
    const frontendConfig = {
      minWithdrawAmountBalance: publicConfig.withdraw?.minWithdrawAmountBalance || 1,
      minWithdrawAmountUsdt: publicConfig.withdraw?.minWithdrawAmount || 10
    };
    console.log(`  余额提现最低金额: $${frontendConfig.minWithdrawAmountBalance}`);
    console.log(`  USDT提现最低金额: $${frontendConfig.minWithdrawAmountUsdt}\n`);

    // 4. 模拟后端验证
    console.log('📊 步骤4: 后端提现验证');
    console.log('-----------------------------------');
    
    const testCases = [
      { type: 'balance', amount: 0.5 },
      { type: 'balance', amount: 1.5 },
      { type: 'usdt', amount: 0.5 },
      { type: 'usdt', amount: 1.5 }
    ];

    for (const testCase of testCases) {
      const minAmount = testCase.type === 'balance' 
        ? config.points?.minWithdrawAmountBalance || 1
        : config.points?.minWithdrawAmount || 10;
      
      const withdrawTypeName = testCase.type === 'balance' ? '余额账户' : 'USDT钱包';
      const result = testCase.amount >= minAmount ? '✅ 通过' : '❌ 拒绝';
      
      console.log(`${result} - 提现到${withdrawTypeName} $${testCase.amount} (最低: $${minAmount})`);
    }

    console.log('\n✅ 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testWithdrawFlow();
