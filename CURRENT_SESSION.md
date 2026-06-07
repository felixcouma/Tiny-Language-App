# Current Session Tracking

> Update before commit/push so the next device/session knows where things stand.
> Full state: `TINYVVOICE_PROJECT_CONTEXT.md`.

## Last Session — 2026-06-07 · Branch `main` · Live: https://felixcouma.github.io/Tiny-Language-App/

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

### Next
- Finish remaining Leda/Sulafat clips (above).
- Optional: swap pig/chicken animal sounds (currently CC BY-SA) for non-SA if desired.
- Ladder **phrases** still use device voice (`voice()` in `LearningScreen`).
