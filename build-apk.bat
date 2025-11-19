@echo off
REM ============================================
REM TURBO MATH DASH - APK Build Script (Windows)
REM ============================================

echo 🌟 Building Turbo Math Dash APK...
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Build web version
echo 🔨 Building web assets...
call npm run build

REM Sync to Android
echo 📱 Syncing to Android...
call npx cap sync android

REM Build debug APK
echo 🚀 Building debug APK...
cd android
call gradlew.bat assembleDebug

if %errorlevel% equ 0 (
    echo.
    echo ✅ APK built successfully!
    echo.
    echo 📍 APK Location:
    echo    android\app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo 📲 To install on your device:
    echo    1. Enable 'Unknown Sources' in Android settings
    echo    2. Transfer app-debug.apk to your device
    echo    3. Tap the APK file to install
    echo.
    echo Or use ADB:
    echo    adb install android\app\build\outputs\apk\debug\app-debug.apk
    echo.
) else (
    echo.
    echo ❌ Build failed!
    echo Please check the error messages above.
    echo.
)

cd ..
