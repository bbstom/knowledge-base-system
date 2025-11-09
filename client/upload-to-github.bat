@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   GitHub 上传助手
echo ========================================
echo.

REM 检查是否已经初始化 Git
if not exist ".git" (
    echo [1/6] 初始化 Git 仓库...
    git init
    if !ERRORLEVEL! NEQ 0 (
        echo 错误: Git 初始化失败
        pause
        exit /b 1
    )
    echo ✅ Git 仓库初始化完成
) else (
    echo ✅ Git 仓库已存在
)

echo.
echo [2/6] 添加文件到暂存区...
git add .
if !ERRORLEVEL! NEQ 0 (
    echo 错误: 添加文件失败
    pause
    exit /b 1
)
echo ✅ 文件已添加

echo.
echo [3/6] 创建初始提交...
git commit -m "🎉 Initial release: Knowledge Base Management System v1.1.0

✨ Features:
- Complete user authentication and authorization system
- Points and referral management with multi-level rewards
- Admin dashboard with real-time analytics and monitoring
- Backup and restore functionality with version control
- Email templates and notification system
- Multi-timezone support with automatic conversion
- Code backup feature for system files
- Activity logging and audit trail
- Search optimization with timeout handling
- Real-time system monitoring and alerts

🛠️ Tech Stack:
- Frontend: React 18 + TypeScript + Tailwind CSS + Vite
- Backend: Node.js + Express + MongoDB + Mongoose
- Deployment: PM2 + Nginx + SSL/TLS

📦 Ready for production deployment!
Version: 1.1.0
License: MIT"

if !ERRORLEVEL! NEQ 0 (
    echo 错误: 提交失败
    pause
    exit /b 1
)
echo ✅ 提交完成

echo.
echo [4/6] 请输入你的 GitHub 用户名:
set /p username="用户名: "

if "!username!"=="" (
    echo 错误: 用户名不能为空
    pause
    exit /b 1
)

echo.
echo [5/6] 连接远程仓库...
git remote add origin https://github.com/!username!/knowledge-base-system.git
git branch -M main

echo ✅ 远程仓库已连接

echo.
echo [6/6] 推送到 GitHub...
echo.
echo 注意: 如果这是第一次推送，可能需要输入 GitHub 凭据
echo.

git push -u origin main

if !ERRORLEVEL! NEQ 0 (
    echo.
    echo ⚠️  推送失败。可能的原因:
    echo    1. 仓库不存在 - 请先在 GitHub 创建仓库
    echo    2. 认证失败 - 请检查你的 GitHub 凭据
    echo    3. 网络问题 - 请检查网络连接
    echo.
    echo 请访问 https://github.com/new 创建仓库
    echo 仓库名称: knowledge-base-system
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ 推送成功！

echo.
echo [额外] 创建版本标签...
git tag -a v1.1.0 -m "Version 1.1.0 - Complete knowledge base system"
git push origin v1.1.0

if !ERRORLEVEL! EQU 0 (
    echo ✅ 版本标签已创建
)

echo.
echo ========================================
echo   🎉 上传完成！
echo ========================================
echo.
echo 你的项目现在已经在 GitHub 上了！
echo.
echo 仓库地址: https://github.com/!username!/knowledge-base-system
echo.
echo 下一步建议:
echo   1. 在 GitHub 上设置仓库描述和标签
echo   2. 添加 README 徽章
echo   3. 配置分支保护规则
echo   4. 分享你的项目
echo.

pause
