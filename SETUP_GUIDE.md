# 📱 Turbo Math Dash - Setup & Build Guide

Complete guide to set up your development environment and build Android APK locally.

## 📋 Prerequisites

### 1. Install Node.js
- Download from: https://nodejs.org/
- Recommended: LTS version (v18 or v20)
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

### 2. Install Android Studio (for Android APK building)

**Download:**
- https://developer.android.com/studio

**Installation Steps:**
1. Download Android Studio
2. Run installer
3. Open Android Studio
4. Go to: **Tools → SDK Manager**
5. Install:
   - ✅ Android SDK Platform (API 33 or higher)
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Command-line Tools
   - ✅ Android SDK Platform-Tools

**Set Environment Variables:**

**On Windows:**
```cmd
setx ANDROID_HOME "C:\Users\YourName\AppData\Local\Android\Sdk"
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools"
```

**On macOS/Linux:**
```bash
# Add to ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
```

### 3. Install Java JDK
- Android builds require Java 11 or 17
- Download: https://adoptium.net/
- Verify: `java -version`

## 🚀 Quick Start

### Option 1: Automated Build (Recommended)

**On Linux/macOS:**
```bash
chmod +x build-apk.sh
./build-apk.sh
```

**On Windows:**
```cmd
build-apk.bat
```

### Option 2: Manual Build

```bash
# 1. Install dependencies
npm install

# 2. Build web assets
npm run build

# 3. Sync to Android
npx cap sync android

# 4. Build APK
cd android
./gradlew assembleDebug  # Linux/macOS
# OR
gradlew.bat assembleDebug  # Windows
```

## 📦 APK Output Location

After successful build:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## 📲 Installing APK on Android Device

### Method 1: Direct Transfer
1. **Transfer APK** to your Android device (USB, email, cloud)
2. **Enable Unknown Sources:**
   - Settings → Security → Unknown Sources (ON)
   - Or: Settings → Apps → Special Access → Install Unknown Apps
3. **Tap the APK file** on your device
4. **Tap "Install"**

### Method 2: ADB (Android Debug Bridge)
```bash
# Connect device via USB (enable USB Debugging first)
adb devices

# Install APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# If already installed (reinstall):
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## 🧪 Testing in Browser (Faster Development)

For quick testing without building APK:

```bash
# Start development server
npm run dev

# Open browser to:
# http://localhost:3000

# Test on your phone (same WiFi network):
# http://YOUR_COMPUTER_IP:3000
```

**Find your computer's IP:**
- **Windows:** `ipconfig`
- **macOS/Linux:** `ifconfig` or `ip addr`

## 🔧 Development Workflow

1. **Make changes** to code in `src/main.js` or `index.html`
2. **Test in browser** with `npm run dev` (instant reload)
3. **Build for production** when ready: `npm run build`
4. **Build APK** when you want to test on device: `./build-apk.sh`

## 📁 Project Structure

```
TurboMathDash/
├── index.html              # Main HTML file
├── src/
│   └── main.js            # Game engine (Three.js)
├── android/               # Android project (Capacitor)
│   └── app/
│       └── build/
│           └── outputs/
│               └── apk/   # APK output folder
├── dist/                  # Built web assets
├── package.json           # Dependencies
├── capacitor.config.json  # Capacitor configuration
├── build-apk.sh          # Build script (Linux/macOS)
├── build-apk.bat         # Build script (Windows)
└── README.md             # Documentation
```

## 🐛 Troubleshooting

### Build fails with "Android SDK not found"
**Solution:**
- Install Android Studio
- Set ANDROID_HOME environment variable
- Restart terminal/IDE

### Gradle download fails
**Solution:**
- Check internet connection
- Try: `cd android && ./gradlew clean`
- Delete `~/.gradle/caches` and retry

### "Unable to locate tools.jar"
**Solution:**
- Install JDK (not just JRE)
- Set JAVA_HOME environment variable

### APK installs but crashes on open
**Solution:**
- Check device Android version (minimum: Android 7.0)
- Check logcat: `adb logcat | grep TurboMath`
- Rebuild: `npm run build && npx cap sync android`

### Web version works but APK doesn't
**Solution:**
- Make sure you ran `npm run build` before `npx cap sync`
- Clear app data on device
- Uninstall and reinstall

## 📱 Building Release APK (For Distribution)

### 1. Generate Signing Key
```bash
keytool -genkey -v -keystore turbo-math-dash.keystore -alias turbomath -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Update capacitor.config.json
```json
{
  "android": {
    "buildOptions": {
      "keystorePath": "/path/to/turbo-math-dash.keystore",
      "keystorePassword": "your_password",
      "keystoreAlias": "turbomath",
      "keystoreAliasPassword": "your_alias_password"
    }
  }
}
```

### 3. Build Release APK
```bash
cd android
./gradlew assembleRelease
```

**Output:**
```
android/app/build/outputs/apk/release/app-release.apk
```

## 🎮 Game Controls (for Testing)

**On Mobile Device:**
- Swipe Left/Right → Change lanes
- Swipe Up or Tap → Jump
- Avoid obstacles, collect coins!

**On Desktop (Browser):**
- Arrow Left/Right → Change lanes
- Arrow Up or Spacebar → Jump

## 📊 Performance Tips

### For Better Performance on Low-End Devices:

Edit `src/main.js` and reduce:
- `CONFIG.runSpeed` (make game slower)
- Particle effects
- Shadow quality

### Reduce APK Size:

```bash
# Build with ProGuard enabled
cd android
./gradlew assembleRelease --configure-on-demand
```

## 🆘 Getting Help

**Common Issues:**
- Check `TROUBLESHOOTING.md` (if exists)
- Search existing GitHub issues
- Check Android logcat: `adb logcat`

**Resources:**
- Capacitor Docs: https://capacitorjs.com/docs
- Three.js Docs: https://threejs.org/docs
- Android Developer: https://developer.android.com

## 🎉 Next Steps

After successful build:
1. ✅ Test on real Android device
2. ✅ Add more characters and worlds
3. ✅ Implement sound effects
4. ✅ Add local storage for progress
5. ✅ Optimize performance
6. ✅ Prepare for Play Store (later)

Happy coding! 🚀
