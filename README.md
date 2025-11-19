# 🌟 Turbo Math Dash

A joyful 3D math runner game for kids (Kindergarten to Grade 4).

## Features

- 🎮 **3D Endless Runner** - Subway Surfers-style gameplay
- 🧮 **Educational** - Learn math while playing (addition, subtraction)
- 🦕 **Cute Character** - Dash the Dino with fun animations
- 📱 **Mobile-First** - Optimized for Android devices
- 🎨 **Colorful** - Bright, kid-friendly visuals
- ✨ **Safe** - No ads, no data collection, COPPA compliant

## Quick Start

### Web Development (Testing)

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser to http://localhost:3000
```

### Build for Android APK

```bash
# Build web assets
npm run build

# Initialize Capacitor (first time only)
npx cap init "Turbo Math Dash" "com.turbomath.dash"

# Add Android platform (first time only)
npx cap add android

# Sync and build
npm run android
```

## Controls

- **Swipe Left/Right** - Change lanes
- **Swipe Up** or **Tap** - Jump
- **Desktop**: Arrow keys and spacebar

## Game Mechanics

1. **Run forward** automatically
2. **Collect coins** 💰 for points
3. **Collect stars** ⭐ for bonuses
4. **Avoid obstacles** by jumping or switching lanes
5. **Answer math questions** every 100 meters
6. **Keep 3 lives** ❤️❤️❤️

## Project Structure

```
TurboMathDash/
├── index.html          # Main HTML entry
├── src/
│   └── main.js         # Game engine (Three.js)
├── package.json        # Dependencies
├── vite.config.js      # Build configuration
└── README.md           # This file
```

## Technology Stack

- **Three.js** - 3D graphics engine
- **Vite** - Fast build tool
- **Capacitor** - Native Android wrapper
- **Vanilla JavaScript** - No framework overhead

## Development Roadmap

- [x] Core 3D runner mechanics
- [x] Basic character (Dash the Dino)
- [x] Math question system (addition/subtraction)
- [x] Touch controls
- [x] Collectibles (coins, stars)
- [ ] Multiple characters (Byte, Luna, Coco, Ace)
- [ ] Character customization (skins)
- [ ] Multiple worlds (Ice Land, Volcano, Ocean, Galaxy)
- [ ] Power-ups system
- [ ] Achievements and missions
- [ ] Sound effects and music
- [ ] Local storage for progress
- [ ] Parent dashboard

## License

MIT License - Free for educational use

## Credits

Created with ❤️ for young math learners
