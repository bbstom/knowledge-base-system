@echo off
chcp 65001 >nul
echo ================================
echo 邮箱验证码重置密码功能 - 安装
echo ================================
echo.

REM 检查是否在项目根目录
if not exist "server" (
    echo ❌ 错误：请在项目根目录运行此脚本
    pause
    exit /b 1
)

echo 📦 步骤 1/3: 安装依赖...
cd server
call npm install nodemailer
if %errorlevel% equ 0 (
    echo ✅ nodemailer 安装成功
) else (
    echo ❌ nodemailer 安装失败
    pause
    exit /b 1
)

echo.
echo ⚙️  步骤 2/3: 检查配置...
findstr /C:"SMTP_HOST" .env >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ SMTP配置已存在
) else (
    echo ⚠️  警告：未找到SMTP配置
    echo.
    echo 请在 server\.env 文件中添加以下配置：
    echo.
    echo SMTP_HOST=smtp.gmail.com
    echo SMTP_PORT=587
    echo SMTP_SECURE=false
    echo SMTP_USER=your-email@gmail.com
    echo SMTP_PASS=your-app-password
    echo SITE_NAME=信息查询系统
    echo.
)

echo.
echo 📝 步骤 3/3: 创建测试脚本...
(
echo // 测试邮箱验证码重置密码功能
echo const axios = require^('axios'^);
echo.
echo const BASE_URL = 'http://localhost:3001/api/auth';
echo const TEST_EMAIL = 'test@example.com';
echo.
echo async function testEmailReset^(^) {
echo   console.log^('🧪 开始测试邮箱验证码重置密码功能...\n'^);
echo.
echo   try {
echo     // 1. 发送验证码
echo     console.log^('1️⃣ 测试发送验证码...'^);
echo     const sendResponse = await axios.post^(`${BASE_URL}/forgot-password/send-code`, {
echo       email: TEST_EMAIL
echo     }^);
echo     console.log^('✅ 发送成功:', sendResponse.data.message^);
echo     console.log^('   请检查邮箱:', TEST_EMAIL^);
echo     console.log^(''^);
echo.
echo     // 等待用户输入验证码
echo     const readline = require^('readline'^).createInterface^({
echo       input: process.stdin,
echo       output: process.stdout
echo     }^);
echo.
echo     readline.question^('请输入收到的验证码: ', async ^(code^) =^> {
echo       try {
echo         // 2. 验证验证码
echo         console.log^('\n2️⃣ 测试验证验证码...'^);
echo         const verifyResponse = await axios.post^(`${BASE_URL}/forgot-password/verify-code`, {
echo           email: TEST_EMAIL,
echo           code: code
echo         }^);
echo         console.log^('✅ 验证成功:', verifyResponse.data.message^);
echo         console.log^(''^);
echo.
echo         // 3. 重置密码
echo         console.log^('3️⃣ 测试重置密码...'^);
echo         const resetResponse = await axios.post^(`${BASE_URL}/forgot-password/reset`, {
echo           email: TEST_EMAIL,
echo           code: code,
echo           newPassword: 'newpassword123'
echo         }^);
echo         console.log^('✅ 重置成功:', resetResponse.data.message^);
echo         console.log^(''^);
echo.
echo         console.log^('🎉 所有测试通过！'^);
echo         console.log^(''^);
echo         console.log^('新密码: newpassword123'^);
echo         console.log^('请使用新密码登录测试'^);
echo       } catch ^(error^) {
echo         console.error^('❌ 测试失败:', error.response?.data?.message ^|^| error.message^);
echo       }
echo       readline.close^(^);
echo     }^);
echo.
echo   } catch ^(error^) {
echo     console.error^('❌ 测试失败:', error.response?.data?.message ^|^| error.message^);
echo     if ^(error.code === 'ECONNREFUSED'^) {
echo       console.log^('\n⚠️  提示：请确保服务器正在运行 ^(npm run dev^)'^);
echo     }
echo   }
echo }
echo.
echo testEmailReset^(^);
) > test-email-reset.js

echo ✅ 测试脚本创建成功: test-email-reset.js

echo.
echo ================================
echo ✅ 安装完成！
echo ================================
echo.
echo 📋 下一步：
echo.
echo 1. 配置SMTP邮件服务
echo    编辑 server\.env 文件，添加SMTP配置
echo    参考: QUICK_START_EMAIL_RESET.md
echo.
echo 2. 重启服务器
echo    cd server
echo    npm run dev
echo.
echo 3. 测试功能
echo    方式一：访问 http://localhost:5173/forgot-password
echo    方式二：运行测试脚本
echo    cd server
echo    node test-email-reset.js
echo.
echo 📚 详细文档：
echo    - QUICK_START_EMAIL_RESET.md ^(快速开始^)
echo    - EMAIL_VERIFICATION_SETUP.md ^(详细配置^)
echo    - PASSWORD_RESET_COMPLETE.md ^(完整说明^)
echo.
pause
