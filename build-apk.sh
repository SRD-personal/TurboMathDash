#!/bin/bash

# ============================================
# TURBO MATH DASH - APK Build Script
# ============================================

echo "🌟 Building Turbo Math Dash APK..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if Android SDK is set up
if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
    echo "⚠️  Warning: Android SDK not found in environment variables"
    echo "Please set ANDROID_HOME or ANDROID_SDK_ROOT"
    echo ""
    echo "You can download Android SDK from:"
    echo "https://developer.android.com/studio"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build web version
echo "🔨 Building web assets..."
npm run build

# Sync to Android
echo "📱 Syncing to Android..."
npx cap sync android

# Build debug APK
echo "🚀 Building debug APK..."
cd android
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ APK built successfully!"
    echo ""
    echo "📍 APK Location:"
    echo "   android/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "📲 To install on your device:"
    echo "   1. Enable 'Unknown Sources' in Android settings"
    echo "   2. Transfer app-debug.apk to your device"
    echo "   3. Tap the APK file to install"
    echo ""
    echo "Or use ADB:"
    echo "   adb install android/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
else
    echo ""
    echo "❌ Build failed!"
    echo "Please check the error messages above."
    echo ""
    echo "Common solutions:"
    echo "1. Make sure Android SDK is installed"
    echo "2. Make sure ANDROID_HOME is set correctly"
    echo "3. Run: ./gradlew clean"
    echo "4. Try again"
    echo ""
fi

cd ..
