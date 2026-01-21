@echo off
chcp 65001 > nul
color 0B
title 安装依赖包

echo.
echo ========================================
echo   校园外卖守护大作战
echo   依赖包安装程序
echo ========================================
echo.

REM 检查Node.js
node --version > nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到Node.js！
    echo.
    echo 请先安装Node.js：
    echo 1. 访问 https://nodejs.org/
    echo 2. 下载并安装 LTS 版本
    echo 3. 安装完成后重启电脑
    echo 4. 再次运行此脚本
    echo.
    pause
    exit /b 1
)

echo [✓] 检测到Node.js
node --version
npm --version
echo.

REM 检查是否已安装
if exist "node_modules\" (
    echo [!] 检测到已安装的依赖包
    echo.
    choice /C YN /M "是否重新安装"
    if errorlevel 2 (
        echo.
        echo 已取消
        pause
        exit /b 0
    )
    echo.
    echo [!] 删除旧的依赖包...
    rmdir /S /Q node_modules
    del package-lock.json
)

echo ========================================
echo   开始安装依赖包
echo ========================================
echo.
echo [!] 正在安装，请稍候...
echo [!] 这可能需要1-2分钟
echo [!] 请不要关闭此窗口
echo.

REM 设置国内镜像（加速下载）
echo [!] 配置国内镜像源...
call npm config set registry https://registry.npmmirror.com
echo.

REM 安装依赖
call npm install

if errorlevel 1 (
    echo.
    echo ========================================
    echo   安装失败！
    echo ========================================
    echo.
    echo 可能的原因：
    echo 1. 网络连接问题
    echo 2. 权限不足（尝试以管理员身份运行）
    echo 3. 磁盘空间不足
    echo.
    echo 解决建议：
    echo 1. 检查网络连接
    echo 2. 右键此脚本 - 以管理员身份运行
    echo 3. 关闭杀毒软件后重试
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   安装成功！
echo ========================================
echo.
echo [✓] 依赖包已安装完成
echo [✓] 生成了 node_modules 文件夹
echo.
echo 下一步：
echo 双击运行 "启动服务器.bat" 即可启动系统
echo.
pause
