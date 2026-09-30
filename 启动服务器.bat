@echo off
title AI智能作业成本管控系统-本地服务器
cd /d "%~dp0"

echo ========================================
echo   AI智能作业成本管控系统 - 本地服务器
echo ========================================
echo.

REM 清除可能污染Python的环境变量（修复no codec报错）
set "PYTHONHOME="
set "PYTHONPATH="

REM 依次实测 python / py / python3 是否真正可用（不只是能找到，还要能正常启动）
set "PYCMD="
call :testpy python
if not defined PYCMD call :testpy py
if not defined PYCMD call :testpy python3

if defined PYCMD goto runpy

REM Python都不可用，尝试Node.js
where npx >nul 2>nul && goto runnode

REM Python和Node都没有
echo [错误] 没有找到可用的 Python 或 Node.js！
echo.
echo 你的电脑上的Python可能已损坏（例如启动报no codec错误）。
echo 请选择以下任一方式解决：
echo.
echo   方式1 重新安装官方Python（推荐）
echo     打开 https://www.python.org/downloads/ 下载安装
echo     安装第一屏务必勾选最下方 Add Python to PATH
echo.
echo   方式2 安装Node.js后重新双击本脚本
echo     打开 https://nodejs.org/ 下载安装
echo.
echo   方式3 用VS Code的Live Server插件打开（无需Python）
echo.
pause
exit /b 1

:testpy
where %1 >nul 2>nul || exit /b
%1 -c "import http.server" >nul 2>nul && set "PYCMD=%1"
exit /b

:runpy
echo [OK] 找到可用的Python：
%PYCMD% --version
echo.
goto pickport

:runnode
echo [OK] 未找到可用Python，改用Node.js启动...
echo.
echo   浏览器地址  http://localhost:8000/
echo   关闭此黑色窗口即可停止服务器
echo ========================================
echo.
start "" "http://localhost:8000/"
npx --yes http-server -p 8000 -c-1
goto ended

:pickport
REM 自动选择可用端口
set PORT=8000
netstat -ano | findstr ":8000 " | findstr "LISTENING" >nul 2>nul
if not errorlevel 1 (
    echo [提示] 端口8000被占用，改用8080...
    set PORT=8080
    netstat -ano | findstr ":8080 " | findstr "LISTENING" >nul 2>nul
    if not errorlevel 1 (
        echo [提示] 端口8080也被占用，改用8888...
        set PORT=8888
    )
)
setlocal enabledelayedexpansion
echo [启动] 正在启动本地服务器...
echo.
echo   浏览器地址  http://localhost:!PORT!/
echo   关闭此黑色窗口即可停止服务器
echo ========================================
echo.
start "" "http://localhost:!PORT!/"
%PYCMD% -m http.server !PORT!
endlocal
goto ended

:ended
echo.
echo ========================================
echo 服务器已停止，如上方有红色错误请截图
echo ========================================
echo.
pause