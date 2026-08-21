# 🦁 TinyVoice Twins — Project Context (Living Document)

**This file is the single source of truth for project state. It is updated on every push.**
A git pre-commit hook auto-refreshes the metadata block below; the human-maintained
sections (Build Status, Next Steps) are updated by hand each push.

<!-- AUTO:START -->
> _Auto-updated on commit — last refreshed **2026-08-21 04:41 UTC** on branch `main`._

**Recent commits:**

- `b2badbe Feat: 3 more listening-game scenes (Zoo, 1-2-3 Counting, Fruits & Veggies)`
- `470465e Feat: Listening Game mini-scenes (Farm/Snack/Park/Body) + visible prompt`
- `46b1bb2 Docs: high-level capabilities, recent changes & premium re-imaging summary`
- `eb382dd Docs: one-page product guide/pamphlet + screenshot capture script`
- `e9b6082 Docs: scope on-demand name TTS (serverless voice-matched, long-tail top-up)`
- `b1585bb Feat: bake 200 common child-name voice clips (×3 voices) + dynamic tail`
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
  **My Body** (13 parts) and **Things I Do** (28 **animated** activities/verbs — see below) + Home
  Village (family+objects), Safari Island (26 animals), Rainbow Island (10 colours), Counting
  Mountain (1–20), Music Forest.
- **Learning screen** — picture stage, word, IPA, big "hear it" button (auto-speaks on arrival),
  and **Language Ladder** chips that speak 2-word → 3-word phrases (word → sentence). "Things I Do"
  **verbs animate** here (looped key-pose frames — see below).
- **Listening Game** & **Twin Mode** — the prompt asks **"Where's the …?" / "Who's …?"** and plays the
  **real recorded animal sound** (`fx/<key>.mp3`, `src/data/fxKeys.js`) for fx-animals instead of a
  spelled-out onomatopoeia; non-fx animals speak a short cue. Correct → **labelled praise** ("You found
  the cow!", a light interjection ~1 in 4). Wrong is **errorless** (`ChoiceGame.jsx`): help escalates —
  "Try again" → repeat the prompt → **narrow to two** (others fade + go inert) → **model** the answer
  ("Here — cow!") and accept as success; help fires only on the child's tap (no failure state, no
  scores). Twin Mode does turn-taking (name clip when we have one — audrey/adriel/ezra/leila/ethan —
  else a warm **"Your turn!"**) and a shared, **no-winner** "You did it together!" finale.
- **Word Practice / Phrase Builder** — per-child stage (`phraseLevel`): tap words, or build 2-/3-word
  phrases (`src/data/phraseContent.js`, `PhraseScreen`). Readiness graduates a child from words →
  phrases at ~25 distinct words.
- **Word Board (AAC)** — a real communication board with **stable symbol positions** (SLP §S1): a fixed
  **Core** page (`CORE_BOARD`) that never shuffles + position-stable category pages, a **4-column** grid
  on every screen (bigger toddler targets, gap-free — every page is a multiple of 4), and a message strip
  (**CLEAR empties the message, never the board**). Separate **Find** word-focus mode (one target hops
  cell-to-cell, advances after 5 finds). `GridScreen`; guarded by `verify-word-board.mjs`.
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
  Children (rename / 1↔2), Songs toggles, **Wait time** (per-child expectant pause — hold a beat
  before the Learning screen speaks so the child can try naming it first), Account
  (sign-in/trial/delete-data); reset. No scores/pressure. **Warm, colour-coded layout**: a Pip hero
  with a live "heard N words" line, tinted stat cards, and **collapsible panels** (everyday controls
  open, rarer ones behind a "More settings" divider) so the page opens short.
- **In-session parent line** — a gentle, **parent-facing** "Today with `<child>`: N new words · N
  phrases" at session-end (game done + wind-down). Per-child daily bucket, not a child score.
- **Mobile-first PWA** — phone-width column, safe-area aware, add-to-home-screen, auto-updating
  service worker, `prefers-reduced-motion`, screen wake-lock so the device won't sleep mid-play.

### ✅ Done recently (2026-08)
- **SLP Phase 2 complete (A/B/C/D).** **A** — a **Social / core-communication** Word-Practice page
  (16 words) + a per-word **`fn`** function-word tag. **B** — lint **Rule C** (function-word coverage).
  **C** — **Every Day with Pip**: 5 guided routine scenes (Mealtime/Bedtime/Getting dressed/Bath/Park;
  `src/data/routines.js` + `RoutineScreen.jsx`), tap-along + no-fail generous auto-advance, verb
  animations, fully voiced, with a variable "wash your ___" step. **D** — **"This week with Pip"**
  weekly parent narrative (new local `progress.week` rolling-7-day signal; `weeklyFavWorld()`).
- **Premium image re-render — 100% of representational static art** (soft cel-shading; `gen-symbols.mjs`
  STYLE) with **multi-ethnic** characters (auto skin-tone rotation + diverse family; Home-Village
  Mommy/Daddy + Bath reuse those images). Counting Mountain uses premium **number cards 1–20**. Colour
  swatches + number cards stay flat by design; **animation frames left as-is** (pilot = marginal payoff).
  Image cache bumped `tv-images-v2`→`v3`.
- **Performance:** screens **`React.lazy` code-split** + Supabase **lazy-loaded** → initial JS **~52%**
  smaller (~148→~71 KB gzip).
- **Regression-guard suite** (in `npm run check` / `verify:ui`): **css-scope**, **audio-coverage**,
  **asset-integrity**, **settings-sync**, **bundle-size** — each caught a real latent bug. The
  game-prompt (4×) and spoken-phrase-set (2×) mirrors were consolidated into `src/data/gamePrompt.js`
  + `src/data/spokenPhrases.js`.
- **Fixes:** refresh **stays on the current screen** (per-tab nav); real **cartoon baby-cry** on the
  Crying verb (`fx/cry.mp3`); Bedtime **"hug your bunny"** animation; §1.4 Phrase-Builder natural audio.

### ✅ Done recently (2026-07)
- **"Things I Do" action animations — 28 verbs** (§7b): every verb now MOVES on the Learning stage.
  Same our-own key-pose idea as the songs but with **no audio to sync** — a calm 2-frame flip-book
  loop (`components/ActionAnimation.jsx`, config `src/data/actionAnimations.js`). Adds a **girl**
  character (`act-girl-ready`) beside the boy; solo verbs split boy/girl, social ones (hug/dance/
  laugh/play/peekaboo) show **both**. Frames via `scripts/gen-action-poses.mjs`; 14 new verbs (140
  items). Under reduced-motion the loop plays gently (≥1s) — it must NOT freeze. Guarded by the
  **UI regression suite** `npm run verify:ui` (`verify-suite.mjs` builds → `vite preview` → checks;
  `verify-actions.mjs` tests a device × reduced-motion matrix).
- **Song animations — all 13 songs, config-driven** (§6): our-own key-pose frames that act out
  each song + a karaoke caption; per-song data in `src/data/songAnimations.js`, rendered by
  `SongAnimation.jsx`, poses via `scripts/gen-song-poses.mjs --song <name>`. **Song trims** (§7) done.
- **CI/infra**: Pages actions bumped off deprecated Node 20; **Supabase keep-alive** ping every
  3 days (`.github/workflows/supabase-ping.yml`) so the free-tier project doesn't pause.

### 🚧 Backlog (see `docs/LEFT_TO_DO.md` for the numbered, status-tracked list)
- **Real animal FX recordings + duck-quack fix** (§4) — Snake/Owl/Wolf/Goose/Crow + duck; real CC
  `fx/<key>.mp3` clips need ear-auditioning (keys pre-wired).
- **Song-animation polish** (§6) — ear-pass the newer songs' timing; confirm "The Happy Song" lyrics.
- **Part C billing** (Stripe + privacy policy) — after pilot feedback sets a price.
- Future: on-demand per-name TTS (§14), Supabase offline-merge (§13), Music Forest build-out.

### 🗂️ Code map
```
src/
├── data/content.js        # 7 worlds / 140 items (say text, IPA, ladder phrases, PRAISE)
├── data/phraseContent.js  # speech-therapy vocab (221 words / tiers / categories) + phrase banks
├── data/songs.js          # "Sing with Pip" catalog (13 PD songs; tag / grad / animated flag)
├── data/songAnimations.js # per-song animation configs (poses / lyrics / cue seq / timing) → build()
├── data/actionAnimations.js # "Things I Do" verb loops (keyed by item.sound) → ActionAnimation.jsx
├── lib/audio.js           # warm voice-clip playback (sayWord/voice/voiceSeq/playItem) + chime/celebration
├── lib/images.js          # local-WebP-first resolver (→ Unsplash/Pexels/Wikimedia) + cache
├── lib/                   # tts.js (dormant premium hook) · today.js · screentime.js · useWakeLock.js
├── store.js               # Zustand: router, profiles, progress, stage, gate, screen-time
├── components/            # WordPic, TactileStage, ItemVisual, Ladder, Mascot(Pip), Confetti, ChoiceGame,
│                          # SongAnimation, ActionAnimation, Onboarding, InstallHint, UpdatePrompt, ParentGate, ErrorBoundary
└── screens/               # ProfilePicker, Home, Learning, Today, Collection, Parent, SoundGame,
                           # TwinMode, Phonics, Phrase, Grid (Word Board), Song (Sing with Pip), Chant, Rest
public/
├── images/<key>.webp      # bundled illustrations + generated AAC symbols + song-<pose> + act-<pose> frames
└── sounds/<voice>/<key>.mp3 · sounds/phrases/<slug>.mp3 · sounds/fx/<key>.mp3 · sounds/songs/<id>.mp3 (+ CREDITS.md)
scripts/                   # gen-tts-gcloud · gen-symbols · gen-song-poses · trim-songs · optimize-images · verify-* · check-content
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
