#!/bin/bash

echo "Starting Epitychia AI Clipboard..."
echo

echo "[1/2] Starting Backend Server..."
cd backend
gnome-terminal --title="Epitychia Backend" -- bash -c "npm run dev; exec bash" &
cd ..

echo "[2/2] Starting Desktop App..."
cd desktop
gnome-terminal --title="Epitychia Desktop" -- bash -c "npm run tauri dev; exec bash" &
cd ..

echo
echo "✅ Epitychia is starting up!"
echo
echo "Next steps:"
echo "1. Wait for both terminals to finish loading"
echo "2. Install Chrome extension from chrome-extension folder"
echo "3. Create your account and start using Epitychia!"
echo