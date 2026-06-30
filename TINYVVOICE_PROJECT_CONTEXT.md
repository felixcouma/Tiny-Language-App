# 🦁 TinyVoice Twins — Project Context (Living Document)

**This file is the single source of truth for project state. It is updated on every push.**
A git pre-commit hook auto-refreshes the metadata block below; the human-maintained
sections (Build Status, Next Steps) are updated by hand each push.

<!-- AUTO:START -->
> _Auto-updated on commit — last refreshed **2026-06-30 04:19 UTC** on branch `main`._

**Recent commits:**

- `25cf0e8 Docs: songs feature + SaaS context; scope song animations; log backlog`
- `451892e Add "Sing with Pip" — 13 public-domain children's songs, per-child selectable`
- `11431f9 Update CURRENT_SESSION: SaaS pilot (Parts A & B) shipped; let pilot run`
- `2ead72e Gracefully handle expired/used magic links`
- `ecbb9b5 Part B: optional parent accounts + cloud sync + 30-day trial (Supabase)`
- `d3867c5 Wire generic profiles through Home, Twin Mode + Parent area`
<!-- AUTO:END -->

---

## 📦 LIVE BUILD STATUS — v5 ("best of v3 + v4")

**Stack:** React 18 · Vite · Zustand · vite-plugin-pwa (Workbox, StaleWhileRevalidate) · warm Gemini-TTS clips · Web Audio
**Branch:** `main` · **Live:** https://felixcouma.github.io/Tiny-Language-App/
**Runs with:** `npm install && npm run dev`  ·  Build verified ✅  ·  Auto-deploys to Pages on push ✅

### ✅ Implemented
- **Cartoon "scene" UI (v5.1)** — sparkly sky + cartoon globe, **Pip the frog mascot** in a
  speech bubble, big translucent card, chunky **Auto Play** + arrow buttons, round home/replay/mute
  buttons (matches the reference kids-app style). Learning screen + games themed.
- **Auto Play** mode (auto-advances & speaks through a world) · **Mute** toggle (persisted) ·
  **Storybook voice picker** in the Parent view (Aoede default · Leda · Sulafat warm clips).
- **Dormant alt-voice hook (ElevenLabs)** — `src/lib/tts.js` + a Cloudflare Worker
  (`infra/tts-worker.js`) can proxy a premium cloud voice if `VITE_TTS_PROXY_URL` is set
  (guide: `docs/PREMIUM_VOICE_SETUP.md`). **Not in use** — the bundled Gemini-TTS clips are the
  warm voice; this is an optional fallback path only.
- **No emoji — real WebP illustrations.** Each item shows a bundled `public/images/<key>.webp`
  (AAC-style art, many generated via the Gemini/Vertex image model — see `scripts/gen-symbols.mjs`).
  `src/lib/images.js` resolves local WebP → Unsplash/Pexels/Wikimedia as a fallback; missing
  pictures render a bold coloured **WordPic** tile (`src/components/WordPic.jsx`), never broken.
- **Spoken language (the mission).** Every word & phrase plays a **warm pre-rendered voice clip**
  (Gemini-TTS via Google Cloud, 3 voices: Aoede default · Leda · Sulafat, picked in the Parent
  view). `src/lib/audio.js`: `sayWord()` for item words (`sounds/<voice>/<key>.mp3`), `voice()`
  for phrases (`sounds/phrases/<slug>.mp3`), `fx/<key>.mp3` for real animal sounds. **No robotic
  device voice** — a missing clip falls back to a soft chime. Re-record clips with
  `scripts/gen-tts-gcloud.mjs` (see `docs/TTS_GCLOUD_SETUP.md`).
- **7 living worlds** — incl. the two parent-requested favourites:
  **My Body** (13 parts) and **Things I Do** (12 activities/verbs) + Home Village (family+objects),
  Safari Island (25 animals), Rainbow Island (10 colours), Counting Mountain (1–20), Music Forest.
- **Learning screen** — picture stage, word, IPA, big "hear it" button (auto-speaks on arrival),
  and **Language Ladder** chips that speak 2-word → 3-word phrases (word → sentence).
- **Listening Game** & **Twin Mode** — listen → tap the right picture; Twin Mode does turn-taking
  rounds naming **Audrey & Adriel**. Rotating warm praise; gentle wobble on a miss (no scores).
- **Word Practice / Phrase Builder** — per-child stage (`phraseLevel`): tap words, or build 2-/3-word
  phrases (`src/data/phraseContent.js`, `PhraseScreen`). Readiness graduates a child from words →
  phrases at ~25 distinct words.
- **Word Board (AAC)** — therapist-style communication board with a message strip, plus a **Find**
  word-focus mode (one target hops cell-to-cell, advances after 5 finds) for early trackers (`GridScreen`).
- **Letter Sounds** (phonics), **Chant** (sing-along), **Today with Pip** (adaptive session),
  **Collection** (gentle word collecting), **Rest / screen-time** (per-child limit + quiet hours).
- **Sing with Pip** — 13 **public-domain children's songs** (U.S. State Dept "Sing Out Loud",
  credited in `CREDITS.md`): real recordings, a simple Pip player, **per-child selectable** by a
  grown-up (`enabledSongs`, 4 on by default). `src/data/songs.js`, `SongScreen`.
- **Multi-child profiles** — **generic, renamable** children (fresh devices ask "how many
  children? 1 or 2" at setup; Twin Mode gates on 2); per-child progress, stage, voice, screen-time,
  bedtime, focus words & songs, all in localStorage. The original device keeps its AJ/AG twins.
- **Optional cloud accounts (Part B)** — parents may sign in (Supabase **magic link**) to back up +
  **sync** each child's progress/settings across devices and run a **30-day soft-trial** (banner
  only; child play never blocked). Fully local when Supabase env is absent. `src/lib/{supabase,cloud}.js`.
- **Parent Dashboard** — gentle insight (words heard, favourite world, top words, days, accuracy);
  Children (rename / 1↔2), Songs toggles, Account (sign-in/trial/delete-data); reset. No scores/pressure.
- **Mobile-first PWA** — phone-width column, safe-area aware, add-to-home-screen, auto-updating
  service worker, `prefers-reduced-motion`, screen wake-lock so the device won't sleep mid-play.

### 🚧 Backlog (see `docs/LEFT_TO_DO.md`)
- **Full per-voice switching** (§3) — generate Leda/Sulafat copies of the ~800 phrase clips so the
  voice toggle changes *everything* (Aoede is already the enforced default). ~$3–5 of the GCP credit.
- **Real animal FX recordings + duck-quack fix** (§4) — the 5 new animals (Snake/Owl/Wolf/Goose/Crow)
  currently use spoken sound-labels; real CC `fx/<key>.mp3` clips need ear-auditioning. Keys are pre-wired.
- **Music Forest** build-out (richer sound-play). Optional: Word Board "mastered → retire word" mode.

### 🗂️ Code map
```
src/
├── data/content.js        # 7 worlds / 102 items (say text, IPA, ladder phrases, PRAISE)
├── data/phraseContent.js  # speech-therapy vocab (209 words / tiers / categories) + phrase banks
├── lib/audio.js           # warm voice-clip playback (sayWord/voice/voiceSeq/playItem) + chime/celebration
├── lib/images.js          # local-WebP-first resolver (→ Unsplash/Pexels/Wikimedia) + cache
├── lib/                   # tts.js (dormant premium hook) · today.js · screentime.js · useWakeLock.js
├── store.js               # Zustand: router, profiles, progress, stage, gate, screen-time
├── components/            # WordPic, TactileStage, Ladder, Mascot(Pip), Confetti, ChoiceGame,
│                          # Onboarding, InstallHint, UpdatePrompt, ParentGate, ErrorBoundary
└── screens/               # ProfilePicker, Home, Learning, Today, Collection, Parent, SoundGame,
                           # TwinMode, Phonics, Phrase, Grid (Word Board), Chant, Rest
public/
├── images/<key>.webp      # bundled illustrations + generated AAC symbols
└── sounds/<voice>/<key>.mp3 · sounds/phrases/<slug>.mp3 · sounds/fx/<key>.mp3 (+ CREDITS.md)
scripts/                   # gen-tts-gcloud · gen-symbols · optimize-images · clean-orphan-clips · check-content
docs/                      # LEFT_TO_DO · TTS_GCLOUD_SETUP · Observations · blueprints + workflow
```

### ⚠️ Notes
- Pictures are bundled `public/images/<key>.webp` (illustrations / generated symbols); a word with
  no picture shows a bold coloured **WordPic** tile. Swap any picture by replacing its `.webp`
  (or add a key in `WORD_ALIAS`/`imageKeyFor` to reuse one already in the bank).
- Audio is bundled warm Gemini-TTS clips (consistent on every device); a missing clip falls back
  to a soft chime, never the robotic device voice. Re-record via `scripts/gen-tts-gcloud.mjs`.
- `npm run check` guards content integrity (7 worlds / item shapes / counting / colours / game pool);
  it runs automatically on `npm run build`.

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
**Current:** `LEFT_TO_DO` (backlog) · `TTS_GCLOUD_SETUP` (voice pipeline) · `Observations` ·
`CROSS_DEVICE_WORKFLOW` · `PHRASES_REVIEW` (spoken-line audit, regen via `scripts/list-phrases.mjs`).
**Origins:** MasterBlueprint · WireframeSystem · RealAssetsGuide · ContentDatabase.csv · Twins_v4_Masterplan.
> Handoff state lives in `CURRENT_SESSION.md` (update before each push).

---

## 📝 HOW TO TEST
Open the live link on a phone/tablet, or run locally:
```bash
npm install && npm run dev   # then open the printed Local/Network URL
```
Tap a world → hear the word in the warm voice + see its picture → tap the Ladder phrases →
try the Listening Game, Twin Mode, Word Practice, Word Board (+ Find mode) and Letter Sounds →
the ••• button (top-right of Home) opens the Parent view (voice picker, screen-time, insights).
