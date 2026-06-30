# TinyVoice Twins

A sound-first, **mobile-first** early-language app for toddlers — built for
**Audrey & Adriel**. Real photographs, spoken words, playful games. Blends the
v3 design system with the v4 learning framework.

**▶︎ Live:** https://felixcouma.github.io/Tiny-Language-App/ (open on any phone/tablet/laptop)

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/felixcouma/Tiny-Language-App?quickstart=1)

One-click cloud dev environment (Node 20, ports auto-forwarded). Rebuild & run from any
browser — see [`docs/CODESPACES.md`](./docs/CODESPACES.md).

> Full product vision lives in [`docs/`](./docs); current state in
> [`TINYVVOICE_PROJECT_CONTEXT.md`](./TINYVVOICE_PROJECT_CONTEXT.md).

## What's inside

- **7 living worlds:** My Body · Things I Do · Home Village · Safari Island ·
  Rainbow Island · Counting Mountain · Music Forest
- **Learning screen:** real photo + word + IPA + a big "hear it" button that
  **speaks the word**, plus v4 **Language Ladder** chips (2-word → 3-word phrases)
- **Listening Game:** listen → tap the right photo → confetti; wrong taps gently
  wobble (no penalty)
- **Twin Mode:** turn-taking that names Audrey & Adriel
- **Parent Dashboard:** gentle, local-only insight (no scores or pressure)
- **No emoji** — real photographs throughout, with clean fallbacks

## Run locally

```bash
npm install
npm run dev      # open the printed Local/Network URL (Network = test on a phone)
npm run build && npm run preview   # production check
```

## Photos & sound (how it works)

- **Photos** load at runtime from **Wikimedia** (free, no key). For curated,
  hand-picked photos app-wide, copy `.env.example` → `.env` and add a free
  **Unsplash** or **Pexels** key. Any single image can be overridden by setting
  `image: '<url>'` on that item in `src/data/content.js`.
- **Sound** uses the browser's **speech engine** to say words & phrases (perfect
  for speech development). To use real recorded animal sounds instead, drop
  `public/sounds/<key>.mp3` files in (see `public/sounds/README.md`); they
  automatically override speech.

## Tech

React 18 · Vite · Zustand · Web Speech API · Web Audio · CSS animations.
Dependency-light on purpose, mobile-first, PWA-installable, auto-deployed to
GitHub Pages on every push to `main`.

## Cross-device

Work from any machine: `git pull origin main` → `npm install` → `npm run dev`.
See [`docs/CROSS_DEVICE_WORKFLOW.md`](./docs/CROSS_DEVICE_WORKFLOW.md).
