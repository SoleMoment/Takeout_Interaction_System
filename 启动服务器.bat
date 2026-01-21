@echo off
chcp 65001 > nul
color 0A
title 校园外卖守护大作战 - 服务器

echo.
echo ========================================
echo   校园外卖守护大作战 - 教学系统
echo ========================================
echo.

REM 检查Node.js是否安装
node --version > nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到Node.js，请先安装Node.js
    echo.
    echo 下载地址: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [✓] Node.js已安装
node --version
echo.

REM 检查是否已安装依赖
if not exist "node_modules\" (
    echo [!] 首次运行，正在安装依赖...
    echo [!] 这可能需要1-2分钟，请耐心等待...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo [错误] 依赖安装失败，请检查网络连接
        echo.
        echo 如果问题持续，请尝试：
        echo 1. 检查网络连接
        echo 2. 以管理员身份运行
        echo 3. 手动执行: npm install
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [✓] 依赖安装完成
    echo.
) else (
    echo [✓] 依赖已安装
    echo.
)

REM 获取本机IP地址
echo [!] 正在获取本机IP地址...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set IP=%%a
    set IP=!IP:~1!
    goto :found_ip
)
:found_ip
if not defined IP set IP=127.0.0.1

echo.
echo ========================================
echo   服务器启动中...
echo ========================================
echo.
echo [✓] 服务器地址: http://localhost:3000
echo [✓] 局域网地址: http://%IP%:3000
echo.
echo ========================================
echo   访问地址（请分享给学生）
echo ========================================
echo.
echo   导航首页: http://%IP%:3000
echo.
echo   第一课学生端: http://%IP%:3000/lesson1/student
echo   第一课教师端: http://%IP%:3000/lesson1/teacher
echo.
echo   第三课学生端: http://%IP%:3000/lesson3/student
echo   第三课教师端: http://%IP%:3000/lesson3/teacher
echo.
echo ========================================
echo   按 Ctrl+C 停止服务器
echo ========================================
echo.

REM 启动服务器
node server.js

pause
