require('dotenv').config();
const SearchData = require('../models/SearchData');
const Database = require('../models/Database');

async function addTestSearchData() {
  try {
    console.log('开始添加测试搜索数据...');

    // 获取第一个数据库（如果没有则创建一个测试数据库）
    let database = await Database.findOne({ isActive: true });
    
    if (!database) {
      console.log('没有找到数据库，创建测试数据库...');
      database = new Database({
        name: '测试数据库',
        description: '用于测试搜索功能的数据库',
        source: '测试数据',
        isActive: true,
        recordCount: 0,
        supportedTypes: ['name', 'phone', 'idcard', 'qq', 'wechat', 'email', 'address', 'company'],
        lastUpdated: new Date()
      });
      await database.save();
      console.log('测试数据库已创建');
    }
    
    if (!database) {
      console.log('请先创建数据库！');
      process.exit(1);
    }

    console.log(`使用数据库: ${database.name}`);

    // 清除现有搜索数据
    await SearchData.deleteMany({ databaseId: database._id });
    console.log('已清除现有搜索数据');

    // 添加测试数据
    const testData = [
      {
        databaseId: database._id,
        data: new Map([
          ['姓名', '张三'],
          ['身份证', '110101199001011234'],
          ['手机号', '13800138000'],
          ['QQ号', '123456789'],
          ['微信号', 'zhangsan123'],
          ['邮箱', 'zhangsan@example.com'],
          ['地址', '北京市朝阳区某某街道'],
          ['公司', '某某科技有限公司']
        ]),
        searchableFields: {
          name: '张三',
          idcard: '110101199001011234',
          phone: '13800138000',
          qq: '123456789',
          wechat: 'zhangsan123',
          email: 'zhangsan@example.com',
          address: '北京市朝阳区某某街道',
          company: '某某科技有限公司'
        },
        isActive: true
      },
      {
        databaseId: database._id,
        data: new Map([
          ['姓名', '李四'],
          ['身份证', '110101199002021234'],
          ['手机号', '13900139000'],
          ['QQ号', '987654321'],
          ['微信号', 'lisi456'],
          ['邮箱', 'lisi@example.com'],
          ['地址', '上海市浦东新区某某路'],
          ['公司', '某某互联网公司']
        ]),
        searchableFields: {
          name: '李四',
          idcard: '110101199002021234',
          phone: '13900139000',
          qq: '987654321',
          wechat: 'lisi456',
          email: 'lisi@example.com',
          address: '上海市浦东新区某某路',
          company: '某某互联网公司'
        },
        isActive: true
      },
      {
        databaseId: database._id,
        data: new Map([
          ['姓名', '王五'],
          ['身份证', '110101199003031234'],
          ['手机号', '13700137000'],
          ['QQ号', '555666777'],
          ['微信号', 'wangwu789'],
          ['邮箱', 'wangwu@example.com'],
          ['地址', '广州市天河区某某大道'],
          ['公司', '某某贸易公司']
        ]),
        searchableFields: {
          name: '王五',
          idcard: '110101199003031234',
          phone: '13700137000',
          qq: '555666777',
          wechat: 'wangwu789',
          email: 'wangwu@example.com',
          address: '广州市天河区某某大道',
          company: '某某贸易公司'
        },
        isActive: true
      },
      {
        databaseId: database._id,
        data: new Map([
          ['姓名', '赵六'],
          ['身份证', '110101199004041234'],
          ['手机号', '13600136000'],
          ['QQ号', '111222333'],
          ['微信号', 'zhaoliu000'],
          ['邮箱', 'zhaoliu@example.com'],
          ['地址', '深圳市南山区某某街'],
          ['公司', '某某电子商务公司']
        ]),
        searchableFields: {
          name: '赵六',
          idcard: '110101199004041234',
          phone: '13600136000',
          qq: '111222333',
          wechat: 'zhaoliu000',
          email: 'zhaoliu@example.com',
          address: '深圳市南山区某某街',
          company: '某某电子商务公司'
        },
        isActive: true
      },
      {
        databaseId: database._id,
        data: new Map([
          ['姓名', '孙七'],
          ['身份证', '110101199005051234'],
          ['手机号', '13500135000'],
          ['QQ号', '444555666'],
          ['微信号', 'sunqi111'],
          ['邮箱', 'sunqi@example.com'],
          ['地址', '杭州市西湖区某某路'],
          ['公司', '某某网络科技公司']
        ]),
        searchableFields: {
          name: '孙七',
          idcard: '110101199005051234',
          phone: '13500135000',
          qq: '444555666',
          wechat: 'sunqi111',
          email: 'sunqi@example.com',
          address: '杭州市西湖区某某路',
          company: '某某网络科技公司'
        },
        isActive: true
      }
    ];

    for (const data of testData) {
      const searchData = new SearchData(data);
      await searchData.save();
      console.log(`✓ 已添加数据: ${data.searchableFields.name}`);
    }

    // 更新数据库记录数
    const count = await SearchData.countDocuments({ databaseId: database._id });
    database.recordCount = count;
    await database.save();

    console.log('\n测试搜索数据添加完成！');
    console.log(`共添加 ${testData.length} 条数据到数据库: ${database.name}`);
    console.log('\n可以尝试搜索:');
    console.log('- 姓名: 张三, 李四, 王五');
    console.log('- 手机号: 138, 139, 137');
    console.log('- 身份证: 110101');
    console.log('- QQ号: 123456789');
    
    process.exit(0);
  } catch (error) {
    console.error('添加测试搜索数据失败:', error);
    process.exit(1);
  }
}

// 连接数据库
require('../config/database');

// 等待数据库连接
setTimeout(() => {
  addTestSearchData();
}, 2000);
