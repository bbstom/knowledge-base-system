require('dotenv').config();
const { queryConnection } = require('../config/database');
const Database = require('../models/Database');

async function syncDatabases() {
  try {
    console.log('开始同步数据库记录...\n');

    // 等待数据库连接
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 获取查询数据库中的所有集合
    const collections = await queryConnection.db.listCollections().toArray();
    console.log(`查询数据库中有 ${collections.length} 个集合\n`);

    // 过滤掉系统集合
    const systemCollections = ['sitesettings', 'systemconfigs', 'commissiontransactions', 'transactions', 
                               'searchdatas', 'users', 'invitationlogs', 'withdrawalrequests', 
                               'useractivities', 'databases', 'admins', 'searchlogs'];
    
    const dataCollections = collections.filter(c => !systemCollections.includes(c.name));
    
    console.log(`找到 ${dataCollections.length} 个数据集合:\n`);
    dataCollections.forEach(c => console.log(`  - ${c.name}`));
    console.log('');

    // 获取现有的Database记录
    const existingDatabases = await Database.find();
    console.log(`现有 ${existingDatabases.length} 个Database记录\n`);

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const collection of dataCollections) {
      const collectionName = collection.name;
      
      // 检查是否已存在
      let database = await Database.findOne({ name: collectionName });
      
      // 获取集合统计信息
      const coll = queryConnection.db.collection(collectionName);
      const count = await coll.countDocuments();
      
      // 获取示例数据以确定支持的搜索类型
      let supportedTypes = ['name', 'phone', 'idcard'];
      if (count > 0) {
        const sample = await coll.findOne();
        const fields = Object.keys(sample);
        
        supportedTypes = [];
        if (fields.some(f => ['姓名', 'Name', 'name', '法人', '联系人'].includes(f))) {
          supportedTypes.push('name');
        }
        if (fields.some(f => ['手机号', 'Mobile', 'phone', 'Tel'].includes(f))) {
          supportedTypes.push('phone');
        }
        if (fields.some(f => ['身份证号', 'CardNo', 'idCard'].includes(f))) {
          supportedTypes.push('idcard');
        }
        if (fields.some(f => ['QQ号', 'QQ', 'qq'].includes(f))) {
          supportedTypes.push('qq');
        }
        if (fields.some(f => ['微信号', 'wechat', 'WeChat'].includes(f))) {
          supportedTypes.push('wechat');
        }
        if (fields.some(f => ['邮箱', 'EMail', 'email'].includes(f))) {
          supportedTypes.push('email');
        }
        if (fields.some(f => ['地址', 'Address'].includes(f))) {
          supportedTypes.push('address');
        }
        if (fields.some(f => ['公司', 'Company', '工作单位'].includes(f))) {
          supportedTypes.push('company');
        }
      }

      if (database) {
        // 更新现有记录
        database.recordCount = count;
        database.supportedTypes = supportedTypes;
        database.lastUpdated = new Date();
        await database.save();
        console.log(`✓ 更新: ${collectionName} (${count} 条记录)`);
        updated++;
      } else {
        // 创建新记录
        database = new Database({
          name: collectionName,
          description: `${collectionName} 数据库`,
          source: '导入数据',
          isActive: true,
          recordCount: count,
          supportedTypes: supportedTypes,
          lastUpdated: new Date()
        });
        await database.save();
        console.log(`✓ 创建: ${collectionName} (${count} 条记录)`);
        created++;
      }
    }

    console.log('\n同步完成！');
    console.log(`创建: ${created} 个`);
    console.log(`更新: ${updated} 个`);
    console.log(`跳过: ${skipped} 个`);
    
    // 显示所有Database记录
    const allDatabases = await Database.find({ isActive: true });
    console.log(`\n当前启用的数据库 (${allDatabases.length} 个):`);
    allDatabases.forEach(db => {
      console.log(`  - ${db.name} (${db.recordCount} 条记录)`);
      console.log(`    支持搜索: ${db.supportedTypes.join(', ')}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('同步失败:', error);
    process.exit(1);
  }
}

syncDatabases();
