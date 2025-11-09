require('dotenv').config();
const SearchData = require('../models/SearchData');
const Database = require('../models/Database');
const fs = require('fs');
const path = require('path');

/**
 * 从CSV或JSON文件导入搜索数据
 * 
 * CSV格式示例：
 * 姓名,身份证,手机号,QQ号,微信号,邮箱,地址,公司
 * 张三,110101199001011234,13800138000,123456789,zhangsan123,zhangsan@example.com,北京市朝阳区,某某科技
 * 
 * JSON格式示例：
 * [
 *   {
 *     "姓名": "张三",
 *     "身份证": "110101199001011234",
 *     "手机号": "13800138000",
 *     ...
 *   }
 * ]
 */

async function importSearchData(filePath, databaseId) {
  try {
    console.log('开始导入搜索数据...');
    console.log(`文件路径: ${filePath}`);
    console.log(`数据库ID: ${databaseId}`);

    // 检查数据库是否存在
    const database = await Database.findById(databaseId);
    if (!database) {
      console.error('数据库不存在！');
      process.exit(1);
    }

    console.log(`目标数据库: ${database.name}`);

    // 读取文件
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const ext = path.extname(filePath).toLowerCase();

    let records = [];

    if (ext === '.json') {
      // JSON格式
      records = JSON.parse(fileContent);
    } else if (ext === '.csv') {
      // CSV格式
      const lines = fileContent.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const record = {};
        headers.forEach((header, index) => {
          record[header] = values[index] || '';
        });
        records.push(record);
      }
    } else {
      console.error('不支持的文件格式！仅支持 .json 和 .csv');
      process.exit(1);
    }

    console.log(`读取到 ${records.length} 条记录`);

    // 字段映射（中文到英文）
    const fieldMapping = {
      '姓名': 'name',
      '身份证': 'idcard',
      '手机号': 'phone',
      'QQ号': 'qq',
      '微信号': 'wechat',
      '邮箱': 'email',
      '地址': 'address',
      '公司': 'company',
      // 英文字段
      'name': 'name',
      'idcard': 'idcard',
      'phone': 'phone',
      'qq': 'qq',
      'wechat': 'wechat',
      'email': 'email',
      'address': 'address',
      'company': 'company'
    };

    let successCount = 0;
    let errorCount = 0;

    for (const record of records) {
      try {
        // 创建data Map
        const dataMap = new Map();
        const searchableFields = {};

        // 处理每个字段
        for (const [key, value] of Object.entries(record)) {
          // 添加到data Map（保留原始字段名）
          dataMap.set(key, value);

          // 如果是可搜索字段，添加到searchableFields
          const mappedKey = fieldMapping[key] || fieldMapping[key.toLowerCase()];
          if (mappedKey && value) {
            searchableFields[mappedKey] = value;
          }
        }

        // 创建SearchData文档
        const searchData = new SearchData({
          databaseId: database._id,
          data: dataMap,
          searchableFields: searchableFields,
          isActive: true
        });

        await searchData.save();
        successCount++;
        
        if (successCount % 100 === 0) {
          console.log(`已导入 ${successCount} 条...`);
        }
      } catch (error) {
        errorCount++;
        console.error(`导入记录失败:`, error.message);
      }
    }

    // 更新数据库记录数
    const totalCount = await SearchData.countDocuments({ databaseId: database._id });
    database.recordCount = totalCount;
    await database.save();

    console.log('\n导入完成！');
    console.log(`成功: ${successCount} 条`);
    console.log(`失败: ${errorCount} 条`);
    console.log(`数据库总记录数: ${totalCount}`);

    process.exit(0);
  } catch (error) {
    console.error('导入失败:', error);
    process.exit(1);
  }
}

// 使用说明
if (process.argv.length < 4) {
  console.log('使用方法:');
  console.log('node importSearchData.js <文件路径> <数据库ID>');
  console.log('');
  console.log('示例:');
  console.log('node importSearchData.js data.json 507f1f77bcf86cd799439011');
  console.log('node importSearchData.js data.csv 507f1f77bcf86cd799439011');
  console.log('');
  console.log('支持的文件格式: .json, .csv');
  process.exit(1);
}

const filePath = process.argv[2];
const databaseId = process.argv[3];

// 检查文件是否存在
if (!fs.existsSync(filePath)) {
  console.error(`文件不存在: ${filePath}`);
  process.exit(1);
}

// 连接数据库
require('../config/database');

// 等待数据库连接
setTimeout(() => {
  importSearchData(filePath, databaseId);
}, 2000);
