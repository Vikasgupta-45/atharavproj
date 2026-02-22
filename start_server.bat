@echo off
REM Start FastAPI Server and Open Swagger UI Documentation
REM Author: AI Assistant
REM Purpose: Quick startup script for the AI Text Analysis Engine

setlocal enabledelayedexpansion

echo.
echo ============================================================
echo  AI Text Analysis Engine - FastAPI Startup
echo ============================================================
echo.

REM Check if virtual environment exists
if not exist ".venv\Scripts\activate.bat" (
    echo ❌ Virtual environment not found!
    echo Please run: python -m venv .venv
    echo Then: .venv\Scripts\activate.bat
    pause
    exit /b 1
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call .venv\Scripts\activate.bat

REM Check if uvicorn is installed
python -c "import uvicorn" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Uvicorn not installed!
    echo Installing required packages...
    pip install -r requirements.txt
)

REM Start the server
echo.
echo ✅ Starting FastAPI server...
echo.
echo 📍 Server running at: http://localhost:8000
echo 📖 API Docs at: http://localhost:8000/docs
echo 📚 Alternative Docs at: http://localhost:8000/redoc
echo.
echo ⏳ Giving server 3 seconds to start...
timeout /t 3 /nobreak

REM Try to open browser (Windows)
echo 🌐 Opening Swagger UI in browser...
start http://localhost:8000/docs

REM Start the server
python -m uvicorn ai_engine.main:app --reload --host 0.0.0.0 --port 8000
