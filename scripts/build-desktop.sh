#!/bin/bash

# Desktop App Build Script
set -e

echo "🖥️ Building Epitychia Desktop App..."

cd desktop

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the app
echo "🔨 Building Tauri app..."
npm run tauri build

echo "✅ Desktop app build completed!"
echo "📁 Binaries available in: desktop/src-tauri/target/release/bundle/"

# List built files
echo "📋 Built files:"
find src-tauri/target/release/bundle/ -name "*.exe" -o -name "*.dmg" -o -name "*.AppImage" -o -name "*.deb" 2>/dev/null || echo "No installer files found"