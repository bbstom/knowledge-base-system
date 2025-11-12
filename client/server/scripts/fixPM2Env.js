#!/usr/bin/env node

/**
 * PM2环境变量诊断和修复脚本
 * 用于检查和修复PM2无法加载.env文件的问题
 */

const fs = require('fs');
const path = require('path');

console.log('=== PM2环境变量诊断 ===\n');

// 1. 检查.env文件
const envPath = path.join(__dirname, '../.env');
console.log('1. 检查.env文件:');
console.log(`   路径: ${envPath}`);

if (fs.existsSync(envPath)) {
  console.log('   ✓ .env文件存在');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  console.log('\n2. 环境变量内容:');
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key] = line.split('=');
      if (key && key.includes('MONGO_URI')) {
        console.log(`   ✓ ${key.trim()}`);
      }
    }
  });
} else {
  console.log('   ✗ .env文件不存在！');
  process.exit(1);
}

// 3. 检查当前进程环境变量
console.log('\n3. 当前进程环境变量:');
console.log(`   USER_MONGO_URI: ${process.env.USER_MONGO_URI ? '已设置' : '未设置'}`);
console.log(`   QUERY_MONGO_URI: ${process.env.QUERY_MONGO_URI ? '已设置' : '未设置'}`);

// 4. 生成PM2 ecosystem配置文件
console.log('\n4. 生成PM2 ecosystem配置文件...');

const ecosystemConfig = {
  apps: [{
    name: 'base2',
    script: './server/index.js',
    cwd: path.join(__dirname, '../..'),
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_file: './server/.env',
    // 确保PM2加载.env文件
    dotenv: true,
    // 错误日志
    error_file: './logs/pm2-error.log',
    // 输出日志
    out_file: './logs/pm2-out.log',
    // 日志时间格式
    time: true
  }]
};

const ecosystemPath = path.join(__dirname, '../../ecosystem.config.js');
const ecosystemContent = `module.exports = ${JSON.stringify(ecosystemConfig, null, 2)};`;

fs.writeFileSync(ecosystemPath, ecosystemContent);
console.log(`   ✓ 已生成: ${ecosystemPath}`);

// 5. 生成启动脚本
console.log('\n5. 生成启动脚本...');

const startScript = `#!/bin/bash

# PM2环境变量修复启动脚本

echo "=== 停止现有PM2进程 ==="
pm2 stop base2 2>/dev/null || true
pm2 delete base2 2>/dev/null || true

echo ""
echo "=== 使用ecosystem配置启动 ==="
cd /var/www/html/knowledge-base-system/client
pm2 start ecosystem.config.js

echo ""
echo "=== 等待服务启动 ==="
sleep 3

echo ""
echo "=== 检查PM2状态 ==="
pm2 status

echo ""
echo "=== 查看最新日志 ==="
pm2 logs base2 --lines 30 --nostream

echo ""
echo "=== 完成 ==="
echo "如果还有问题，请运行: pm2 logs base2"
`;

const startScriptPath = path.join(__dirname, '../../start-pm2-fixed.sh');
fs.writeFileSync(startScriptPath, startScript);
fs.chmodSync(startScriptPath, '755');
console.log(`   ✓ 已生成: ${startScriptPath}`);

// 6. 生成Windows启动脚本
const startScriptWin = `@echo off
echo === 停止现有PM2进程 ===
pm2 stop base2 2>nul
pm2 delete base2 2>nul

echo.
echo === 使用ecosystem配置启动 ===
cd /d "%~dp0.."
pm2 start ecosystem.config.js

echo.
echo === 等待服务启动 ===
timeout /t 3 /nobreak >nul

echo.
echo === 检查PM2状态 ===
pm2 status

echo.
echo === 查看最新日志 ===
pm2 logs base2 --lines 30 --nostream

echo.
echo === 完成 ===
echo 如果还有问题，请运行: pm2 logs base2
pause
`;

const startScriptWinPath = path.join(__dirname, '../../start-pm2-fixed.bat');
fs.writeFileSync(startScriptWinPath, startScriptWin);
console.log(`   ✓ 已生成: ${startScriptWinPath}`);

console.log('\n=== 修复完成 ===');
console.log('\n下一步操作:');
console.log('1. Linux/Mac用户运行: ./start-pm2-fixed.sh');
console.log('2. Windows用户运行: start-pm2-fixed.bat');
console.log('3. 或手动运行: pm2 start ecosystem.config.js');
console.log('\n如果问题依然存在，请检查PM2日志: pm2 logs base2');
