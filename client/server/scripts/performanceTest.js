/**
 * 性能测试脚本 - 测试API响应时间和并发性能
 * 使用方法: node server/scripts/performanceTest.js
 */

require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3001';
const CONCURRENT_REQUESTS = 10;
const TEST_DURATION = 5000; // 5秒

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * 测试单个API端点的响应时间
 */
async function testEndpoint(name, url, method = 'GET', data = null, headers = {}) {
  const times = [];
  const errors = [];
  
  console.log(`\n${colors.cyan}测试: ${name}${colors.reset}`);
  console.log(`URL: ${url}`);
  console.log(`方法: ${method}`);
  
  // 执行10次请求
  for (let i = 0; i < 10; i++) {
    const startTime = Date.now();
    try {
      const config = {
        method,
        url,
        headers,
        ...(data && { data })
      };
      
      await axios(config);
      const responseTime = Date.now() - startTime;
      times.push(responseTime);
    } catch (error) {
      errors.push(error.message);
    }
  }
  
  if (times.length > 0) {
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    
    console.log(`${colors.green}✓${colors.reset} 平均响应时间: ${avg.toFixed(2)}ms`);
    console.log(`  最快: ${min}ms | 最慢: ${max}ms`);
    
    if (avg < 100) {
      console.log(`  ${colors.green}性能: 优秀${colors.reset}`);
    } else if (avg < 500) {
      console.log(`  ${colors.yellow}性能: 良好${colors.reset}`);
    } else {
      console.log(`  ${colors.red}性能: 需要优化${colors.reset}`);
    }
  }
  
  if (errors.length > 0) {
    console.log(`${colors.red}✗${colors.reset} 错误数: ${errors.length}`);
  }
  
  return { times, errors, avg: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0 };
}

/**
 * 并发测试
 */
async function concurrentTest(name, url, concurrency = 10) {
  console.log(`\n${colors.cyan}并发测试: ${name}${colors.reset}`);
  console.log(`并发数: ${concurrency}`);
  
  const startTime = Date.now();
  const promises = [];
  
  for (let i = 0; i < concurrency; i++) {
    promises.push(
      axios.get(url).catch(error => ({ error: error.message }))
    );
  }
  
  const results = await Promise.all(promises);
  const totalTime = Date.now() - startTime;
  
  const successful = results.filter(r => !r.error).length;
  const failed = results.filter(r => r.error).length;
  
  console.log(`${colors.green}✓${colors.reset} 成功: ${successful} | ${colors.red}失败: ${failed}${colors.reset}`);
  console.log(`  总耗时: ${totalTime}ms`);
  console.log(`  平均每请求: ${(totalTime / concurrency).toFixed(2)}ms`);
  console.log(`  QPS: ${(concurrency / (totalTime / 1000)).toFixed(2)}`);
  
  return { successful, failed, totalTime };
}

/**
 * 主测试函数
 */
async function runPerformanceTests() {
  console.log(`\n${colors.blue}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║     API 性能测试                       ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════╝${colors.reset}`);
  console.log(`\n测试服务器: ${colors.yellow}${BASE_URL}${colors.reset}\n`);
  
  const results = [];
  
  // 1. 健康检查
  results.push(await testEndpoint(
    '健康检查',
    `${BASE_URL}/health`
  ));
  
  // 2. 公开配置
  results.push(await testEndpoint(
    '获取公开配置',
    `${BASE_URL}/api/system-config/public-config`
  ));
  
  // 3. 积分说明配置
  results.push(await testEndpoint(
    '获取积分说明',
    `${BASE_URL}/api/system-config/points-descriptions`
  ));
  
  // 4. FAQ列表
  results.push(await testEndpoint(
    '获取FAQ列表',
    `${BASE_URL}/api/faqs`
  ));
  
  // 5. 热门话题
  results.push(await testEndpoint(
    '获取热门话题',
    `${BASE_URL}/api/topics`
  ));
  
  // 并发测试
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}并发性能测试${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  
  await concurrentTest('健康检查', `${BASE_URL}/health`, 20);
  await concurrentTest('公开配置', `${BASE_URL}/api/system-config/public-config`, 20);
  
  // 总结
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}性能测试总结${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  
  const avgResponseTime = results.reduce((sum, r) => sum + r.avg, 0) / results.length;
  
  console.log(`平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
  
  if (avgResponseTime < 100) {
    console.log(`${colors.green}✓ 性能评级: 优秀${colors.reset}\n`);
  } else if (avgResponseTime < 500) {
    console.log(`${colors.yellow}✓ 性能评级: 良好${colors.reset}\n`);
  } else {
    console.log(`${colors.red}✗ 性能评级: 需要优化${colors.reset}\n`);
  }
  
  console.log('建议:');
  console.log('- API响应时间应 < 100ms');
  console.log('- 数据库查询应 < 50ms');
  console.log('- 支持至少100并发用户\n');
}

// 运行测试
runPerformanceTests().catch(error => {
  console.error(`\n${colors.red}测试执行出错:${colors.reset}`, error.message);
  process.exit(1);
});
