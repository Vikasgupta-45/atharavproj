@echo off
echo 🚀 Starting Game Backend (FastAPI)...

:: Navigate to the game_backend directory
cd /d "%~dp0"

:: Check if python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python and try again.
    pause
    exit /b
)

:: Install dependencies
echo 📦 Installing dependencies from requirements.txt...
pip install -r requirements.txt

:: Start the server
echo 🔥 Launching Uvicorn on http://localhost:8001...
uvicorn main:app --reload --port 8001

pause
