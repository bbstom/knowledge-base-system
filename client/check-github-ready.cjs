#!/usr/bin/env node

/**
 * GitHub 上传准备检查脚本
 * 检查所有必要文件是否已创建，并验证敏感信息是否已清理
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 检查 GitHub 上传准备状态...\n');

// 必需文件列表
const requiredFiles = [
  { path: '.gitignore', name: 'Git 忽略文件' },
  { path: 'README.md', name: '项目说明文档' },
  { path: 'LICENSE', name: '开源许可证' },
  { path: 'CHANGELOG.md', name: '版本更新日志' },
  { path: 'CONTRIBUTING.md', name: '贡献指南' },
  { path: 'package.json', name: '项目配置文件' },
  { path: 'server/.env.example', name: '环境变量模板' },
  { path: '.github/ISSUE_TEMPLATE/bug_report.md', name: 'Bug 报告模板' },
  { path: '.github/ISSUE_TEMPLATE/feature_request.md', name: '功能请求模板' },
  { path: '.github/pull_request_template.md', name: 'PR 模板' }
];

// 检查结果
let allPassed = true;
let warnings = [];

console.log('📋 检查必需文件...\n');

// 检查必需文件
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file.path);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${file.name}: ${file.path}`);
  
  if (!exists) {
    allPassed = false;
  }
});

console.log('\n🔒 检查敏感文件...\n');

// 检查 .gitignore 是否存在
if (fs.existsSync('.gitignore')) {
  const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
  
  // 检查 .env 是否在 .gitignore 中
  if (gitignoreContent.includes('.env')) {
    console.log('✅ .env 文件已在 .gitignore 中');
  } else {
    console.log('❌ .env 文件未在 .gitignore 中');
    allPassed = false;
  }
  
  // 检查 node_modules 是否在 .gitignore 中
  if (gitignoreContent.includes('node_modules')) {
    console.log('✅ node_modules 已在 .gitignore 中');
  } else {
    console.log('⚠️  node_modules 未在 .gitignore 中');
    warnings.push('建议将 node_modules 添加到 .gitignore');
  }
} else {
  console.log('❌ .gitignore 文件不存在');
  allPassed = false;
}

// 检查 .env 文件是否存在（不应该被提交）
if (fs.existsSync('server/.env')) {
  console.log('⚠️  server/.env 文件存在（确保它在 .gitignore 中）');
  warnings.push('确保 server/.env 不会被提交到 Git');
}

console.log('\n📦 检查项目结构...\n');

// 检查主要目录
const mainDirs = ['client', 'server', '.github'];
mainDirs.forEach(dir => {
  const exists = fs.existsSync(dir);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${dir}/ 目录`);
  
  if (!exists) {
    allPassed = false;
  }
});

console.log('\n🔍 检查 package.json 配置...\n');

// 检查 package.json
if (fs.existsSync('package.json')) {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // 检查必要字段
    const requiredFields = ['name', 'version', 'description', 'license'];
    requiredFields.forEach(field => {
      if (packageJson[field]) {
        console.log(`✅ ${field}: ${packageJson[field]}`);
      } else {
        console.log(`⚠️  ${field} 字段缺失`);
        warnings.push(`建议在 package.json 中添加 ${field} 字段`);
      }
    });
    
    // 检查仓库信息
    if (packageJson.repository) {
      console.log(`✅ repository: ${packageJson.repository.url || packageJson.repository}`);
    } else {
      console.log('⚠️  repository 字段缺失');
      warnings.push('建议在 package.json 中添加 repository 字段');
    }
  } catch (error) {
    console.log('❌ package.json 格式错误');
    allPassed = false;
  }
}

console.log('\n📝 检查 README.md 内容...\n');

// 检查 README.md
if (fs.existsSync('README.md')) {
  const readmeContent = fs.readFileSync('README.md', 'utf8');
  
  // 检查必要章节
  const requiredSections = [
    { text: '功能特性', found: readmeContent.includes('功能') || readmeContent.includes('Features') },
    { text: '技术栈', found: readmeContent.includes('技术栈') || readmeContent.includes('Tech Stack') },
    { text: '安装部署', found: readmeContent.includes('安装') || readmeContent.includes('Installation') },
    { text: '使用指南', found: readmeContent.includes('使用') || readmeContent.includes('Usage') }
  ];
  
  requiredSections.forEach(section => {
    const status = section.found ? '✅' : '⚠️ ';
    console.log(`${status} ${section.text} 章节`);
    
    if (!section.found) {
      warnings.push(`建议在 README.md 中添加 ${section.text} 章节`);
    }
  });
}

console.log('\n🎯 检查环境变量模板...\n');

// 检查 .env.example
if (fs.existsSync('server/.env.example')) {
  const envExample = fs.readFileSync('server/.env.example', 'utf8');
  
  // 检查必要的环境变量
  const requiredEnvVars = [
    'PORT',
    'MONGO_URI',
    'JWT_SECRET',
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (envExample.includes(envVar)) {
      console.log(`✅ ${envVar}`);
    } else {
      console.log(`⚠️  ${envVar} 缺失`);
      warnings.push(`建议在 .env.example 中添加 ${envVar}`);
    }
  });
}

// 输出总结
console.log('\n' + '='.repeat(60));
console.log('\n📊 检查总结\n');

if (allPassed && warnings.length === 0) {
  console.log('🎉 恭喜！所有检查都通过了！');
  console.log('✅ 你的项目已经准备好上传到 GitHub 了！\n');
  console.log('📝 下一步：');
  console.log('   1. 查看 GITHUB_READY.md 获取快速上传命令');
  console.log('   2. 或查看 UPLOAD_TO_GITHUB.md 获取详细指南\n');
} else {
  if (!allPassed) {
    console.log('❌ 有些必需文件缺失，请先创建它们。\n');
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  发现以下警告：\n');
    warnings.forEach((warning, index) => {
      console.log(`   ${index + 1}. ${warning}`);
    });
    console.log('\n这些警告不会阻止上传，但建议修复以获得更好的效果。\n');
  }
}

console.log('='.repeat(60) + '\n');

// 退出码
process.exit(allPassed ? 0 : 1);
