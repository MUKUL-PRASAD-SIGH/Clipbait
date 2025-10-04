@echo off
echo 🤖 Starting AI Transformation Service...
echo 📦 Installing Python dependencies...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

REM Install dependencies
pip install -r requirements.txt

echo 🚀 Starting AI server on port 5001...
python ai_server.py