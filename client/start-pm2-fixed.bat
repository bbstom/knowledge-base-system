@echo off
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
