# 🦁 TinyVoice Twins — Project Context (Living Document)

**This file is the single source of truth for project state. It is updated on every push.**
A git pre-commit hook auto-refreshes the metadata block below; the human-maintained
sections (Build Status, Next Steps) are updated by hand each push.

<!-- AUTO:START -->
> _Auto-updated on commit — last refreshed **2026-06-05 01:45 UTC** on branch `claude/eloquent-hamilton-eMHn4`._

**Recent commits:**

- `4a33372 Add GitHub Pages auto-deploy workflow`
- `a83b264 Add living PROJECT_CONTEXT, cross-device workflow, and auto-update hook`
- `4a060c4 Build TinyVoice Twins mobile-first MVP web app`
- `03e9ed8 Add TinyVoice Twins v4 Masterplan (final doc, 6 of 6)`
- `5cfab55 Add TinyVoice Twins project documentation (5 of 6 files)`
- `f358fd1 Initial commit`
<!-- AUTO:END -->

---

## 📦 LIVE BUILD STATUS

**Stack shipped:** React 18 · Vite · Zustand · CSS animations · HTML5 Audio + Web Audio fallback
**Branch:** `main` (active) · **Live:** https://felixcouma.github.io/Tiny-Language-App/
**Runs with:** `npm install && npm run dev`  ·  Build verified ✅  ·  Auto-deploys to Pages on push ✅

### ✅ Implemented (MVP)
- **Home screen** — 5 v4 "living world" cards (Home Village, Safari Island, Rainbow Island,
  Counting Mountain, Music Forest), mobile-first, PWA-installable, staggered entrance animation.
- **Learning screen** — per item: adaptive visual (emoji / real-photo / colour swatch /
  number-quantity), the word, **IPA phonetics**, teaching script, large **tap-to-play sound**
  button (auto-plays on arrival), prev/next nav.
- **v4 Language Ladder** — each item shows 2-word + 3-word "say it together" phrases (Stage D→E).
- **Audio engine** — plays `public/sounds/<key>.mp3` if present, else a gentle Web Audio tone
  (never fakes an animal sound). Celebration arpeggio helper ready for the game.
- **Design tokens** — colours, type, spacing, motion, shadows from the blueprint; safe-area +
  `prefers-reduced-motion` support.
- **Content data** — `src/data/content.js`: 20 animals, 10 colours, numbers 1–20, 16 home
  objects, 8 sound-discrimination items (derived from the 155-word database).

### 🚧 Not yet built (next candidates)
- **Sound Game** (listen → tap correct → celebrate, gentle no-penalty retry, confetti)
- **Twin Mode** (named turn-taking rounds for Audrey & Adriel)
- **Parent Dashboard** (words exposed/spoken, favourite categories, emerging phrases)
- **Real assets** — drop Unsplash/Pexels photos (`image` field) and Zapsplat/SoundJay
  recordings (`public/sounds/`) for the core 10 animals first.
- Swipe navigation, auto-play world mode.

### 🗂️ Code map
```
src/
├── data/content.js        # 5 worlds + items (IPA, scripts, ladder phrases)
├── lib/audio.js           # real-file-first audio with tone fallback
├── store.js               # Zustand: screen router + position
├── screens/HomeScreen.*    # the 5 living-world cards
├── screens/LearningScreen.* # the core learn experience
└── styles/tokens.css       # design system (from blueprint)
public/
├── manifest.webmanifest    # add-to-home-screen
├── icon.svg
└── sounds/README.md        # where to drop real recordings
docs/                       # all source documents (blueprint, wireframes, csv, v4, workflow)
```

---

## 🔄 CROSS-DEVICE WORKFLOW (PC ↔ laptop)

Full guide: [`docs/CROSS_DEVICE_WORKFLOW.md`](./docs/CROSS_DEVICE_WORKFLOW.md). Essentials:

**First time on a new machine**
```bash
git clone <your-repo-url> Tiny-Language-App
cd Tiny-Language-App
git config core.hooksPath .githooks   # enable auto context updates
npm install
```

**Arriving / resuming on a machine you've used before**
```bash
cd Tiny-Language-App
git pull origin main
npm install        # in case dependencies changed
```

**Before leaving a machine**
```bash
git add .
git commit -m "Clear description of what you changed"   # hook refreshes this file
git push origin main      # also auto-deploys the live site
```

> ✅ The project lives on **`main`** — every push to `main` redeploys the live link above.

`node_modules/` and `dist/` are gitignored; `package-lock.json` **is** committed so installs
are identical on every device.

---

## 🎨 DESIGN SYSTEM AT A GLANCE

**Primary (60%)** `#FF8C00` Tangerine (animals) · `#FF1493` Magenta (colours) ·
`#32CD32` Lime (ABC) · `#1E90FF` Blue (numbers) · `#FF6B6B` Coral (household) ·
`#9D4EDD` Purple (sounds/magic)
**Accents** `#FFD700` Yellow · `#20B2AA` Teal
**Backgrounds** `#FFFDF8` Cream · `#2C3E50` Charcoal text (never pure black) · `#E8E6E1` borders
**Type** Quicksand Bold · 400/700 only · 28px+ for toddlers
**Touch** 80×80px primary buttons · 16px spacing · 48×48px secondary min
**Motion** quick 0.2–0.3s · normal 0.4–0.5s · slow/celebration 0.6–0.8s ·
bounce `cubic-bezier(0.34,1.56,0.64,1)`

## 🪜 LEARNING LADDER (v4)
`A) Listen → B) Point → C) Repeat → D) Expand (2-word) → E) Build (3-word) → F) Communicate`

## 🎯 GOLDEN RULES
1. Sound first  2. Real assets (no synthetic)  3. Joy over performance (no scores/badges)
4. Toddler-safe (big buttons, bold colours, chunky fonts)  5. Twin-focused turn-taking
6. Speech development progression  7. Parent partnership, no pressure

## 📑 DOCUMENT INDEX (in `docs/`)
| Doc | Purpose |
|-----|---------|
| TinyVoice_MasterBlueprint.md | Design philosophy, architecture, interaction flows |
| TinyVoice_WireframeSystem.md | Wireframes, button states, animation timing, a11y |
| TinyVoice_RealAssetsGuide.md | Image/sound sourcing, APIs, licensing |
| TinyVoice_ContentDatabase.csv | All 155 words (IPA, scripts, colours) |
| TinyVoice_Twins_v4_Masterplan.md | Speech framework, twin mode, living worlds |
| DOCUMENTATION_UPDATE_SUMMARY.md | V2→V3 change log |
| CROSS_DEVICE_WORKFLOW.md | Git workflow across devices |

---

## 📝 HOW TO START TESTING (local, on any device)
```bash
npm install
npm run dev            # opens on http://localhost:5173
```
Vite prints a **Network:** URL (e.g. `http://192.168.x.x:5173`). Open that on a phone or
tablet on the **same Wi-Fi** to test touch + sound on a real device. Tap a world → tap items →
tap 🔊 to hear the sound (a tone until real recordings are added) → use Prev/Next.
See the chat / README for the full step-by-step.
