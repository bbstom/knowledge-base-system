@echo off
echo.
echo ========================================
echo   GitHub 上传准备检查
echo ========================================
echo.

node check-github-ready.cjs

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   准备就绪！可以上传到 GitHub 了！
    echo ========================================
    echo.
    echo 查看 GITHUB_READY.md 获取快速上传命令
    echo.
) else (
    echo.
    echo ========================================
    echo   请先修复上述问题
    echo ========================================
    echo.
)

pause
