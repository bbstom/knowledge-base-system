/**
 * 测试财务报表日期处理
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('\n🧪 测试财务报表日期处理\n');
console.log('当前时区:', process.env.TZ || '系统默认');
console.log('当前时间:', new Date().toLocaleString('zh-CN'));
console.log('');

// 测试场景1：使用字符串创建日期（旧方法 - 有问题）
console.log('❌ 旧方法（有时区问题）:');
const oldStartDate = new Date('2024-11-08T00:00:00');
const oldEndDate = new Date('2024-11-08T23:59:59');
console.log('  输入: 2024-11-08');
console.log('  startDate:', oldStartDate.toISOString());
console.log('  startDate (本地):', oldStartDate.toLocaleString('zh-CN'));
console.log('  endDate:', oldEndDate.toISOString());
console.log('  endDate (本地):', oldEndDate.toLocaleString('zh-CN'));
console.log('');

// 测试场景2：使用年月日创建日期（新方法 - 正确）
console.log('✅ 新方法（无时区问题）:');
const [startYear, startMonth, startDay] = '2024-11-08'.split('-').map(Number);
const [endYear, endMonth, endDay] = '2024-11-08'.split('-').map(Number);

const newStartDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
const newEndDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

console.log('  输入: 2024-11-08');
console.log('  startDate:', newStartDate.toISOString());
console.log('  startDate (本地):', newStartDate.toLocaleString('zh-CN'));
console.log('  endDate:', newEndDate.toISOString());
console.log('  endDate (本地):', newEndDate.toLocaleString('zh-CN'));
console.log('');

// 测试场景3：对比差异
console.log('📊 时间差异对比:');
console.log('  旧方法 startDate UTC:', oldStartDate.toISOString());
console.log('  新方法 startDate UTC:', newStartDate.toISOString());
console.log('  时间差:', (newStartDate - oldStartDate) / (1000 * 60 * 60), '小时');
console.log('');

// 测试场景4：查询范围对比
console.log('🔍 查询范围对比:');
console.log('  旧方法查询范围:');
console.log('    从 UTC:', oldStartDate.toISOString());
console.log('    到 UTC:', oldEndDate.toISOString());
console.log('  新方法查询范围:');
console.log('    从 UTC:', newStartDate.toISOString());
console.log('    到 UTC:', newEndDate.toISOString());
console.log('');

// 测试场景5：模拟数据库查询
console.log('💾 模拟数据库查询:');
const testTimestamps = [
  new Date('2024-11-07T16:00:00.000Z'), // 北京时间 2024-11-08 00:00:00
  new Date('2024-11-08T02:00:00.000Z'), // 北京时间 2024-11-08 10:00:00
  new Date('2024-11-08T14:00:00.000Z'), // 北京时间 2024-11-08 22:00:00
  new Date('2024-11-08T15:59:59.999Z'), // 北京时间 2024-11-08 23:59:59
  new Date('2024-11-08T16:00:00.000Z')  // 北京时间 2024-11-09 00:00:00
];

console.log('  测试数据（UTC时间）:');
testTimestamps.forEach((ts, i) => {
  console.log(`    ${i + 1}. ${ts.toISOString()} (北京: ${ts.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })})`);
});
console.log('');

console.log('  旧方法匹配结果:');
testTimestamps.forEach((ts, i) => {
  const match = ts >= oldStartDate && ts <= oldEndDate;
  console.log(`    ${i + 1}. ${match ? '✅ 匹配' : '❌ 不匹配'}`);
});
console.log('');

console.log('  新方法匹配结果:');
testTimestamps.forEach((ts, i) => {
  const match = ts >= newStartDate && ts <= newEndDate;
  console.log(`    ${i + 1}. ${match ? '✅ 匹配' : '❌ 不匹配'}`);
});
console.log('');

// 测试场景6：跨天查询
console.log('📅 跨天查询测试:');
const [rangeStartYear, rangeStartMonth, rangeStartDay] = '2024-11-08'.split('-').map(Number);
const [rangeEndYear, rangeEndMonth, rangeEndDay] = '2024-11-10'.split('-').map(Number);

const rangeStart = new Date(rangeStartYear, rangeStartMonth - 1, rangeStartDay, 0, 0, 0, 0);
const rangeEnd = new Date(rangeEndYear, rangeEndMonth - 1, rangeEndDay, 23, 59, 59, 999);

console.log('  查询范围: 2024-11-08 至 2024-11-10');
console.log('  开始时间 (UTC):', rangeStart.toISOString());
console.log('  开始时间 (本地):', rangeStart.toLocaleString('zh-CN'));
console.log('  结束时间 (UTC):', rangeEnd.toISOString());
console.log('  结束时间 (本地):', rangeEnd.toLocaleString('zh-CN'));
console.log('  天数:', Math.ceil((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24)) + 1);
console.log('');

// 总结
console.log('📝 总结:');
console.log('  ❌ 旧方法问题: 使用 ISO 字符串创建日期会被解析为 UTC 时间');
console.log('     例如: new Date("2024-11-08T00:00:00") 在 UTC+8 时区会提前 8 小时');
console.log('');
console.log('  ✅ 新方法优势: 使用年月日参数创建日期，直接使用本地时区');
console.log('     例如: new Date(2024, 10, 8, 0, 0, 0) 始终是本地时间的 2024-11-08 00:00:00');
console.log('');
console.log('  🎯 修复效果: 查询"2024-11-08"的数据时，会正确匹配本地时间的这一天');
console.log('     而不是 UTC 时间的这一天（会差 8 小时）');
console.log('');

console.log('✅ 测试完成！');
