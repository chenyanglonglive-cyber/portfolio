@echo off
set "BASE_DIR=%~dp0"
cd /d "%BASE_DIR%"

echo [1/2] Starting Strapi Backend...
start "Strapi" /D "%BASE_DIR%backend" cmd /k "npm run develop"

echo [2/2] Starting Next.js Frontend V2...
start "Next.js" /D "%BASE_DIR%frontend-v2" cmd /k "npm run dev"

echo.
echo ===================================================
echo  Frontend: http://localhost:3000
echo  Backend:  http://localhost:1337/admin
echo ===================================================
echo.
pause
