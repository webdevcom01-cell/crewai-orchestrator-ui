@echo off
REM CrewAI Orchestrator - Quick Start Script (Windows)
REM This script starts both backend and frontend servers

echo ========================================================
echo CrewAI Orchestrator - Starting Application
echo ========================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js is not installed
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if backend .env exists
if not exist "server\.env" (
    echo Backend .env file not found!
    echo Creating from template...
    copy server\.env.example server\.env
    echo.
    echo IMPORTANT: Add your GEMINI_API_KEY to server\.env
    echo Get your API key from: https://makersuite.google.com/app/apikey
    echo.
    pause
)

REM Check if frontend dependencies are installed
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

REM Check if backend dependencies are installed
if not exist "server\node_modules" (
    echo Installing backend dependencies...
    cd server
    call npm install
    cd ..
)

echo.
echo All dependencies installed
echo.

REM Start backend in separate window
echo Starting backend server on port 8000...
start "CrewAI Backend" cmd /k "cd server && npm run dev"

REM Wait for backend to start
timeout /t 5 /nobreak >nul

echo Backend server started
echo.

REM Start frontend
echo Starting frontend on port 3000...
echo.
echo ========================================================
echo Application URLs:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo ========================================================
echo.
echo Press Ctrl+C to stop frontend (backend runs in separate window)
echo.

call npm run dev
