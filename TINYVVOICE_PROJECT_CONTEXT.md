# 🦁 TinyVoice Twins — Project Context (Living Document)

**This file is the single source of truth for project state. It is updated on every push.**
A git pre-commit hook auto-refreshes the metadata block below; the human-maintained
sections (Build Status, Next Steps) are updated by hand each push.

<!-- AUTO:START -->
> _Auto-updated on commit — last refreshed **2026-06-05 18:50 UTC** on branch `main`._

**Recent commits:**

- `98bca54 Add docs/LOCAL_SETUP.md (Windows/macOS local dev + Claude Code handoff)`
- `6cbd94d Update session notes: layout fixes + verify-at-desk checklist`
- `7e64b0f Fix confetti overlay in games + add content integrity check`
- `836397c Fix Home/Learning blank screen: keep background globe out of layout flow`
- `f31c9b2 Fix clipped/unscrollable screens (Parent Dashboard etc.)`
- `1a1103e Add tap-to-hear speaker badge on card + readable colour-word contrast guard`
<!-- AUTO:END -->

---

## 📦 LIVE BUILD STATUS — v5 ("best of v3 + v4")

**Stack:** React 18 · Vite · Zustand · CSS animations · Web Speech (spoken words) · Web Audio
**Branch:** `main` · **Live:** https://felixcouma.github.io/Tiny-Language-App/
**Runs with:** `npm install && npm run dev`  ·  Build verified ✅  ·  Auto-deploys to Pages on push ✅

### ✅ Implemented
- **Cartoon "scene" UI (v5.1)** — sparkly sky + cartoon globe, **Pip the frog mascot** in a
  speech bubble, big translucent card, chunky **Auto Play** + arrow buttons, round home/replay/mute
  buttons (matches the reference kids-app style). Learning screen + games themed.
- **Auto Play** mode (auto-advances & speaks through a world) · **Mute** toggle (persisted) ·
  **Voice picker** in the Parent view (choose the device's friendliest voice; playful cadence).
- **Premium natural voice ready (ElevenLabs)** — `src/lib/tts.js` + Cloudflare Worker
  (`infra/tts-worker.js`) keep the API key secret; cached per device; falls back to device
  voice. **To activate:** deploy the Worker and set repo Variable `VITE_TTS_PROXY_URL`
  (guide: `docs/PREMIUM_VOICE_SETUP.md`). Decision: premium voice + real photos in cartoon frame.
- **No emoji — real photographs.** `src/lib/images.js` resolves a real, friendly photo
  per item at runtime from **Wikimedia** (keyless, CORS-ok) with optional **Unsplash/Pexels**
  keys (`.env`). Loading shimmer + clean **typographic fallback** card (never broken, never emoji).
  Family members use a deliberate typographic card (no stranger photos).
- **Spoken language (the mission).** `src/lib/audio.js` speaks every word & phrase via the
  browser speech engine, so children HEAR the language. Prefers a real recording at
  `public/sounds/<key>.mp3` if present (drop in animal sounds anytime).
- **7 living worlds** — incl. the two parent-requested favourites:
  **My Body** (13 parts) and **Things I Do** (12 activities/verbs) + Home Village (family+objects),
  Safari Island (20 animals), Rainbow Island (10 colours), Counting Mountain (1–20), Music Forest.
- **Learning screen** — real-photo stage, word, IPA, big "hear it" button (auto-speaks on arrival),
  and v4 **Language Ladder** chips that speak 2-word → 3-word phrases (word → sentence).
- **Listening Game** (v3) — listen → tap the right photo from 4 → confetti + celebration; wrong
  taps gently wobble and invite a retry (no penalty, no scores).
- **Twin Mode** (v4) — turn-taking rounds that name **Audrey & Adriel** ("Audrey, find the dog!").
- **Parent Dashboard** — gentle insight (words heard, favourite world, top words, days, accuracy),
  stored locally; reset button. No scores/badges/pressure.
- **Mobile-first PWA** — phone-width column, safe-area aware, add-to-home-screen, `prefers-reduced-motion`.

### 🚧 Not yet built (next candidates)
- Real recorded **animal sounds** in `public/sounds/` (currently spoken via speech engine).
- Curated photos via an Unsplash key (wire is ready; just add `VITE_UNSPLASH_KEY`).
- Auto-play "story" mode; swipe navigation; ABC phonics world (v3) if wanted.
- Per-item photo overrides for any Wikimedia image you want to swap.

### 🗂️ Code map
```
src/
├── data/content.js          # 7 worlds + items (wiki title, say text, IPA, ladder phrases)
├── lib/images.js            # real-photo resolver (Wikimedia / Unsplash / Pexels) + cache
├── lib/audio.js             # speech (words/phrases) + chime + celebration; real-file aware
├── store.js                 # Zustand: screen router, position, localStorage progress
├── components/ItemVisual.*   # photo / swatch / number / portrait visual (+ fallback)
├── components/ChoiceGame.*   # shared listen-and-tap engine (Sound Game + Twin Mode)
├── components/Confetti.*     # celebration confetti
└── screens/                 # Home, Learning, SoundGame, TwinMode, ParentDashboard
public/
├── manifest.webmanifest · icon.svg (no emoji)
└── sounds/README.md          # drop real recordings here to override speech
docs/                         # all source documents (blueprint, wireframes, csv, v4, workflow)
.env.example                  # optional photo API keys
```

### ⚠️ Notes for review (morning)
- Photos come from Wikimedia article images chosen via each item's `wiki` title. Most are
  clear & friendly; a few (e.g. some body parts) may be clinical. **Skim once** — any photo can
  be swapped by setting `image: '<url>'` on that item in `content.js`, or add an Unsplash key
  for curated results app-wide.
- Audio is the browser's speech voice (varies by device). Real recordings override it per item.

---

## 🔄 CROSS-DEVICE WORKFLOW (PC ↔ laptop)

Full guide: [`docs/CROSS_DEVICE_WORKFLOW.md`](./docs/CROSS_DEVICE_WORKFLOW.md).

**First time on a new machine**
```bash
git clone <your-repo-url> Tiny-Language-App
cd Tiny-Language-App
git config core.hooksPath .githooks   # enable auto context updates
npm install
```
**Resuming**
```bash
cd Tiny-Language-App && git pull origin main && npm install
```
**Before leaving**
```bash
git add . && git commit -m "what changed" && git push origin main   # auto-deploys the live site
```
> The project lives on **`main`**; every push redeploys the live link. `node_modules`/`dist`
> are gitignored; `package-lock.json` is committed for identical installs everywhere.

---

## 🎨 DESIGN SYSTEM AT A GLANCE
**Primary** `#FF8C00` · `#FF1493` · `#32CD32` · `#1E90FF` · `#FF6B6B` · `#9D4EDD`
**Accents** `#FFD700` · `#20B2AA` · **Bg** `#FFFDF8` cream · text `#2C3E50` (never pure black)
**Type** Quicksand 400/700 · **Touch** 64px+ targets · **Motion** bounce `cubic-bezier(0.34,1.56,0.64,1)`

## 🪜 LEARNING LADDER (v4)
`Listen → Point → Repeat → Expand (2-word) → Build (3-word) → Communicate`

## 🎯 GOLDEN RULES
1. Sound first  2. Real assets (no emoji/synthetic)  3. Joy over performance (no scores)
4. Toddler-safe  5. Twin-focused turn-taking  6. Speech progression  7. Parent partnership

## 📑 DOCUMENT INDEX (`docs/`)
MasterBlueprint · WireframeSystem · RealAssetsGuide · ContentDatabase.csv ·
Twins_v4_Masterplan · DOCUMENTATION_UPDATE_SUMMARY · CROSS_DEVICE_WORKFLOW

---

## 📝 HOW TO TEST
Open the live link on a phone/tablet, or run locally:
```bash
npm install && npm run dev   # then open the printed Local/Network URL
```
Tap a world → hear the word spoken + see a real photo → tap "Say it together" phrases →
try the Listening Game and Twin Mode → the ••• button (top-right of Home) opens the Parent view.
