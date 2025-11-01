# The Adventures of Kosh - Web Version

The game has been ported to JavaScript using Kaboom.js and can now run in any web browser!

## How to Play Locally

1. **Start a local web server** (required for loading sprites):

   ```bash
   # Using Python
   python -m http.server 8000

   # Or using Node.js
   npx http-server -p 8000
   ```

2. **Open your browser** and go to:
   ```
   http://localhost:8000
   ```

3. **Play the game!** Use arrow keys to navigate and Enter to select.

## How to Deploy Online

### Option 1: GitHub Pages (FREE!)

1. Create a GitHub repository
2. Push your code:
   ```bash
   git init
   git add index.html game.js assets/
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/kosh.git
   git push -u origin main
   ```
3. Go to repository Settings → Pages
4. Select "main" branch and click Save
5. Your game will be live at: `https://YOUR_USERNAME.github.io/kosh/`

### Option 2: Netlify (FREE!)

1. Go to [netlify.com](https://netlify.com)
2. Sign up and click "Add new site" → "Deploy manually"
3. Drag and drop your entire `kosh` folder
4. Done! You'll get a URL like `kosh-adventures.netlify.app`

### Option 3: itch.io (FREE!)

1. Go to [itch.io](https://itch.io) and create an account
2. Click "Upload new project"
3. Set "Kind of project" to "HTML"
4. Create a ZIP file with `index.html`, `game.js`, and `assets/` folder
5. Upload the ZIP and check "This file will be played in the browser"
6. Set your pricing (can be free or pay-what-you-want)
7. Publish!

## Files Needed for Deployment

Make sure you include these files:

```
kosh/
├── index.html          # Main HTML file
├── game.js             # Game logic
└── assets/
    └── sprites/
        ├── kosh_idle.png
        ├── kosh_meow.png
        ├── kosh_paw_tap.png
        ├── kosh_zoomies.png
        ├── kosh_sleeping.png
        ├── dad_sleeping.png
        ├── dad_awake.png
        ├── window_closed.png
        ├── window_open.png
        └── bedroom_bg.png
```

## Controls

- **Arrow Keys (UP/DOWN)**: Navigate menus
- **ENTER**: Select/Confirm
- **ESC**: Exit quest

## Features

✅ Complete port of the Python/Pygame version
✅ All pixel art sprites with glow effects
✅ Particle effects (sparkles, Zzz's, hearts)
✅ Screen shake for zoomies
✅ Save/load to browser localStorage
✅ Works on desktop and mobile browsers
✅ No installation required

## Share Your Game!

Once deployed, you can share the URL with anyone and they can play immediately - no downloads or installations needed!
