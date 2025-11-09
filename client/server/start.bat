@echo off
echo ================================
echo 知识库系统后端服务器启动脚本
echo ================================

REM 检查Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js未安装，请先安装Node.js
    pause
    exit /b 1
)

echo ✅ Node.js已安装

REM 检查.env文件
if not exist .env (
    echo ❌ .env文件不存在，正在创建...
    copy .env.example .env
    echo ⚠️  请编辑.env文件配置环境变量
    pause
    exit /b 1
)

echo ✅ .env文件存在

REM 检查node_modules
if not exist node_modules (
    echo 📦 安装依赖...
    call npm install
)

echo ✅ 依赖已安装
echo.
echo 🚀 启动服务器...
echo.

call npm start
