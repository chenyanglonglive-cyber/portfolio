@echo off
title Portfolio Next.js Dev Server
set "BASE_DIR=%~dp0"
cd /d "%BASE_DIR%frontend-v2"
echo.
echo ==========================================================
echo   正在启动 Next.js 本地开发服务器...
echo   主站预览地址:     http://localhost:3000
echo   AI 工作流预览地址: http://localhost:3000/AI-Workflow/index.html
echo ==========================================================
echo.
npm run dev
pause
