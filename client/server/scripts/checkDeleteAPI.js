const express = require('express');
const adminRoutes = require('../routes/admin');

console.log('🔍 检查删除用户API');
console.log('='.repeat(60));

// 检查路由是否包含DELETE方法
const router = adminRoutes;
const routes = router.stack || [];

console.log(`\n找到 ${routes.length} 个路由`);

let deleteRouteFound = false;

routes.forEach((layer, index) => {
  if (layer.route) {
    const methods = Object.keys(layer.route.methods);
    const path = layer.route.path;
    
    if (methods.includes('delete') && path.includes(':userId')) {
      console.log(`\n✅ 找到删除用户API:`);
      console.log(`   路径: ${path}`);
      console.log(`   方法: ${methods.join(', ').toUpperCase()}`);
      deleteRouteFound = true;
    }
  }
});

if (!deleteRouteFound) {
  console.log('\n❌ 未找到删除用户API');
  console.log('   可能需要重启服务器');
} else {
  console.log('\n✅ 删除用户API已注册');
}

console.log('\n提示: 如果API已注册但仍然失败，请检查:');
console.log('  1. 服务器是否已重启');
console.log('  2. 浏览器控制台的错误信息');
console.log('  3. 服务器日志的错误信息');
