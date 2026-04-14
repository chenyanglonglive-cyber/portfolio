@echo off
echo Starting Backend (Strapi)...
start cmd /k "cd backend && npm run develop"
echo Starting Frontend (Simple Server)...
start cmd /k "npx -y serve frontend"
echo Done! Please visit http://localhost:3000 for frontend and http://localhost:1337/admin for backend.
pause
