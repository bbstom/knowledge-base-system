const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// 测试搜索优化
async function testOptimizedSearch() {
  console.log('🧪 测试搜索优化效果\n');
  console.log('=' .repeat(60));

  // 测试用例
  const testCases = [
    { keyword: '13506793955', description: '手机号搜索' },
    { keyword: '张三', description: '姓名搜索' },
    { keyword: '320', description: '身份证号前缀搜索' }
  ];

  for (const testCase of testCases) {
    console.log(`\n📱 测试: ${testCase.description}`);
    console.log(`🔍 关键词: ${testCase.keyword}`);
    console.log('-'.repeat(60));

    const startTime = Date.now();

    try {
      const response = await axios.post(`${API_BASE}/search`, {
        keyword: testCase.keyword,
        page: 1,
        pageSize: 10
      }, {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        },
        timeout: 20000 // 20秒超时
      });

      const duration = Date.now() - startTime;

      if (response.data.success) {
        console.log(`✅ 搜索成功`);
        console.log(`⏱️  耗时: ${duration}ms`);
        console.log(`📊 结果数量: ${response.data.data.total}`);
        console.log(`📄 当前页: ${response.data.data.results.length} 条`);
        
        if (response.data.data.results.length > 0) {
          console.log(`\n📝 第一条结果示例:`);
          const first = response.data.data.results[0];
          console.log(`   集合: ${first.collectionName}`);
          console.log(`   类型: ${first.type}`);
          console.log(`   匹配字段: ${first.matchedField || '未知'}`);
          console.log(`   数据: ${JSON.stringify(first.data).substring(0, 100)}...`);
        }

        // 检查日志信息
        if (response.data.debug) {
          console.log(`\n🔍 调试信息:`);
          console.log(`   优先集合: ${response.data.debug.priorityCollections || 0}`);
          console.log(`   成功查询: ${response.data.debug.successfulQueries || 0}`);
          console.log(`   失败查询: ${response.data.debug.failedQueries || 0}`);
        }
      } else {
        console.log(`❌ 搜索失败: ${response.data.message}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ 请求失败 (${duration}ms)`);
      if (error.response) {
        console.log(`   状态码: ${error.response.status}`);
        console.log(`   错误: ${error.response.data.message || error.message}`);
      } else if (error.code === 'ECONNABORTED') {
        console.log(`   错误: 请求超时`);
      } else {
        console.log(`   错误: ${error.message}`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ 测试完成\n');
}

// 运行测试
testOptimizedSearch().catch(console.error);
