@echo off
echo 🚀 Starting Epitychia with AI Services...

REM Start the Python AI service in a new window
echo 🤖 Starting AI Service...
start "AI Service" cmd /k "cd backend\ai-service && start_ai_service.bat"

REM Wait a moment for AI service to start
timeout /t 5 /nobreak >nul

REM Start the main application
echo 🌟 Starting Main Application...
call start-all.js

echo ✅ All services started!
echo 🤖 AI Service: http://localhost:5001
echo 🖥️ Backend: http://localhost:3000  
echo 🌐 Desktop: http://localhost:1420
echo 🔧 Chrome Extension: Load from chrome-extension folder

pause