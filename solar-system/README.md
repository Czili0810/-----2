# ☀ Solar System Simulator

**Interactive NASA Style Solar System Explorer** — A real-time 3D planetarium built with Three.js.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Three.js](https://img.shields.io/badge/Three.js-0.160-000000?logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)

---

## ✨ Features

| Category | Details |
|----------|---------|
| 🌍 **8 Planets + Sun + Moon** | Full solar system with accurate relative sizes & orbital speeds |
| 🎨 **Procedural Textures** | 2048² canvas-rendered surfaces; Earth has continents, Jupiter has bands, Saturn has rings |
| ✨ **Selective Bloom** | Layer-based post-processing — only the Sun and stars glow; planets stay crisp |
| 🔍 **Depth of Field** | Dynamic BokehPass with auto-focus on selected planet |
| 🎥 **4 Camera Modes** | Orbit / Focus / Follow / Free-flight (WASD) |
| 🚀 **Auto Tour** | Sequential fly-by with follow-tracking and scroll-wheel zoom |
| 💾 **Idle Detection** | 25s of inactivity → camera smoothly returns to Sun |
| 🌌 **Realistic Starfield** | Hertzsprung-Russell spectrum stars, Milky Way band, twinkling particles |
| 🔥 **Sun Lens Flare** | 6-layer procedural flare with chromatic aberration |
| 📋 **Mission Control UI** | NASA-style dark panel with 10 data fields per celestial body |
| 📱 **Responsive** | Adapts to desktop, tablet, and mobile screens |

---

## 🚀 Quick Start

```bash
# Clone and enter
cd solar-system

# Install dependencies
npm install

# Start development server (opens browser)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🌐 Deployment

### GitHub Pages

1. Push your repository to GitHub
2. In `vite.config.js`, ensure `base: './'` is set (already configured)
3. Build: `npm run build`
4. Deploy the `dist/` folder:

```bash
# Option A: gh-pages package
npm install -g gh-pages
gh-pages -d dist

# Option B: GitHub Actions (.github/workflows/deploy.yml)
name: Deploy to Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

5. In repo Settings → Pages → Source: `gh-pages` branch

### Vercel

1. Push your repository to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your repository
4. Vercel auto-detects Vite — no configuration needed
5. Click **Deploy**

Or use CLI:
```bash
npm i -g vercel
vercel
```

### Netlify

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import**
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Click **Deploy site**

Or drag-and-drop the `dist/` folder onto [app.netlify.com/drop](https://app.netlify.com/drop)

Or CLI:
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## 📁 Project Structure

```
solar-system/
├── index.html              # Entry HTML with loading screen
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite configuration
├── README.md               # This file
├── public/
│   └── favicon.svg         # Saturn favicon
├── src/
│   ├── main.js             # Entry point, animation loop, wire-up
│   ├── style.css           # NASA Mission Control UI styles
│   ├── data.js             # Planet/moon/sun scientific data
│   ├── textures.js         # Procedural texture generation (canvas)
│   ├── scene.js            # Three.js scene, camera, renderer, post-processing
│   ├── objects.js          # Sun, planets, moon, rings, starfield, lens flare
│   └── ui.js               # Camera modes, tour system, control panel, interactions
└── dist/                   # Production build output
```

---

## 🎮 Controls

| Input | Action |
|-------|--------|
| 🖱 Drag | Rotate camera |
| 🖱 Scroll | Zoom in/out |
| 🖱 Click planet | Show info card |
| 🖱 Double-click | Fly to planet |
| ⏯ Play/Pause | Freeze animation |
| ⏪ ⏩ | Time speed: 0.1× – 10× |
| ◎ | Toggle orbit lines |
| 🏷 | Toggle name labels |
| 🚀 | Auto-tour all 9 bodies |
| ↺ | Reset to Sun |
| `R` | Reset view |
| `Space` | Toggle auto-rotate |
| `Esc` | Close info panel |

---

## 🛠 Tech Stack

- **Three.js 0.160** — WebGL 3D engine
- **Vite 5** — Build tool with HMR
- **Post-processing** — UnrealBloomPass, BokehPass, ShaderPass
- **Procedural textures** — Canvas 2D API (no external images needed)
- **Logarithmic depth buffer** — Near/far clipping precision

---

## 📄 License

MIT — free for personal and commercial use.

---

*Made with Three.js · Inspired by NASA Eyes on the Solar System*
