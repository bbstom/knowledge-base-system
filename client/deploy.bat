@echo off
echo ========================================
echo 前端构建和部署脚本
echo ========================================
echo.

echo [1/3] 构建前端...
call npm run build
if errorlevel 1 (
    echo.
    echo ❌ 构建失败！
    pause
    exit /b 1
)

echo.
echo [2/3] 检查构建文件...
if exist "dist\index.html" (
    echo ✅ 构建成功！
) else (
    echo ❌ 构建文件不存在！
    pause
    exit /b 1
)

echo.
echo [3/3] 提示重启服务器...
echo.
echo ========================================
echo ✅ 前端构建完成！
echo ========================================
echo.
echo 请执行以下命令重启后端服务器:
echo.
echo   方式1 - 使用 PM2:
echo   pm2 restart all
echo.
echo   方式2 - 直接运行:
echo   cd server
echo   node index.js
echo.
echo ========================================
pause
