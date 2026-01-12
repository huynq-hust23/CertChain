@echo off
SETLOCAL EnableExtensions

echo === Installing Certchain Dependencies (Windows) ===

:: 1. Frontend Dependencies
echo [1/2] Installing Frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Frontend installation failed.
    pause
    exit /b %errorlevel%
)

:: 2. Backend Dependencies
echo [2/2] Installing Backend dependencies...
cd backend\blockchain\client

if not exist venv_win (
    echo Creating Python virtual environment (venv_win)...
    python -m venv venv_win
)

echo Activating virtual environment...
call venv_win\Scripts\activate.bat

echo Installing requirements...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Backend installation failed.
    pause
    exit /b %errorlevel%
)

echo.
echo === Installation Complete! ===
echo You can now run the project using "run.bat"
pause