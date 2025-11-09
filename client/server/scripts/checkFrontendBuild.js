const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('前端构建检查');
console.log('========================================\n');

// 检查 dist 文件夹
const distPath = path.join(__dirname, '..', '..', 'dist');
console.log(`检查路径: ${distPath}\n`);

if (fs.existsSync(distPath)) {
  console.log('✅ dist 文件夹存在');
  
  // 检查 index.html
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('✅ index.html 存在');
    
    // 列出 dist 文件夹内容
    const files = fs.readdirSync(distPath);
    console.log(`\n📁 dist 文件夹内容 (${files.length} 项):`);
    files.forEach(file => {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      const type = stats.isDirectory() ? '📁' : '📄';
      console.log(`   ${type} ${file}`);
    });
    
    console.log('\n✅ 前端构建文件完整');
    console.log('   服务器应该能正常提供前端页面');
  } else {
    console.log('❌ index.html 不存在');
    console.log('   dist 文件夹存在但内容不完整');
  }
} else {
  console.log('❌ dist 文件夹不存在');
  console.log('\n需要构建前端:');
  console.log('   1. 在项目根目录运行: npm run build');
  console.log('   2. 或运行: deploy.bat');
  console.log('   3. 构建完成后重启服务器');
}

console.log('\n========================================');
