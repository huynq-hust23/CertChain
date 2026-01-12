@echo off
SETLOCAL EnableExtensions

echo === Starting Certchain Project on Windows ===

:: 0. Start Database
echo [0/3] Starting Database...
docker compose up -d
if %errorlevel% neq 0 (
    echo Failed to start Docker. Is Docker Desktop running?
    pause
    exit /b %errorlevel%
)
echo Waiting for database to be ready...
timeout /t 5 /nobreak >nul

:: 1. Setup and Start Python Backend
echo [1/2] Setting up Python Backend...
cd backend\blockchain\client

:: Create venv if not exists
if not exist venv_win (
    echo Creating Python virtual environment (venv_win)...
    python -m venv venv_win
)

echo Activating virtual environment...
call venv_win\Scripts\activate.bat

echo Installing Python dependencies...
pip install -r requirements.txt

echo Starting Python Backend...
:: Start in a new window so it runs in background relative to this script
start "CertChain Backend" cmd /k "python main.py"

:: 2. Start Frontend
echo [2/2] Starting Next.js Frontend...
cd ..\..\..\

echo Running npm run dev...
npm run dev

pause
