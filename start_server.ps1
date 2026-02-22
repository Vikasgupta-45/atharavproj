# Start FastAPI Server and Open Swagger UI Documentation
# Author: AI Assistant
# Purpose: Quick startup script for the AI Text Analysis Engine

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  AI Text Analysis Engine - FastAPI Startup" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path ".\.venv\Scripts\Activate.ps1")) {
    Write-Host "❌ Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run: python -m venv .venv"
    Write-Host "Then: .\.venv\Scripts\Activate.ps1"
    Read-Host "Press Enter to exit"
    exit 1
}

# Activate virtual environment
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
& ".\.venv\Scripts\Activate.ps1"

# Check if uvicorn is installed
try {
    python -c "import uvicorn" 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Uvicorn not found"
    }
}
catch {
    Write-Host "❌ Uvicorn not installed!" -ForegroundColor Red
    Write-Host "Installing required packages..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# Display server info
Write-Host ""
Write-Host "✅ Starting FastAPI server..." -ForegroundColor Green
Write-Host ""
Write-Host "📍 Server running at: http://localhost:8000" -ForegroundColor Green
Write-Host "📖 API Docs at: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "📚 Alternative Docs at: http://localhost:8000/redoc" -ForegroundColor Green
Write-Host ""
Write-Host "⏳ Giving server 3 seconds to start..." -ForegroundColor Yellow

# Wait for server to start
Start-Sleep -Seconds 3

# Try to open browser
Write-Host "🌐 Opening Swagger UI in browser..." -ForegroundColor Cyan
try {
    Start-Process "http://localhost:8000/docs"
}
catch {
    Write-Host "⚠️  Could not open browser automatically. Please visit: http://localhost:8000/docs" -ForegroundColor Yellow
}

# Start the server
Write-Host ""
Write-Host "🚀 Server is running! Press Ctrl+C to stop." -ForegroundColor Green
Write-Host ""

python -m uvicorn ai_engine.main:app --reload --host 0.0.0.0 --port 8000
