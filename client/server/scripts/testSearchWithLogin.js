const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// 登录并获取 token
async function login() {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    if (response.data.success) {
      return response.data.data.token;
    }
    throw new Error('登录失败');
  } catch (error) {
    console.error('❌ 登录失败:', error.message);
    throw error;
  }
}

// 测试搜索优化
async function testOptimizedSearch() {
  console.log('🧪 测试搜索优化效果\n');
  console.log('=' .repeat(60));

  // 先登录
  console.log('🔐 正在登录...');
  let token;
  try {
    token = await login();
    console.log('✅ 登录成功\n');
  } catch (error) {
    console.log('⚠️  登录失败，尝试不使用 token 继续测试\n');
  }

  // 测试用例
  const testCases = [
    { keyword: '13506793955', type: 'phone', description: '手机号搜索' },
    { keyword: '张三', type: 'name', description: '姓名搜索' },
    { keyword: '320', type: 'idcard', description: '身份证号前缀搜索' }
  ];

  for (const testCase of testCases) {
    console.log(`\n📱 测试: ${testCase.description}`);
    console.log(`🔍 关键词: ${testCase.keyword}`);
    console.log('-'.repeat(60));

    const startTime = Date.now();

    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.post(`${API_BASE}/search`, {
        query: testCase.keyword,
        type: testCase.type
      }, {
        headers,
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
          
          // 显示匹配的数据
          if (first.data) {
            const dataStr = JSON.stringify(first.data, null, 2);
            console.log(`   数据预览: ${dataStr.substring(0, 200)}...`);
          }
        }

        // 检查调试信息
        if (response.data.debug) {
          console.log(`\n🔍 调试信息:`);
          console.log(`   优先集合: ${response.data.debug.priorityCollections || 0}`);
          console.log(`   成功查询: ${response.data.debug.successfulQueries || 0}`);
          console.log(`   失败查询: ${response.data.debug.failedQueries || 0}`);
          if (response.data.debug.errors && response.data.debug.errors.length > 0) {
            console.log(`   错误: ${response.data.debug.errors.join(', ')}`);
          }
        }
      } else {
        console.log(`❌ 搜索失败: ${response.data.message}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ 请求失败 (${duration}ms)`);
      if (error.response) {
        console.log(`   状态码: ${error.response.status}`);
        console.log(`   错误: ${error.response.data?.message || error.message}`);
      } else if (error.code === 'ECONNABORTED') {
        console.log(`   错误: 请求超时`);
      } else {
        console.log(`   错误: ${error.message}`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ 测试完成\n');
  
  console.log('💡 优化效果总结:');
  console.log('   - 查询字段从 20+ 减少到 3-4 个');
  console.log('   - 使用精确匹配代替正则表达式');
  console.log('   - 优先搜索相关集合');
  console.log('   - 超时时间增加到 15 秒');
  console.log('   - 使用 Promise.allSettled 避免单点失败\n');
}

// 运行测试
testOptimizedSearch().catch(console.error);
