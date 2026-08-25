# TinyVoice Twins

A **sound-first**, **mobile-first** early-language app for toddlers — warm spoken
words, real illustrations, and gentle play with no scores or pressure. Originally
built for twins, it now supports **any family** (one child, or two with Twin Mode).

**▶︎ Live:** https://felixcouma.github.io/Tiny-Language-App/ (free demo) ·
**App:** https://tiny-language-app.vercel.app (primary surface; optional cloud sync)

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/felixcouma/Tiny-Language-App?quickstart=1)

One-click cloud dev environment (Node 20, ports auto-forwarded). Rebuild & run from any
browser — see [`docs/CODESPACES.md`](./docs/CODESPACES.md).

> Current state lives in [`CURRENT_SESSION.md`](./CURRENT_SESSION.md); the full living
> reference is [`TINYVVOICE_PROJECT_CONTEXT.md`](./TINYVVOICE_PROJECT_CONTEXT.md).

## What's inside

- **7 living worlds** (140 items): My Body · Things I Do · Home Village · Safari Island
  (26 animals) · Rainbow Island (colours) · Counting Mountain (1–20) · Music Forest
- **Learning screen:** a real illustration + word + IPA + a big "hear it" button that
  **speaks the word** in a warm voice, plus a **Language Ladder** (2-word → 3-word phrases)
- **Animations:** "Things I Do" **verbs move** on the stage (calm key-pose loops) and all
  **13 songs animate** with a karaoke caption
- **Listening Game & Twin Mode:** play runs as **themed mini-scenes** — a session picks 2 of
  **13 scenes** (Old MacDonald's Farm · The Zoo · Snack Time · Fruits & Veggies · At the Park ·
  Head to Toes · 1-2-3! · Dance Party · Good Morning! · Bath Time · Bedtime · Things That Go ·
  Getting Dressed) so the four choices are always related, opened & closed by Pip. Targets are
  sampled fresh each play, the **active prompt shows on screen** ("Where's the cow?", matching the
  audio), and fx-animals play the **real recorded sound**. A correct tap gives **labelled praise**;
  wrong taps are **errorless** (repeat → narrow to two → model the answer — never a fail). Twin
  Mode does **turn-taking** + a shared "you did it together!" finale, and cheers each child **by name**
- **Word Practice / Phrase Builder:** per-child stage — tap words (incl. a **Social / core-
  communication** page: yes, no, more, please, all done…), or build 2-/3-word phrases; cubes stay
  telegraphic while the audio speaks the **natural sentence**
- **Word Board (AAC):** a real communication board with **stable symbol positions** — a fixed Core
  page + position-stable category pages, 4-column grid, message strip (CLEAR keeps the board), plus a
  separate **Find** word-focus mode
- **Every Day with Pip:** guided **routine scenes** (Mealtime · Bedtime · Getting dressed · Bath ·
  Park) that model connected language — Pip narrates, one calm tap-along per step, no-fail auto-advance,
  and verbs animate (a random "wash your ___" body part each bath)
- **Letter Sounds** (phonics) · **Sing with Pip** (13 public-domain songs, a real transport
  player) · **Today with Pip** (adaptive session) · **Collection** · **Rest / screen-time**
- **Multi-child profiles:** generic, **renamable** children; per-child progress, stage, voice,
  screen-time, bedtime, focus words & songs — all on the device. The app **speaks a child by name**
  in the warm voice — **200 common names** are baked in, and any other name uses the optional
  premium runtime voice (else a gentle "Your turn!", never a chime)
- **Parent Dashboard:** gentle insight + settings (voice, **Wait time**, songs, focus words) in a
  warm, colour-coded layout with collapsible panels (a Pip hero + a live "heard N words" line + a
  **"This week with Pip"** narrative naming the world each child loved most this week);
  **optional** cloud sign-in (Supabase magic link) to back up & sync + a 30-day soft-trial
- **Fast & installable:** screens are code-split and Supabase loads only on sign-in — small initial
  JS for slow devices; a static guard suite (`npm run check`) keeps styles, audio clips, assets and
  bundle size honest
- **No scores, no streaks, no pressure** — gentle collection & celebration only

## Speech-first (the mission)

Children **hear** every word and phrase in a **warm, pre-rendered human-style voice**
(Gemini-TTS, three voices: **Aoede** default · **Leda** · **Sulafat**, picked by a grown-up).
There is **no robotic device voice** — a missing clip falls back to a soft chime, never
text-to-speech. Animals also play **real recorded sounds** (`public/sounds/fx/<key>.mp3`).
Pictures are bundled **WebP illustrations** (`public/images/<key>.webp`); a missing picture
renders a bold coloured word-tile, never a broken image.

## Run locally

```bash
npm install
npm run dev       # open the printed Local/Network URL (Network = test on a phone)
npm run build     # prebuild runs `npm run check`; emits dist/ + service worker
npm run preview   # serve the production build
npm run check     # content integrity (worlds / item shapes / counting / colours / game pool)
npm run verify:ui # headless Playwright regression suite (builds, serves, asserts 0 console errors)
```

The app runs **fully local** with no configuration. To enable optional cloud accounts, copy
`.env.example` → `.env.local` and set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
(and `VITE_FEEDBACK_URL`). Without them, cloud features are simply hidden.

## Assets (illustrations & voice)

Illustrations and voice/phrase clips are **generated locally and committed** — see
[`CLAUDE.md`](./CLAUDE.md) and [`docs/TTS_GCLOUD_SETUP.md`](./docs/TTS_GCLOUD_SETUP.md).
Images use the Gemini/Vertex image model (`scripts/gen-symbols.mjs`); voice & phrase clips
use Google Cloud TTS (`scripts/gen-tts-gcloud.mjs`). Real animal-sound credits live in
[`public/sounds/CREDITS.md`](./public/sounds/CREDITS.md).

## Tech

React 18 · Vite · Zustand · plain CSS · `vite-plugin-pwa` (Workbox, StaleWhileRevalidate) ·
Web Audio · warm Gemini-TTS voice clips · optional Supabase (auth + Postgres + RLS).
Dependency-light on purpose, mobile-first, **PWA-installable**, `prefers-reduced-motion`
respected, screen wake-lock during play. Auto-deploys on every push to `main`
(GitHub Pages demo + Vercel).

## Cross-device

Work from any machine: `git pull origin main` → `npm install` → `npm run dev`.
See [`docs/CROSS_DEVICE_WORKFLOW.md`](./docs/CROSS_DEVICE_WORKFLOW.md).
