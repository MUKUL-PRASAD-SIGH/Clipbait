@echo off
echo Starting Epitychia AI Clipboard...
echo.

echo [1/2] Starting Backend Server...
cd backend
start "Epitychia Backend" cmd /k "npm run dev"
cd ..

echo [2/2] Starting Desktop App...
cd desktop
start "Epitychia Desktop" cmd /k "npm run tauri dev"
cd ..

echo.
echo ✅ Epitychia is starting up!
echo.
echo Next steps:
echo 1. Wait for both windows to finish loading
echo 2. Install Chrome extension from chrome-extension folder
echo 3. Create your account and start using Epitychia!
echo.
pause