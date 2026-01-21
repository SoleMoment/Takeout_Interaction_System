#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

clear

echo -e "${BLUE}"
echo "========================================"
echo "  校园外卖守护大作战 - 教学系统"
echo "========================================"
echo -e "${NC}"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}[错误] 未检测到Node.js，请先安装Node.js${NC}"
    echo ""
    echo "下载地址: https://nodejs.org/"
    echo ""
    exit 1
fi

echo -e "${GREEN}[✓] Node.js已安装${NC}"
node --version
echo ""

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[!] 首次运行，正在安装依赖...${NC}"
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo -e "${RED}[错误] 依赖安装失败${NC}"
        exit 1
    fi
    echo ""
    echo -e "${GREEN}[✓] 依赖安装完成${NC}"
    echo ""
fi

# 获取本机IP
echo -e "${YELLOW}[!] 正在获取本机IP地址...${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
else
    # Linux
    IP=$(hostname -I | awk '{print $1}')
fi

if [ -z "$IP" ]; then
    IP="127.0.0.1"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  服务器启动中...${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}[✓] 服务器地址: http://localhost:3000${NC}"
echo -e "${GREEN}[✓] 局域网地址: http://${IP}:3000${NC}"
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "  ${YELLOW}访问地址（请分享给学生）${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "  导航首页: ${GREEN}http://${IP}:3000${NC}"
echo ""
echo -e "  第一课学生端: ${GREEN}http://${IP}:3000/lesson1/student${NC}"
echo -e "  第一课教师端: ${GREEN}http://${IP}:3000/lesson1/teacher${NC}"
echo ""
echo -e "  第三课学生端: ${GREEN}http://${IP}:3000/lesson3/student${NC}"
echo -e "  第三课教师端: ${GREEN}http://${IP}:3000/lesson3/teacher${NC}"
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "  ${YELLOW}按 Ctrl+C 停止服务器${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 启动服务器
node server.js
