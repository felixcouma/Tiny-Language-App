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
- `src/data/content.js` — 7 worlds / 97 items (`word`, `wiki`, `say`, `soundLabel`, `expand` ladder, `sound` key).
- `src/lib/` — `audio.js` (playback: bundled voice clip → default voice → phrase clip → device fallback; `voice()`/`voiceSeq()`; `playItem`), `images.js` (resolve order: local WebP/png → Unsplash/Pexels → Wikimedia; cache key `tv_img_cache_v3`), `today.js` (adaptive session), `screentime.js` (per-child limit + quiet hours).
- `src/screens/` — ProfilePicker, Home, Learning, Today, Collection, Parent, SoundGame/TwinMode/Phonics (all via `ChoiceGame`), Chant, Rest.
- `src/components/` — TactileStage, Ladder, Mascot (Pip), Confetti, CollectToast, Onboarding, InstallHint, UpdatePrompt, ParentGate, ErrorBoundary.
- `public/images/<key>.webp`, `public/sounds/<voice>/<key>.mp3` + `public/sounds/fx/<key>.mp3` (animal sounds), `public/sounds/phrases/<slug>.mp3`.

## Conventions (golden rules)
- **No emoji, no synthetic placeholders** — real WebP illustrations + warm voice + real animal sounds.
- **No scores / streaks / pressure** — gentle collection + celebration only (reward curiosity).
- **Speech-first** — children HEAR every word; warm voice (Aoede default), device voice only as a dwindling fallback.
- **Per-child** — progress, stage, screen-time, bedtime all live on the active profile.
- **Responsive** — phone design below 700px; widens for tablet/laptop. **Toddler-safe**, `prefers-reduced-motion` respected.
- Match the surrounding code style; keep changes lean.

## Asset-generation pipeline (run locally; outputs committed)
Heavy libs are **not** in package.json — install `--no-save` when needed (re-installing one prunes the others, so install together):
```bash
npm install @google/genai @breezystack/lamejs ffmpeg-static playwright --no-save
GEMINI_API_KEY=… PACE_MS=6500 node scripts/gen-images.mjs    # nano-banana images (model gemini-2.5-flash-image)
GEMINI_API_KEY=… PACE_MS=6500 node scripts/gen-audio.mjs     # Gemini TTS voice clips (multi-voice MP3)
GEMINI_API_KEY=… PACE_MS=6500 node scripts/gen-phrases.mjs   # phrase clips (slug must match src/lib/audio.js)
node scripts/optimize-images.mjs                              # PNG → WebP (needs sharp)
```
Key: `GEMINI_API_KEY` env or `scripts/gemini.key.local` (gitignored). Animal-sound credits: `public/sounds/CREDITS.md`.

## Gotchas
- **Service worker cache**: SW is `registerType: 'prompt'`; after a deploy users get a "new version ready" toast (`UpdatePrompt`). Testing in the browser may need a hard refresh / unregister SW.
- **TTS daily cap**: ~100 requests/day **per model** (Tier-1). Voice + phrase clips are still being filled over multiple days; switch `TTS_MODEL=gemini-3.1-flash-tts-preview` for a second daily bucket. Until complete, ungenerated dynamic phrases fall back to the device voice.
- **Deploy**: push to `main` → GitHub Action (`.github/workflows/deploy.yml`) builds + publishes to Pages. `dist/` is gitignored. Commit/push only when asked; this project deploys from `main`.
- Verify UI changes headlessly with Playwright + the dev server (screenshots + `0 console errors`).
- End commit messages with the Co-Authored-By trailer.
