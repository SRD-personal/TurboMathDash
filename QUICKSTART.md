# ⚡ Turbo Math Dash - Quick Start

**3 ways to run your game - pick one!**

---

## 🌐 Option 1: Test in Browser (Fastest!)

Perfect for development and quick testing.

```bash
npm run dev
```

Then open: **http://localhost:3000**

✅ **Pros:** Instant testing, hot reload, easy debugging
⚠️ **Note:** Use mobile device simulation (F12 → Device Toolbar)

---

## 📱 Option 2: Test on Phone Browser

Test real touch controls without building APK.

```bash
# 1. Start server
npm run dev

# 2. Find your computer's IP
# Windows: ipconfig
# Mac/Linux: ifconfig

# 3. On phone browser, visit:
http://YOUR_IP:3000
```

Example: `http://192.168.1.100:3000`

✅ **Pros:** Real touch testing, no APK build needed
⚠️ **Note:** Phone and computer must be on same WiFi

---

## 📲 Option 3: Build Android APK

Install on device as a real app.

### Automated Build:
```bash
./build-apk.sh  # Linux/Mac
# OR
build-apk.bat   # Windows
```

### Manual Build:
```bash
npm install
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

**APK Location:**
`android/app/build/outputs/apk/debug/app-debug.apk`

### Install APK:
1. Transfer APK to your Android device
2. Enable "Unknown Sources" in settings
3. Tap APK file to install

**Or use ADB:**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

✅ **Pros:** Real app experience, works offline, native performance
⚠️ **Note:** Requires Android SDK setup (see SETUP_GUIDE.md)

---

## 🎮 How to Play

**Mobile:**
- Swipe ← → to change lanes
- Swipe ↑ or tap to jump
- Collect coins 💰 and stars ⭐
- Avoid obstacles
- Answer math questions every 100m

**Desktop (testing):**
- Arrow keys to move
- Spacebar or ↑ to jump

---

## 📚 Need Help?

- **Setup issues?** → Read `SETUP_GUIDE.md`
- **Testing questions?** → Read `TESTING_GUIDE.md`
- **Want full details?** → Read `PROJECT_SUMMARY.md`
- **Quick overview?** → Read `README.md`

---

## 🔧 Quick Config Changes

### Make game easier/harder:
Edit `src/main.js` line 28:
```javascript
runSpeed: 10,  // Lower = easier, Higher = harder
```

### Change math difficulty:
Edit `src/main.js` function `generateMathQuestion()` (line 282)

### Spawn more/fewer items:
Edit `src/main.js` function `spawnObjects()` (line 756)

---

## ✅ First Time Setup Checklist

```bash
# 1. Install dependencies
npm install

# 2. Test in browser
npm run dev

# 3. Open http://localhost:3000

# 4. Play and test controls

# 5. Make any tweaks you want

# 6. Build APK (when ready)
./build-apk.sh
```

---

## 🎯 What to Test First

- [ ] Game starts when clicking "START RUN"
- [ ] Character moves left/right
- [ ] Character jumps
- [ ] Can collect coins
- [ ] Math question appears around 100m
- [ ] Correct answer gives rewards
- [ ] Wrong answer removes heart
- [ ] Game over when hearts = 0

---

## 🚀 You're Ready!

Pick an option above and start playing! 🎮

**Recommended first-time flow:**
1. Start with **Option 1** (browser) to see it work
2. Make any changes you want
3. Try **Option 2** (phone browser) to test touch
4. Build **Option 3** (APK) when satisfied

**Happy gaming!** 🌟
