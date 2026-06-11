# CLAUDE.md — working notes for Claude Code

TinyVoice Twins — a **sound-first early-language app for toddlers** (React + Vite + Zustand,
mobile-first PWA). Live: https://felixcouma.github.io/Tiny-Language-App/

## Read these first
- **`CURRENT_SESSION.md`** — the latest "where things stand / what's pending" handoff. Update it before pushing.
- **`TINYVVOICE_PROJECT_CONTEXT.md`** — the comprehensive living reference (architecture, design system, workflow). Has an auto-updated commit block (don't hand-edit that block; resolve its merge conflicts by keeping either side).

## Commands
```bash
npm install && npm run dev    # local dev (vite, port 5173; LAN-exposed)
npm run build                 # prebuild runs `check`; emits dist/ + service worker
npm run check                 # content integrity (7 worlds / item shapes / counting / colours / game pool)
npm run preview               # serve the production build
```

## Architecture
- `src/store.js` — Zustand store: screen router, **profiles** (per-child progress in localStorage, incl. the no-twin **"Everyone"/guest** profile + AJ/AG twins), `stage` (first words / sentences), `progress` (`seen`/`lastSeen`/`byWorld`/`collected`), gate + screen-time state.
- `src/data/content.js` — 7 worlds / 102 items (`word`, `wiki`, `say`, `soundLabel`, `expand` ladder, `sound` key); also exports `PRAISE` (rotating correct-answer praise).
- `src/data/phraseContent.js` — speech-therapy vocab: 209 core words (frequency tiers / categories), `PHRASES` (2-/3-word banks), `imageKeyFor`/`WORD_ALIAS` (image reuse), readiness helpers.
- `src/lib/` — `audio.js` (playback order: chosen-voice clip → Aoede default clip → phrase clip → **soft chime; NEVER the device voice**; `voice()`/`voiceSeq()`/`sayWord()`/`playItem`), `images.js` (local WebP/png → Unsplash/Pexels → Wikimedia; cache key `tv_img_cache_v3`), `today.js` (adaptive session), `screentime.js` (per-child limit + quiet hours), `useWakeLock.js` (keep screen awake while open).
- `src/screens/` — ProfilePicker, Home, Learning, Today, Collection, Parent, SoundGame/TwinMode/Phonics (all via `ChoiceGame`), **Phrase** (Word Practice / Phrase Builder), **Grid** (Word Board AAC + "Find" word-focus mode), Chant, Rest.
- `src/components/` — WordPic (picture, or a bold coloured word-tile when no image), TactileStage, Ladder, Mascot (Pip), Confetti, CollectToast, Onboarding, InstallHint, UpdatePrompt, ParentGate, ErrorBoundary.
- `public/images/<key>.webp`, `public/sounds/<voice>/<key>.mp3` (per-voice item clips) + `public/sounds/phrases/<slug>.mp3` (Aoede phrase clips) + `public/sounds/fx/<key>.mp3` (real animal sounds).

## Conventions (golden rules)
- **No emoji, no synthetic placeholders** — real WebP illustrations + warm voice + real animal sounds.
- **No scores / streaks / pressure** — gentle collection + celebration only (reward curiosity).
- **Speech-first** — children HEAR every word in a warm pre-rendered voice (Aoede default · Leda · Sulafat). **No robotic device voice** — a missing clip plays a soft chime, so clip coverage must stay complete (e.g. letters A–Z, phonics prompts, praise all have clips).
- **Per-child** — progress, stage, screen-time, bedtime all live on the active profile.
- **Responsive** — phone design below 700px; widens for tablet/laptop. **Toddler-safe**, `prefers-reduced-motion` respected.
- Match the surrounding code style; keep changes lean.

## Asset-generation pipeline (run locally; outputs committed)
**Active path = Google Cloud / Vertex** on the project's $300 trial credit (the AI-Studio
`GEMINI_API_KEY` in `scripts/gemini.key.local` is depleted). Auth = a service-account key at
`scripts/gcloud-sa-key.json` (gitignored) via ADC. Full setup: **`docs/TTS_GCLOUD_SETUP.md`**.
Heavy libs are **not** in package.json — install `--no-save` (re-installing one prunes the
others, so reinstall the one you need right before running):
```bash
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/scripts/gcloud-sa-key.json"
export VERTEX_PROJECT="gen-lang-client-0993546173"

# Voice + phrase clips — Cloud TTS (returns MP3 directly; no lamejs/ffmpeg needed)
npm install google-auth-library --no-save
node scripts/gen-tts-gcloud.mjs                 # voice clips (3 voices); counting/family first
node scripts/gen-tts-gcloud.mjs --kind phrases  # phrase backlog (Aoede). flags: --only a,b --match number- --force

# Images — Vertex (gemini-2.5-flash-image). EXTRA_WORDS adds non-vocab targets (safari animals)
npm install @google/genai --no-save
EXTRA_WORDS=Snake node scripts/gen-symbols.mjs --only Snake --force
npm install sharp --no-save && node scripts/optimize-images.mjs --replace   # PNG → WebP, remove PNGs

node scripts/clean-orphan-clips.mjs --apply     # prune clips whose text changed (keeps PRAISE/letters/phonics)
node scripts/list-phrases.mjs                   # regenerate docs/PHRASES_REVIEW.md (SLP inventory)
```
The old AI-Studio scripts (`gen-audio.mjs`/`gen-phrases.mjs`/`gen-symbols.mjs` API-key mode) still
work if credits are ever restored. Animal-sound credits: `public/sounds/CREDITS.md`. **Never commit
`scripts/gcloud-sa-key.json` or `scripts/gemini.key.local`.**

## Gotchas
- **Service worker cache**: `registerType: 'autoUpdate'`; `/sounds/` + `/images/` use **StaleWhileRevalidate** with cache names `tv-sounds-v2` / `tv-images-v2` — so a re-recorded clip/image at the SAME url self-heals on the next play. If you ever need to force a global refresh, bump the `-v2` suffix in `vite.config.js`.
- **TTS via Vertex (Cloud TTS)**: Gemini-TTS has a **per-minute** quota — if a batch 429s, slow `PACE_MS` (1000–3500). The `input.prompt` (style) can bleed into the audio, so the generator sends **text only**. Detect a leaked/garbled clip by **oversized file** (a short clip ≥~65 KB has baked-in narration); regenerate just those with `--force`.
- **Deploy**: push to `main` → GitHub Action (`.github/workflows/deploy.yml`) builds + publishes to Pages. `dist/` is gitignored. Commit/push only when asked; this project deploys from `main`.
- Verify UI changes headlessly with Playwright + the dev server (screenshots + `0 console errors`).
- End commit messages with the Co-Authored-By trailer.
