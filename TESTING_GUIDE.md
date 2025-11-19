# 🧪 Turbo Math Dash - Testing Guide

Quick guide to test your game locally before building the APK.

## 🚀 Quick Test (Web Browser)

The **fastest way** to test your game is in a web browser:

### Step 1: Start Development Server

```bash
npm run dev
```

This will start a local server at `http://localhost:3000`

### Step 2: Open in Browser

**On your computer:**
- Open Chrome, Firefox, or any modern browser
- Navigate to: `http://localhost:3000`
- Press F12 to open DevTools
- Click the mobile device icon (Responsive Mode)
- Select "Pixel 5" or "iPhone 12 Pro" to simulate mobile

**On your phone (same WiFi network):**
1. Find your computer's IP address:
   - Windows: Run `ipconfig` in terminal
   - Mac/Linux: Run `ifconfig` or `ip addr`
   - Look for something like `192.168.1.100`

2. On your phone's browser, visit:
   ```
   http://YOUR_COMPUTER_IP:3000
   ```
   Example: `http://192.168.1.100:3000`

## 🎮 How to Play

### Controls

**Mobile (Touch):**
- **Swipe Left** → Move to left lane
- **Swipe Right** → Move to right lane
- **Swipe Up** or **Tap** → Jump
- **Swipe Down** → Slide (future feature)

**Desktop (Keyboard):**
- **Arrow Left** → Move left
- **Arrow Right** → Move right
- **Arrow Up** or **Spacebar** → Jump

### Game Flow

1. **Start Screen**
   - Click "🚀 START RUN!" button
   - Character (Dash the Dino) appears in center lane

2. **Running Phase**
   - Character runs forward automatically
   - Collect yellow **coins** 💰 for points
   - Collect white **stars** ⭐ for bonus points
   - Avoid brown **obstacles** by jumping or switching lanes

3. **Math Questions**
   - Every **100 meters**, a math question appears
   - Question shows at top: "5 + 3 = ?"
   - Three answer lanes appear on the ground
   - Run through the correct answer lane
   - **Correct** = +10 coins, +1 star, celebration!
   - **Wrong** = -1 life (heart), gentle feedback

4. **Lives System**
   - Start with **3 hearts** ❤️❤️❤️
   - Lose 1 heart for:
     - Hitting an obstacle (if not jumping)
     - Answering math question wrong
   - Game over when hearts = 0

5. **Game Over**
   - Shows your final stats:
     - Distance traveled
     - Coins collected
     - Stars earned
     - Math accuracy percentage
   - Reload page to play again

## ✅ What to Test

### Core Gameplay
- [ ] Game starts when clicking "START RUN"
- [ ] Character runs forward automatically
- [ ] Lane switching works (left/right)
- [ ] Jumping works
- [ ] Character stays in correct lane after switching
- [ ] Character returns to ground after jumping

### Collectibles
- [ ] Coins can be collected
- [ ] Stars can be collected (rarer than coins)
- [ ] Coin counter increases when collected
- [ ] Star counter increases when collected
- [ ] Distance counter increases over time

### Obstacles
- [ ] Obstacles appear on track
- [ ] Hitting obstacle removes 1 heart
- [ ] Jumping over obstacle avoids damage
- [ ] Changing lanes avoids obstacle

### Math Questions
- [ ] Math question appears around 100m
- [ ] Question is readable
- [ ] Three answer options show
- [ ] Correct answer rewards coins + star
- [ ] Wrong answer removes 1 heart
- [ ] Feedback message shows ("AWESOME!" or "Try Again!")
- [ ] Question disappears after answering

### UI/HUD
- [ ] Hearts display (3 at start)
- [ ] Coin counter shows
- [ ] Star counter shows
- [ ] Distance counter shows
- [ ] Pause button visible (during game)
- [ ] Pause button works

### Performance
- [ ] Game runs smoothly (30-60 FPS)
- [ ] No lag when spawning objects
- [ ] No lag during lane switching
- [ ] No lag during jumping
- [ ] Touch controls responsive

### Mobile-Specific
- [ ] Swipe gestures work correctly
- [ ] No accidental scrolling on page
- [ ] Game fills full screen
- [ ] No UI elements cut off by notch/camera
- [ ] Portrait orientation locks
- [ ] Touch targets large enough for fingers

### Visual/Audio (Future)
- [ ] Character animations smooth
- [ ] Ground scrolls smoothly
- [ ] Coins rotate
- [ ] Stars float/sparkle
- [ ] Feedback messages animate
- [ ] (Sound effects - not yet implemented)

## 🐛 Common Issues & Fixes

### Game doesn't start
**Solution:**
- Check browser console (F12)
- Make sure `npm run dev` is running
- Refresh page (Ctrl+R or Cmd+R)

### Controls don't work
**Solution:**
- Click/tap on game canvas first (to focus)
- On mobile: Make sure you're swiping on the game area
- Try keyboard controls (desktop) to verify game logic works

### Game is too fast/slow
**Solution:**
Edit `src/main.js`, line ~28:
```javascript
const CONFIG = {
    runSpeed: 10,  // Lower = slower, Higher = faster
    // Try 5 for easier, 15 for harder
};
```

### Math questions too hard/easy
**Solution:**
Edit `src/main.js`, function `generateMathQuestion()` (around line 282):
- Adjust number ranges
- Change operations (add multiplication, division)

### Touch controls not sensitive enough
**Solution:**
Edit `src/main.js`, line ~516:
```javascript
// Reduce from 30 to 20 for more sensitive swipes
if (Math.abs(deltaX) < 20 && Math.abs(deltaY) < 20) {
```

### Objects spawn too frequently
**Solution:**
Edit `src/main.js`, function `spawnObjects()` (around line 756):
```javascript
// Reduce probability (0.02 = 2% chance per frame)
if (Math.random() < 0.01) { // Change to 0.01 for less frequent
```

## 📊 Testing Checklist

Before building APK:

### Functionality Testing
- ✅ All game mechanics work
- ✅ No crashes or errors in console
- ✅ Math questions generate correctly
- ✅ Scoring system works
- ✅ Lives system works
- ✅ Game over triggers correctly

### Performance Testing
- ✅ Smooth framerate on target devices
- ✅ No memory leaks (play for 5+ minutes)
- ✅ Battery usage acceptable

### UI/UX Testing
- ✅ All text readable
- ✅ Buttons large enough to tap
- ✅ Color contrast sufficient
- ✅ No UI elements off-screen
- ✅ Instructions clear

### Content Testing
- ✅ Math problems appropriate for grade level
- ✅ Difficulty progression makes sense
- ✅ No inappropriate content
- ✅ Encouraging, positive feedback

## 📱 Building APK for Real Device Testing

Once web version works perfectly:

### Quick Build
```bash
./build-apk.sh  # Linux/Mac
# OR
build-apk.bat  # Windows
```

### Install on Device
See `SETUP_GUIDE.md` for detailed APK installation instructions.

## 🔍 Debugging Tips

### Browser Console
- Press F12 → Console tab
- Look for error messages in red
- Check for warnings in yellow

### Chrome DevTools (Mobile Simulation)
1. F12 → Toggle device toolbar
2. Select device (Pixel 5, iPhone)
3. Test touch gestures with mouse
4. Throttle network/CPU to simulate older devices

### Real Device Debugging (Advanced)
```bash
# Enable USB debugging on Android device
# Connect via USB
adb logcat | grep TurboMath

# Or use Chrome remote debugging:
# chrome://inspect
```

## 🎯 Performance Benchmarks

**Target Performance:**
- **FPS:** 60 on flagship, 30 on budget devices
- **Load Time:** <3 seconds
- **APK Size:** <50MB
- **RAM Usage:** <200MB

**Test on:**
- ✅ Budget phone (2-3GB RAM)
- ✅ Mid-range phone (4-6GB RAM)
- ✅ Flagship phone (8GB+ RAM)
- ✅ Tablet (7-12 inch)

## 🚀 Next Steps After Testing

1. ✅ Fix any bugs found
2. ✅ Optimize performance issues
3. ✅ Adjust difficulty if needed
4. ✅ Build release APK
5. ✅ Share with beta testers
6. ✅ Gather feedback
7. ✅ Iterate!

## 💡 Feature Ideas to Test Next

- [ ] Multiple characters (Byte, Luna, Coco, Ace)
- [ ] Different worlds (Ice Land, Volcano, etc.)
- [ ] Power-ups (magnet, shield, speed boost)
- [ ] Sound effects and music
- [ ] Character customization (skins)
- [ ] Local high scores
- [ ] Daily missions
- [ ] Achievements

---

**Happy Testing! 🎮**

Found a bug? Great! Fix it and iterate. That's game development! 🚀
