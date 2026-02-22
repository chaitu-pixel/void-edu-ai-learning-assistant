@echo off
setlocal enabledelayedexpansion

:: Void Edu - Windows Startup Script
:: This script starts both the backend and frontend servers

title Void Edu - AI Learning Assistant

echo.
echo ╔═══════════════════════════════════════════╗
echo ║         Void Edu - AI Learning            ║
echo ║              Starting...                  ║
echo ╚═══════════════════════════════════════════╝
echo.

:: Get the directory where the script is located
cd /d "%~dp0"

:: Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python is not installed or not in PATH
    pause
    exit /b 1
)

:: Check for virtual environment and activate
if exist "venv\Scripts\activate.bat" (
    echo [INFO] Activating virtual environment...
    call venv\Scripts\activate.bat
) else if exist ".venv\Scripts\activate.bat" (
    echo [INFO] Activating virtual environment...
    call .venv\Scripts\activate.bat
)

:: Check if .env file exists
if not exist ".env" (
    echo [WARNING] .env file not found
    echo [INFO] Creating .env template...
    echo GEMINI_API_KEY=your_api_key_here> .env
    echo [ERROR] Please add your Gemini API key to .env file
)

:: Create required directories
if not exist "storage\uploads" mkdir "storage\uploads"
if not exist "storage\faiss" mkdir "storage\faiss"

:: Start backend server in a new window
echo [INFO] Starting backend server on http://localhost:8000
start "Void Edu - Backend" cmd /k "uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

:: Wait for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend server in a new window
echo [INFO] Starting frontend server on http://localhost:3000
start "Void Edu - Frontend" cmd /k "cd frontend && python -m http.server 3000"

:: Wait a moment
timeout /t 2 /nobreak >nul

echo.
echo ╔═══════════════════════════════════════════╗
echo ║           Servers are running!            ║
echo ╠═══════════════════════════════════════════╣
echo ║  Frontend:  http://localhost:3000         ║
echo ║  Backend:   http://localhost:8000         ║
echo ║  API Docs:  http://localhost:8000/docs    ║
echo ╚═══════════════════════════════════════════╝
echo.
echo Close the server windows to stop the application.
echo.

:: Open browser
start http://localhost:3000

pause
