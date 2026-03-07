@echo off
REM ============================================
REM Student Portfolio - Start Both Servers
REM ============================================

echo.
echo ========================================
echo   Student Portfolio v2 - Python Server
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Install Python dependencies if needed
if not exist "server\venv" (
    echo Installing Python dependencies...
    cd server
    pip install -r requirements.txt
    cd ..
)

echo.
echo Starting Python FastAPI server on http://localhost:8000...
start "Python Server" cmd /k "cd server && python main.py"

REM Wait for Python server to start
timeout /t 3 /nobreak >nul

echo.
echo Starting React dev server on http://localhost:3000...
echo.
echo ========================================
echo Both servers are now running!
echo ========================================
echo.
echo - React App:    http://localhost:3000
echo - Python API:   http://localhost:8000
echo - Health:      http://localhost:8000/health
echo.
echo Press any key to open React in browser...
pause >nul

start http://localhost:3000
