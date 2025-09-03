#!/bin/bash

# Mobile App Build Script
set -e

echo "📱 Building Epitychia Mobile App..."

cd mobile

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for Android
echo "🤖 Building Android APK..."
if command -v npx &> /dev/null; then
    npx react-native build-android --mode=release
    echo "✅ Android APK built successfully!"
    echo "📁 APK location: mobile/android/app/build/outputs/apk/release/"
else
    echo "⚠️ React Native CLI not found. Please install it first."
fi

# Build for iOS (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Building iOS app..."
    npx react-native build-ios --mode=Release
    echo "✅ iOS app built successfully!"
    echo "📁 iOS build location: mobile/ios/build/"
else
    echo "⚠️ iOS build skipped (requires macOS)"
fi

echo "✅ Mobile app build completed!"