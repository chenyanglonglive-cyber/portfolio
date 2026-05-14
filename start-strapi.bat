@echo off
set "BASE_DIR=%~dp0"
cd /d "%BASE_DIR%backend"
echo.
echo ===================================================
echo   Starting Strapi Backend...
echo   Admin Portal: http://localhost:1337/admin
echo ===================================================
echo.
npm run develop
pause

