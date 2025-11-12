@echo off
echo ========================================
echo   PM2 智能启动脚本
echo ========================================
echo.

REM 检查PM2是否安装
where pm2 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] PM2未安装
    echo.
    echo 正在安装PM2...
    call npm install -g pm2
    if %ERRORLEVEL% NEQ 0 (
        echo [失败] PM2安装失败
        pause
        exit /b 1
    )
    echo [成功] PM2安装完成
    echo.
)

echo [信息] 启动PM2服务...
echo.

node start-pm2-with-env.cjs

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   启动成功！
    echo ========================================
    echo.
    echo 常用命令:
    echo   pm2 logs base2    - 查看实时日志
    echo   pm2 status        - 查看进程状态
    echo   pm2 restart base2 - 重启服务
    echo   pm2 stop base2    - 停止服务
    echo.
) else (
    echo.
    echo ========================================
    echo   启动失败！
    echo ========================================
    echo.
    echo 请检查:
    echo 1. server/.env 文件是否存在
    echo 2. 数据库连接是否正常
    echo 3. 端口3001是否被占用
    echo.
)

pause
