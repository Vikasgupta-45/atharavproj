@echo off
echo 🎨 Starting Game UI (Vite)...

:: Navigate to the vite_ui directory
cd /d "%~dp0"

:: Check if node is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js and try again.
    pause
    exit /b
)

:: Install dependencies
echo 📦 Installing dependencies...
npm install

:: Start the server
echo 🔥 Launching Vite on http://localhost:3001...
npm run dev

pause
