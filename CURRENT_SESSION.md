# Current Session Tracking

> Update before commit/push so the next device/session knows where things stand.
> Full state: `TINYVVOICE_PROJECT_CONTEXT.md`.

## Last Session — 2026-06-08 · Branch `main` · Live: https://felixcouma.github.io/Tiny-Language-App/

### 🗣️ Speech-therapy practice — Levels 1 & 2 (built, verified, 0 console errors)
A therapist-aligned, progressive phrase-building tool for the twins (Adriel building
vocabulary, Audrey on phrases). Sound-first: tap a word/phrase → hear it in our warm
voice (device voice is the graceful fallback until clips are pre-rendered).
- **`src/data/phraseContent.js`** — the FULL `VOCABULARY_CORE_200_WORDS.md` set:
  **209 single words** across 3 frequency tiers / 19 categories (no dupes); `wordsForLevel`,
  `categoriesForLevel`; phrase banks `PHRASES` = **{2: 44 phrases, 3: 26 phrases}** (curated
  natural combos, every word in the bank); `PHRASE_SIZES`, `PHRASE_LEVELS` (L1/L2/L3 all
  active), `DEFAULT_PHRASE_LEVEL` (adriel 1 / audrey 2).
- **`src/screens/PhraseScreen.jsx` (+ .css)** — one screen, mode by `phraseLevel`:
  - **Level 1 — Word Practice**: category chips + big tap-to-hear word card + prev/next;
    auto-says each word on focus. Pool grows with level (Tier 1 → +2 → +3).
  - **Level 2/3 — Phrase Builder**: an in-screen **2-words ↔ 3-words toggle**; N tappable
    word cubes (blue/orange/green) with tap-flash + "+" separators, then a phrase box
    “hear them together” (celebration chime) + prev/next. Level 3 opens straight to 3-word.
- **Store**: per-child `phraseLevel` (1/2/3) with migration for existing installs;
  `setPhraseLevel`, `openPhrase`; progress now tracks `recordPracticeWord` (counts toward
  words-heard/mastery, no sticker toast) + `recordPhrase` (phrase → count).
- **Home**: new chunky button labelled by level (“Word Practice” / “Phrase Builder”).
- **Grid Vocabulary / Word Board** (`src/screens/GridScreen.jsx` + .css) — a
  therapist-style AAC board: 3×3 of tappable word cells (tap = hear + highlight),
  a per-cell **↻ refresh** that rotates in a fresh word once a child "gets" it,
  a **New words** shuffle, and a category filter. Reached from Home → **Word Board**
  (games row, paired with Letter Sounds). `store.openGrid`, screen `grid`.
- **Readiness progression** (`isPhraseReady`, `PHRASE_READY_AT = 25`) — once a child
  has heard 25+ distinct words, Word Practice shows a gentle "Ready for phrases? Try the
  Phrase Builder →" link, and the Parent Dashboard surfaces a "Move to Level 2" suggestion.
  **Never auto-switches** — the grown-up/therapist confirms. New children start in Word
  Practice; the twins keep their defaults (Adriel L1 / Audrey L2).
- **In-session mode switch** — Phrase Builder has "← Back to single words"; Word Practice
  can jump to phrases when ready. So **Everyone/guest** (and any profile) can reach every
  mode; the parent can also set Everyone's level directly in the dashboard.
- **Word Practice enriched** — Pip greeting bubble, a "starts with X" letter chip (taps to
  hear the letter), and a "✓ heard" badge once a word has been heard before.
- **Parent Dashboard**: “Speech practice level” picker (L1/L2/L3, all active), the
  readiness suggestion, and a "N different words · N phrases explored" line.
- **TTS pipeline**: the 209 words + 70 phrases are now wired into `scripts/gen-phrases.mjs`
  (prioritised first). Generated `go`/`eat` today; rest resume on the next free-quota reset.
- Stack note: the design docs mention Tailwind/Framer; this app uses plain CSS + tokens,
  so the screen matches the existing app style (chunky shadows, `.scene`, Icons.jsx, Pip).
- **Next for this feature**: pre-render the Level-1 words + the 16 phrases as Aoede clips
  (add them to `scripts/gen-phrases.mjs` pool) so they don't use the device voice; Level 3
  (3-word builder) + Grid Vocabulary mode are documented for later.


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

### 🎙️ TTS audio — PHRASES FIRST, then voice (free flash models only; NO paid Pro)
- Counts: **phrases 169/491**; voice **aoede 89/89 · leda 87/89 · sulafat 71/89**.
- Both free flash TTS models (`gemini-2.5-flash-preview-tts`, `gemini-3.1-flash-tts-preview`)
  hit their per-model ~100/day cap today. **Do not use `gemini-2.5-pro-preview-tts` (paid/pricier).**
  Credit: ~$5.35 balance at start of today; today's gen ≈ ~$2 (within budget).
- **Next reset — do PHRASES first, then the last voice clips.** Resumable (skip-existing); the
  scripts now stop promptly at the daily cap:
  ```bash
  K=$(tr -d '\r\n' < scripts/gemini.key.local)
  GEMINI_API_KEY=$K PACE_MS=6500 node scripts/gen-phrases.mjs                                   # phrases (priority)
  GEMINI_API_KEY=$K PACE_MS=6500 TTS_MODEL=gemini-3.1-flash-tts-preview node scripts/gen-phrases.mjs
  GEMINI_API_KEY=$K PACE_MS=6500 node scripts/gen-audio.mjs --voices leda,sulafat               # then voice (leda 2, sulafat 18)
  GEMINI_API_KEY=$K PACE_MS=6500 TTS_MODEL=gemini-3.1-flash-tts-preview node scripts/gen-audio.mjs --voices leda,sulafat
  ```
  ~322 phrases remain; ~180/day across both free models ≈ ~2 more days. Commit + push the new
  clips each day. The phrase system + per-voice→Aoede fallback are already shipped, so until all
  exist, untapped phrases fall back to the device voice (graceful, no silence).

### Next
- Finish remaining Leda/Sulafat clips + the 491 phrase clips (above).
- Optional: swap pig/chicken animal sounds (currently CC BY-SA) for non-SA if desired.
