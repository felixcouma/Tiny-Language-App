# Current Session Tracking

> Update before commit/push so the next device/session knows where things stand.
> Full state: `TINYVVOICE_PROJECT_CONTEXT.md`.

## Last Session — 2026-06-05 · Branch `main` · Live: https://felixcouma.github.io/Tiny-Language-App/

### Built this session — real illustrations + warm spoken voice
- **53 cartoon illustrations** generated with nano-banana (Gemini image model) into
  `public/images/<key>.png`. The app (`src/lib/images.js → fromLocal`) already prefers these
  over Wikimedia. One cohesive flat-vector, thick-outline, pastel toddler style.
- **My Body (13)** redesigned to one **consistent toddler character** with per-part framing +
  a highlight halo. `body-ears` and `body-teeth` are on-model but the part is a little small —
  refine later if wanted.
- **Kid-friendly spoken audio** pre-baked with **Gemini TTS** into
  `public/sounds/<voice>/<key>.mp3` (MP3 ~40 KB each). The parent picks the **Storybook voice**
  (Aoede = default / Leda / Sulafat) in the Parent Dashboard.
- `src/lib/audio.js`: per-voice bundled playback + `tv_story_voice` preference; `playItem` plays
  `sounds/<voice>/<key>.mp3` and falls back to the device voice when a clip is missing.

### Asset-generation tooling (`scripts/`)
- `gen-images.mjs` — batch image generator (cheap model `gemini-2.5-flash-image`;
  `--only a,b` / `--match body-` / `--force`; skips existing).
- `gen-audio.mjs` — batch TTS, multi-voice MP3 via `@breezystack/lamejs`; `PACE_MS` pacing,
  `TTS_MODEL` override, `--voices`, skip-existing/resumable.
- One-time deps: `npm install @google/genai @breezystack/lamejs --no-save`
- Key from env `GEMINI_API_KEY` (also `scripts/gemini.key.local`, gitignored).

### ⚠️ Audio is INCOMPLETE — finish tomorrow (free)
- Gemini TTS has a **per-model 100 requests/day** cap (Tier-1). Today's quota is used up.
- Current: **aoede 67/89 · leda 31/89 · sulafat 14/89** (all existing clips are valid).
- After the daily reset (~midnight Pacific), finish with the resumable script:
  ```bash
  GEMINI_API_KEY=... node scripts/gen-audio.mjs        # fills only the missing clips
  # if a model caps again, switch bucket:
  GEMINI_API_KEY=... TTS_MODEL=gemini-3.1-flash-tts-preview node scripts/gen-audio.mjs
  ```
- App works now: warm voice where clips exist, device voice elsewhere (graceful).

### Next
- Finish the remaining audio clips (above).
- Optionally refine `body-ears` / `body-teeth` images.
- Ladder **phrases** still use the device voice (`voice()` in `LearningScreen`); a future
  ElevenLabs/live-TTS layer could read those warmly too.
