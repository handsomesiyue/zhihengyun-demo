#!/bin/bash
echo "========================================"
echo "  AI智能作业成本管控系统 - 本地服务器"
echo "========================================"
echo ""
if command -v python3 &> /dev/null; then
    PYTHON="python3"
elif command -v python &> /dev/null; then
    PYTHON="python"
else
    echo "未检测到Python，请先安装Python3"
    echo "Mac用户: brew install python3"
    read -p "按回车键退出..."
    exit 1
fi
echo "检测到Python: $($PYTHON --version)"
echo ""
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"
echo "当前目录: $SCRIPT_DIR"
echo ""
PORT=8000
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    PORT=8080
fi
echo "启动本地服务器..."
echo "访问地址: http://localhost:$PORT"
echo ""
echo "服务器运行中，按 Ctrl+C 停止"
echo ""
$PYTHON -m http.server $PORT
