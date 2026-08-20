# TinyVoice Twins — capabilities, recent changes & the premium re-imaging

*High-level summary for stakeholders / pilot partners. As of 2026-08 · live on
GitHub Pages (free demo) + Vercel (primary, optional cloud).*

---

## 1. What it is (in one breath)

A **sound-first, mobile-first early-language app for toddlers** — real illustrations,
a warm human voice, and real animal sounds, with **no scores, ads, or pressure**.
Built for first words and late talkers, usable as speech-therapy homework. Installs
as a PWA and works offline once loaded. React + Vite + Zustand.

---

## 2. Capabilities at a glance

- **7 living worlds, 140 words** — My Body · Things I Do · Home Village · Safari Island
  (26 animals) · Rainbow Island · Counting Mountain (1–20) · Music Forest.
- **Learning screen** — illustration + word + a big "hear it" button in a warm voice,
  plus a **Language Ladder** (single word → 2- and 3-word phrases). Verbs animate.
- **Listening Game & Twin Mode** — "Where's the …?" with the **real recorded sound**;
  correct taps earn warm **labelled praise**; wrong taps are **errorless** (help
  escalates, never a fail). Twin Mode does gentle turn-taking + a shared finale.
- **Word Practice / Phrase Builder** — per-child stage; telegraphic cubes on screen
  while the audio speaks the **natural sentence**.
- **Word Board (AAC)** — a real communication board with **stable symbol positions**
  (fixed Core page + category pages, 4-col grid, message strip) + a "Find" focus mode.
- **Every Day with Pip** — calm **routine scenes** (Mealtime · Bedtime · Getting
  dressed · Bath · Park) that model connected everyday language, no-fail tap-along.
- **Letter Sounds** (phonics) · **Sing with Pip** (13 public-domain songs, real
  transport player + karaoke caption) · **Today with Pip** (adaptive session) ·
  **Collection** · **Rest / screen-time**.
- **Speaks children by name** — 200 common US names baked in a warm voice; any other
  name uses on-demand synthesis when configured (see §3).
- **Multi-child profiles** — generic, **renamable** children; per-child progress,
  stage, voice, screen-time, bedtime, focus words & songs — all on the device.
- **Parent dashboard** — gentle weekly narrative ("This week Ava loved Safari
  Island"), voice / wait-time / focus-word settings, a one-tap **feedback** link, and
  **optional** cloud sign-in (Supabase magic link) to back up & sync + a 30-day trial.
- **Fast, safe, offline** — code-split screens, small initial JS, `prefers-reduced-
  motion` respected, no data sold, no device/robotic voice ever.

---

## 3. Recent changes (this development cycle)

**Speech & language (SLP pass)**
- Natural, grammatical audio — contractions + progressive aspect ("The dog's
  running"), referent-correct pronouns, natural game prompts, **labelled praise**,
  **errorless retry** ladder. A **content language linter** guards it in CI.
- **Phrase Builder** — telegraphic cubes, natural spoken sentence underneath.
- Games play the **real animal sound**, not spelled-out onomatopoeia.

**New surfaces & features**
- **Every Day with Pip** routines (Mealtime/Bedtime/Dressed/Bath/Park), incl. a
  redesigned Bath with a random "wash your ___" step.
- **Word Board (AAC)** redesign — stable positions, full vocab fill-out.
- **Social / core-communication** vocabulary + function-word tags.
- **"This week with Pip"** weekly parent narrative.
- **Baby-cry** — real cartoon child-cry FX on the "Crying" verb.
- **Speak children by name** — 200-name catalog (100 boys + 100 girls) voiced ×3
  voices (**600 clips**); long-tail names fall to a premium runtime voice when
  configured, else a graceful cue (never a chime). *(A serverless voice-matched
  option for the full long tail is scoped in `docs/NAME_TTS_ONDEMAND.md`.)*

**Performance**
- **Code-split every screen** + lazy-load Supabase → **~52% smaller initial JS**
  (~148 → ~71 KB gzip) for slow devices.

**Reliability — a silent-failure guard suite** (runs in `npm run check` / `verify:ui`)
- css-scope, audio-coverage, asset-integrity, settings-sync, bundle-size, nav-restore,
  routines — most caught a real latent bug. Prompts/phrases consolidated into **single
  source-of-truth modules** so mirrored copies can't drift.

*(Commit arc: `358b823` … `b1585bb` — SLP corrections → Phase 2 A/B/C/D → premium
re-render → perf → guards → name voices.)*

---

## 4. The premium image re-imaging (the big visual upgrade)

Every picture in the app was **re-rendered to a premium illustration style** —
warmer, more consistent, higher craft — replacing the earlier set.

- **Scope:** a **14-phase** sweep across all 7 worlds + Word Board + routines +
  number cards. The library now holds **451 committed WebP illustrations**.
- **Multi-ethnic by design:** character art deliberately spans **black / brown / white
  / asian** — an auto-diversify step rotates skin tones so children see themselves,
  not a uniformly white cast.
- **Reuse, not duplication:** a shared `imageKeyFor()` map points Word Board words at
  the world illustrations, so one premium re-render flows to **every** surface —
  ~86 shared images, **zero duplicates**. Premium **number cards 1–10** now drive
  Counting Mountain; premium Bath/Mama/Dada art is reused everywhere it appears.
- **Pipeline:** generated locally on the Google Cloud / Vertex image model
  (`scripts/gen-symbols.mjs`, premium style prompt, auto-retry on quota), optimized
  to WebP (`optimize-images.mjs`), committed. Service-worker image cache bumped
  (`tv-images-v3`, capacity 400 → 600) to force-purge stale art for every user.
- **Quality control:** each phase spot-checked for child-appropriateness (a couple of
  bad generations — e.g. an off-model body image — were caught and re-prompted before
  release). Bespoke **animation frames** were evaluated and deliberately left as-is
  (marginal payoff over the premium static art).

---

## 5. Where it runs / status

- **GitHub Pages** — free public demo. **Vercel** — primary surface with optional
  cloud (Supabase auth + Postgres + RLS) and a soft 30-day trial. Runs **fully local
  with no config**; cloud features simply hide when unset.
- Auto-deploys on every push to `main`. Content, styles, audio coverage, assets and
  bundle size are all gate-checked in CI before a build can ship.
