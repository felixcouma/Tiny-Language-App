# Current Session Tracking

> Update before commit/push so the next device/session knows where things stand.
> Full state: `TINYVVOICE_PROJECT_CONTEXT.md`.

## Last Session — 2026-06-08 · Branch `main` · Live: https://felixcouma.github.io/Tiny-Language-App/

### ✨ Polish batch — 5 more (all shipped, verified, 0 console errors)
8. **Error boundary** — friendly "Oops, start again" instead of a white screen.
9. **Real install assets** — PNG icons (192/512/maskable) + apple-touch-icon
   rasterized from the SVG; manifest + index.html; dismissible Add-to-Home hint.
   (Installs cleanly on iOS/Android now.)
10. **First-run onboarding** — 3 gentle Pip steps, once per device (`tv_onboarded`).
11. **New-friend celebration** — sticker toast + Pip + chime on first collect.
12. **Per-child screen-time + quiet hours** — limit & bedtime live on each profile;
    wind-down per active child; "a little more" snoozes 10 min.

Also merged in (parallel work): **WebP illustrations** (52 MB → 0.8 MB, cache key
v3, webp-first), plus review fixes (game accuracy, Twin 3-col, chant no-inflate).

### 🚀 MVP feature batch — 7 features (all shipped, each verified, 0 console errors)
1. **Child profiles + stage** — "Who's playing?" launcher, per-child progress
   (migrates old data), First-words/Little-sentences level (`store.js`).
2. **Adaptive "Today with Pip"** — daily session mixing new + spaced-repetition
   review, stage-sized (`lib/today.js`, `TodayScreen`).
3. **Tactile cards** — tap → bounce + sparkle burst (`TactileStage`).
4. **Collection / sticker book** — every word heard becomes a collectible friend
   (`CollectionScreen`); ★ on Home.
5. **Parent zone** — sum gate, daily screen-time + calm "rest" wind-down with a
   gated "a little more", richer insight (words mastered / to discover).
6. **Sing-along** — rhythmic chant per world reusing word clips + sounds (`ChantScreen`).
7. **Offline PWA** (`vite-plugin-pwa` SW: precache shell, lazy-cache images/audio)
   **+ phonics** ("Letter Sounds" game + first-letter chip on cards).

New deps: `vite-plugin-pwa` (dev). Spaced repetition uses `progress.lastSeen`;
sticker book uses `progress.collected`; mastery = heard ≥ 4×.

### Built — real illustrations, warm spoken voice, and real animal sounds
- **53 cartoon illustrations** (`public/images/<key>.png`) via nano-banana (Gemini image).
  The app (`src/lib/images.js → fromLocal`) prefers these over Wikimedia. **My Body (13)**
  redesigned to one consistent toddler character.
- **Image fixes:** bumped cache key to `tv_img_cache_v2` (so returning visitors drop the old
  Wikimedia cache); `fromLocal` now requires an `image/*` content-type (the Vite dev server &
  SPA hosts answer 200+index.html for missing paths, which previously broke bundled images).
- **Storybook voices** (Gemini TTS) at `public/sounds/<voice>/<key>.mp3`; parent picks
  Aoede (default) / Leda / Sulafat in the Parent Dashboard. `audio.js` plays the chosen voice,
  graceful device-voice fallback.
- **Real animal sounds** — say the word, then play the recorded sound **4× in a coherent flow**.
  Voice-independent `public/sounds/fx/<key>.mp3` (16 animals), trimmed/normalized, baked repeat,
  iOS-safe MP3. Sources: Adobe (11) + Wikimedia CC (5); attribution in `public/sounds/CREDITS.md`.
  fish/rabbit/butterfly/turtle stay word-only (silent animals).

### Asset tooling (`scripts/`)
- `gen-images.mjs` (image batch), `gen-audio.mjs` (multi-voice TTS → MP3, resumable, retries
  transient empties). FX build + free-CC fetch + credits scripts live in `.verify-shots/`
  (gitignored, sources are local). One-time deps:
  `npm install @google/genai @breezystack/lamejs ffmpeg-static --no-save`.

### ⚠️ Voice clips — Aoede DONE, finish Leda/Sulafat next day (free)
- Counts: **aoede 89/89 ✓ · leda 76/89 · sulafat 61/89.** Both flash TTS models are at their
  per-model 100/day cap today.
- After the daily reset, run (resumable, fills only missing):
  ```bash
  GEMINI_API_KEY=… PACE_MS=6500 node scripts/gen-audio.mjs
  GEMINI_API_KEY=… PACE_MS=6500 TTS_MODEL=gemini-3.1-flash-tts-preview node scripts/gen-audio.mjs
  ```
  Remaining — leda: dog,cat,duck,pig,color-orange,color-purple,number-3/5/7/10/12/14/16.
  sulafat: do-brushing, home family words, cow,duck,pig,horse,chicken,bird,fish,lion, most colours,
  number-1/2/4/5/6. App works now (warm voice where present, device voice for the rest).

### 🎙️ Device voice → our voice everywhere (in progress)
- Code shipped: items fall back to the **default (Aoede)** voice when the chosen voice lacks a
  clip (no device voice for words); the **device voice picker was removed**; dynamic text
  (`voice()`/`voiceSeq()`) plays pre-rendered **phrase clips** in our voice, with the device
  engine only as a dormant fallback until coverage is complete.
- **491 phrase clips** to generate into `public/sounds/phrases/<slug>.mp3` (slug must match
  `src/lib/audio.js`): ladder/expand phrases + game/twin prompts + "Yes!/Try again" + twin names
  + finish line. Quota-limited per model/day — run repeatedly until done:
  ```bash
  GEMINI_API_KEY=… PACE_MS=6500 node scripts/gen-phrases.mjs
  GEMINI_API_KEY=… PACE_MS=6500 TTS_MODEL=gemini-3.1-flash-tts-preview node scripts/gen-phrases.mjs
  ```
  Until all 491 exist, untapped phrases still use the device voice (graceful, no silence).

### Next
- Finish remaining Leda/Sulafat clips + the 491 phrase clips (above).
- Optional: swap pig/chicken animal sounds (currently CC BY-SA) for non-SA if desired.
