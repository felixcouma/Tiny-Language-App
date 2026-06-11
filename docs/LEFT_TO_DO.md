# Left To Do

> Tracked backlog of things deliberately deferred (mostly blocked on credits/quota).
> When ready, do the steps below and commit.

## 1. Remaining vocabulary images (18) — only these still need nano
Reduced 25 → 18 for FREE first:
- **Numbers 1–10**: generated locally as coloured digit+dot cards (`scripts/gen-numbers.mjs`,
  uses sharp — no API). Re-run anytime: `node scripts/gen-numbers.mjs`.
- **Reused from the bank** (alias in `imageKeyFor`): Bunny→rabbit, Day→sun, Night→moon,
  Morning/Afternoon→sun. Add more aliases in `WORD_ALIAS` (src/data/phraseContent.js) when a
  comparable image already exists — gen-symbols then skips them automatically.

Words without a picture render as a **bold coloured word tile that fills the cell**
(via `components/WordPic.jsx`) — consistent and readable.
- **Concrete objects (12)** — ✅ DONE (2026-06-10, via Vertex AI on the GCP credit): `Plane,
  Boat, Bike, Motorcycle, Helicopter, Mouse, Pencil, Paper, Crayon, Scissors, Glue, Shape`.
  All 12 verified loading in-app. `gen-symbols.mjs` now supports Vertex (`VERTEX_PROJECT` +
  `GOOGLE_APPLICATION_CREDENTIALS`) — see `docs/TTS_GCLOUD_SETUP.md` for the auth.
- **Abstract (6)** — ✅ DECIDED: leave as text permanently (no image): `Want, Where, Today,
  Now, When, After`

**When Gemini credits are topped up** (≈ $0.50 for the 12 concrete words; was blocked with
"prepayment credits are depleted"), run — resumable, skips everything already present:
```bash
K=$(tr -d '\r\n' < scripts/gemini.key.local)
GEMINI_API_KEY=$K node scripts/gen-symbols.mjs        # only the missing ones
node scripts/optimize-images.mjs --replace            # PNG -> WebP, remove PNGs
git add public/images/*.webp && git commit && git push
```

> **OPPORTUNITY (2026-06-10):** the project now has a **$300 Google Cloud credit** (the same one
> used for the audio). The nano-banana image model is also reachable through **Vertex AI** on
> that project, so the 12 concrete images could be unblocked *now* without restoring AI-Studio
> credits — by adapting `gen-symbols.mjs` to the Vertex image endpoint + the service-account
> auth from `docs/TTS_GCLOUD_SETUP.md` (Vertex needs the `aiplatform.googleapis.com` API,
> already enabled). ~$0.50 of the credit. Not yet done.

## 1b / 2. Warm-voice audio — ✅ COMPLETE (2026-06-10, via Google Cloud TTS)
AI Studio prepayment credits were depleted, so the whole backlog was generated through
**Google Cloud TTS** instead (same Aoede/Leda/Sulafat Gemini-TTS voices, separate billing on
the project's $300 trial). All clips verified playing in-app (Playwright). Done:
- **All 3 voices 89/89** · **counting `number-1..20` 20/20** + **family re-records 4/4**
  (correct text + slower count-along pace) · **phrases 773** (orphans pruned).
- Tooling: `scripts/gen-tts-gcloud.mjs` (ADC auth, `--kind phrases`, counting/family priority),
  `docs/TTS_GCLOUD_SETUP.md`, `scripts/clean-orphan-clips.mjs`. The old AI-Studio scripts
  (`gen-audio.mjs`/`gen-phrases.mjs`) still work if credits are ever restored.
- The 8am cloud reminder routine is now **disabled** (backlog cleared).

## 3. Full per-voice switching — ✅ COMPLETE (2026-06-11)
`voice()` is voice-aware (`sounds/<storyVoice>/phrases/<slug>.mp3` → Aoede `sounds/phrases/`
→ chime) and `gen-tts-gcloud.mjs` writes per-voice phrase folders. **All three voices now have
full phrase coverage: Aoede 899 · Leda 899 · Sulafat 899** (generated via Google Cloud TTS,
self-paced through the Vertex per-minute quota; the runs were killed externally a few times and
resumed — the generator skips clips already on disk). The voice toggle in the Parent view now
switches *every* spoken line to the chosen voice. Committed `public/sounds/leda` + `sulafat`.

## 3b. ABC Songs audio — ✅ COMPLETE (2026-06-11)
The **Alphabet Friends** feature is built and live, and the **26 warm letter-song clips** are now
generated (Aoede, `public/sounds/abc-songs/<a..z>.mp3`) — tapping a letter plays its letter-song
instead of a chime. The 16 letter-word pictures were also added earlier (commit `8e4f04f`), so
every letter shows a real WebP picture. Regenerate anytime with
`node scripts/gen-tts-gcloud.mjs --kind abc-songs`.

## 4. Animal sound effects (new safari animals + duck) — needs ear-verification
The 5 new animals (Snake/Owl/Wolf/Goose/Crow) ship with images + warm spoken sound-labels
("Listen… hiss!"), but have **no real FX recording** yet, and the **duck quack still sounds like
a chick**. Real animal sounds aren't TTS — they're CC audio that must be auditioned (Claude can't
hear). Source CC0/CC-BY clips (Wikimedia Commons / freesound), trim to ~1–2s, and drop at
`public/sounds/fx/<key>.mp3`, credited in `public/sounds/CREDITS.md`. The keys
(snake/owl/wolf/goose/crow) are **already wired** into `FX_KEYS` (`src/lib/audio.js`) — a missing
file just 404s harmlessly, so dropping the real files in is all that's needed. Also replace the
`public/sounds/fx/duck.mp3` quack.

## 5. Optional / future
- **Music Forest** build-out (richer sound-play + phonics) — wanted once its clips exist.
- **Grid Vocabulary**: could grow the board size / add a "mastered → retire word" mode.
