# Deployment Guide — Solar System Simulator

## Quick Deploy (3 Options)

| Platform | Time | Cost |
|----------|------|------|
| **Vercel** | ~30 seconds | Free |
| **Netlify** | ~30 seconds | Free |
| **GitHub Pages** | ~2 minutes | Free |

---

## 🚀 Option 1: Vercel (Recommended — Easiest)

### One-Click Deploy

```bash
npx vercel
```

Follow the CLI prompts. Done.

### Manual via Dashboard

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your repository
4. Vercel auto-detects Vite. Click **Deploy**
5. Get your URL: `https://xxx.vercel.app`

### Custom Domain (Optional)

Dashboard → Settings → Domains → Add your domain → Update DNS CNAME to `cname.vercel-dns.com`

---

## 🌐 Option 2: Netlify

### Drag-and-Drop (Zero Config)

```bash
npm run build
```

Then drag the `dist/` folder onto [app.netlify.com/drop](https://app.netlify.com/drop)

### CLI Deploy

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Git-based Deploy

1. Push code to GitHub
2. [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy

---

## 📦 Option 3: GitHub Pages

### Automatic (Recommended)

Push to `main` branch → GitHub Actions auto-deploys via `.github/workflows/deploy.yml`

Enable in: **Repo Settings → Pages → Source: GitHub Actions**

### Manual

```bash
npm run build
npx gh-pages -d dist
```

Then set **Pages → Source: gh-pages branch**

---

## 🔧 Build Locally

```bash
npm install        # Install dependencies
npm run dev        # Dev server (hot reload) → http://localhost:5173
npm run build      # Production build → dist/
npm run preview    # Preview production build → http://localhost:4173
```

---

## 📁 Output Structure

```
dist/
├── index.html          # Entry (3.7 KB)
├── favicon.svg         # Saturn icon
└── assets/
    ├── index-xxx.css   # Styles (7 KB)
    └── index-xxx.js    # Bundle (550 KB / 142 KB gzipped)
```

---

## ✅ Post-Deploy Checklist

- [ ] Open deployed URL in Chrome, Firefox, Safari
- [ ] Test on mobile (iPhone/Android)
- [ ] Verify all planets render with textures
- [ ] Test click-to-info, double-click fly, auto-tour
- [ ] Test free-flight mode (WASD)
- [ ] Verify Bloom effect on Sun/stars
- [ ] Check orbit lines toggle
- [ ] Confirm 25s idle auto-return to Sun

---

## ⚡ Performance Notes

- **First load**: ~550 KB JS + ~7 KB CSS
- **Gzipped**: ~142 KB JS + ~2 KB CSS
- **Textures**: Generated procedurally at runtime (no image downloads)
- **Render**: WebGL with logarithmic depth buffer, selective bloom at half-res
