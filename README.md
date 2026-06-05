# TinyVoice Twins 🦁

A sound-first, **mobile-first** early-language app for toddlers — built for
**Audrey & Adriel**. This is the runnable MVP, implementing the v4 Masterplan's
"living worlds" on top of the v3 design system.

> Full product vision lives in [`docs/`](./docs) (blueprint, wireframes, the
> 155-word content database, real-assets guide, and the v4 masterplan).

## What's in the MVP

- **5 living worlds** (v4): 🏠 Home Village · 🦁 Safari Island · 🎨 Rainbow Island ·
  🔢 Counting Mountain · 🎵 Music Forest
- **Learning screen** for every item: big visual, the word, IPA phonetics, a
  warm teaching script, and a large **tap-to-play sound** button
- **v4 Language Ladder** — each item shows 2-word and 3-word "say it together"
  phrases (Stage D → E) to push from single words toward sentences
- **Mobile-first & installable**: phone-width layout, safe-area aware, PWA
  manifest (add to home screen), `prefers-reduced-motion` respected, 64px+ touch targets
- **Design tokens** lifted straight from the blueprint (colors, type, spacing, motion)

## Run it

```bash
npm install
npm run dev      # open the printed Local/Network URL on your phone or tablet
```

Build & preview a production bundle:

```bash
npm run build
npm run preview
```

## Visuals & sounds (honest status)

- **Visuals are emoji-first** — reliable, offline, and on-brand with the
  wireframes. Each item also has an optional `image` field + `imageQuery`, so
  real Unsplash/Pexels photos can be dropped in later (`src/data/content.js`)
  without touching components.
- **Sounds**: the app looks for a real recording at `public/sounds/<key>.mp3`
  and plays a gentle UI tone if none is present yet (it never fakes an animal
  sound). See [`public/sounds/README.md`](./public/sounds/README.md) and
  `docs/TinyVoice_RealAssetsGuide.md` for the sourcing workflow.

## Tech

React 18 · Vite · Zustand · CSS animations · HTML5 Audio + Web Audio fallback.
Kept dependency-light on purpose so it builds and runs fast.

## Project structure

```
src/
├── data/content.js      # 5 worlds + items (IPA, scripts, ladder phrases)
├── lib/audio.js         # real-file-first audio with tone fallback
├── store.js             # Zustand: screen router + position
├── screens/
│   ├── HomeScreen.*      # the 5 living-world cards
│   └── LearningScreen.*  # the core learn experience
└── styles/tokens.css     # design system (from the blueprint)
```

## Not yet built (next candidates)

Sound Game (listen → tap → celebrate), Twin Mode (named turn-taking),
Parent Dashboard, real photo/sound assets, auto-play world mode.
