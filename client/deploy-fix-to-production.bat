@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   生产环境PM2修复部署
echo ========================================
echo.

REM 检查是否在正确的目录
if not exist "server\index.js" (
    echo [错误] 请在项目根目录运行此脚本
    echo 当前目录: %CD%
    pause
    exit /b 1
)

echo [1/5] 检查server/index.js...

REM 检查是否已包含修复
findstr /C:"path: require('path').join(__dirname, '.env')" server\index.js >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] server/index.js 已包含修复
) else (
    echo [警告] server/index.js 需要更新
    echo.
    echo 请手动编辑 server/index.js
    echo 将第一行改为:
    echo require('dotenv').config({ path: require('path').join(__dirname, '.env') });
    echo.
    pause
)

echo.
echo [2/5] 检查.env文件...

if not exist "server\.env" (
    echo [错误] server/.env 文件不存在！
    pause
    exit /b 1
)

findstr /C:"USER_MONGO_URI" server\.env >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] .env 文件包含 USER_MONGO_URI
) else (
    echo [错误] .env 文件缺少 USER_MONGO_URI
    pause
    exit /b 1
)

echo.
echo [3/5] 停止旧的PM2进程...

pm2 stop base2 2>nul
pm2 delete base2 2>nul

echo.
echo [4/5] 启动PM2服务...

if exist "start-pm2-with-env.cjs" (
    echo 使用智能启动脚本...
    node start-pm2-with-env.cjs
) else (
    echo 使用PM2直接启动...
    pm2 start server/index.js --name base2
)

echo.
echo [5/5] 验证启动...

timeout /t 3 /nobreak >nul

REM 检查PM2状态
pm2 list | findstr /C:"base2" | findstr /C:"online" >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] PM2进程运行中
) else (
    echo [错误] PM2进程未运行
    echo.
    echo 查看错误日志:
    pm2 logs base2 --err --lines 20 --nostream
    pause
    exit /b 1
)

echo.
echo 最新日志:
pm2 logs base2 --lines 20 --nostream

echo.
echo ========================================
echo   部署完成！
echo ========================================
echo.
echo 常用命令:
echo   pm2 status        - 查看状态
echo   pm2 logs base2    - 查看日志
echo   pm2 restart base2 - 重启服务
echo.

pause
