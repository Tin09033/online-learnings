@echo off
title LearnHub - All Services
echo ==========================================
echo   LearnHub - Online Learning Platform
echo ==========================================
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Student App (Port 3000)...
start "Student App" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 2 /nobreak > nul

echo Starting Admin Panel (Port 3001)...
start "Admin Panel" cmd /k "cd /d %~dp0admin && npm run dev"

echo.
echo ==========================================
echo   All services starting...
echo ==========================================
echo.
echo   Backend:    http://localhost:5000
echo   Student:    http://localhost:3000
echo   Admin:      http://localhost:3001
echo.
pause
