const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testWithdrawConfig() {
  try {
    console.log('🔗 连接数据库:', process.env.USER_MONGO_URI ? '配置已找到' : '配置未找到');
    
    // 连接数据库
    await mongoose.connect(process.env.USER_MONGO_URI);
    console.log('✅ 数据库连接成功');

    // 直接定义 SystemConfig Schema
    const systemConfigSchema = new mongoose.Schema({
      points: {
        minWithdrawAmountBalance: { type: Number, default: 1 },
        minWithdrawAmount: { type: Number, default: 10 },
        withdrawFee: { type: Number, default: 5 }
      }
    }, { timestamps: true });

    const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);

    // 获取系统配置
    const config = await SystemConfig.findOne();
    
    if (!config) {
      console.log('❌ 未找到系统配置');
      return;
    }

    console.log('\n📊 当前提现配置：');
    console.log('-----------------------------------');
    console.log(`提现到余额最低金额: $${config.points?.minWithdrawAmountBalance || 1}`);
    console.log(`提现到USDT最低金额: $${config.points?.minWithdrawAmount || 10}`);
    console.log(`提现手续费: ${config.points?.withdrawFee || 0}%`);
    console.log('-----------------------------------');

    // 测试公开API返回的数据
    const publicConfig = {
      withdraw: {
        minWithdrawAmount: config.points?.minWithdrawAmount || 10,
        minWithdrawAmountBalance: config.points?.minWithdrawAmountBalance || 1,
        withdrawFee: config.points?.withdrawFee || 0
      }
    };

    console.log('\n🌐 公开API返回的配置：');
    console.log(JSON.stringify(publicConfig, null, 2));

    console.log('\n✅ 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testWithdrawConfig();
