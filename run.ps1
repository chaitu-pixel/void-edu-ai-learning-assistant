# Void Edu - PowerShell Startup Script
# This script starts both the backend and frontend servers

$Host.UI.RawUI.WindowTitle = "Void Edu - AI Learning Assistant"

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "         Void Edu - AI Learning              " -ForegroundColor Cyan
Write-Host "              Starting...                    " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Get the directory where the script is located
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Check if Python is installed
$pythonVersion = $null
try {
    $pythonVersion = & python --version 2>&1
    Write-Host "[INFO] Found $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] Python is not installed or not in PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check for virtual environment and activate
if (Test-Path "venv\Scripts\Activate.ps1") {
    Write-Host "[INFO] Activating virtual environment..." -ForegroundColor Yellow
    . ".\venv\Scripts\Activate.ps1"
}
elseif (Test-Path ".venv\Scripts\Activate.ps1") {
    Write-Host "[INFO] Activating virtual environment..." -ForegroundColor Yellow
    . ".\.venv\Scripts\Activate.ps1"
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "[WARNING] .env file not found" -ForegroundColor Yellow
    Write-Host "[INFO] Creating .env template..." -ForegroundColor Yellow
    Set-Content -Path ".env" -Value "GEMINI_API_KEY=your_api_key_here"
    Write-Host "[ERROR] Please add your Gemini API key to .env file" -ForegroundColor Red
}

# Create required directories
if (-not (Test-Path "storage\uploads")) {
    New-Item -ItemType Directory -Path "storage\uploads" -Force | Out-Null
}
if (-not (Test-Path "storage\faiss")) {
    New-Item -ItemType Directory -Path "storage\faiss" -Force | Out-Null
}

# Start backend server in a new window
Write-Host "[INFO] Starting backend server on http://localhost:8000" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir'; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

# Wait for backend to start
Start-Sleep -Seconds 3

# Start frontend server in a new window
Write-Host "[INFO] Starting frontend server on http://localhost:3000" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\frontend'; python -m http.server 3000"

# Wait a moment
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "           Servers are running!              " -ForegroundColor Green
Write-Host "---------------------------------------------" -ForegroundColor Green
Write-Host "  Frontend:  http://localhost:3000           " -ForegroundColor Green
Write-Host "  Backend:   http://localhost:8000           " -ForegroundColor Green
Write-Host "  API Docs:  http://localhost:8000/docs      " -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Close the server windows to stop the application." -ForegroundColor Yellow
Write-Host ""

# Open browser
Start-Process "http://localhost:3000"

Write-Host "Press Enter to close this window (servers will keep running)..." -ForegroundColor Cyan
Read-Host
