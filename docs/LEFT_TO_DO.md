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

## 6. Song animations — ✅ ROLLED OUT to all 13 songs, config-driven (2026-07-10)
Every song now animates. `SongAnimation.jsx` reads per-song data from
**`src/data/songAnimations.js`** (poses / lyric lines / cue `seq` / timing); `build()` has an
optional per-cue **`extra`** pause for a single phrase boundary. Each animated song is ONE
consistent character/subject acting out its lyrics — the **base pose is drawn fresh, action poses
are anchored on it** for consistency, via the now **multi-song** `scripts/gen-song-poses.mjs
--song <name>` (→ `optimize-images.mjs --replace` → `song-<key>.webp`, 10–38 KB).

**Adding/redoing a song:** add an entry to `SONGS` in `gen-song-poses.mjs` (base pose `anchor:null`
first) → generate + optimize → add a config in `songAnimations.js` → set `animated:true` in
`songs.js` → `scripts/verify-song-anims.mjs` + on-device check. Full design in
`docs/SONG_ANIMATIONS_SCOPE.md`.

Notable: **teapot is an orange teapot CHARACTER** (was a child role-play); **Bingo models the clap
game** (each verse drops a leading letter for a clap, CC shows the letters); Alphabet/Sleeping/Hush/
River use themed characters; One-Two-Buckle/Hokey/Happy **reuse the Head/Shoulders child**.

**Remaining (optional polish):** ear-pass the newer songs' timing (Head/Shoulders + Bingo already
tuned); **confirm "The Happy Song" lyrics** (captions are a best-guess, caption-only fix); exact
per-word sync via onset detection; per-word karaoke highlight (not just the line caption).

## 7. Song length trims — ✅ DONE (2026-07-02, extended 2026-07-10)
Trimmed the long "Sing with Pip" tracks for toddler attention (ffmpeg-static, fade-out so they
don't cut mid-note; replaced at the SAME path → self-heals via StaleWhileRevalidate).
- 2026-07-02: **Hokey Pokey** 3:59 → **1:30**, **Twinkle** 2:15 → **1:15**.
- 2026-07-10: **8 recordings cut to song-only** cut points — owner marked them with
  `scripts/cut-helper.html` (standalone timecode/mark tool), applied by **`scripts/trim-songs.mjs`**
  (0.5s fade, idempotent, skips OS-locked files): teapot (dropped a ~24s non-teapot tail,
  1:02→0:38), alphabet, bingo, twinkle, one-two-buckle, mary, hickory, are-you-sleeping. Originals
  remain in git for re-cutting (`git checkout -- public/sounds/songs/<id>.mp3`, tweak, re-run).

## 8. GitHub Codespaces backup — ✅ DONE (2026-06-29)
`.devcontainer/devcontainer.json` (Node 20 image, `npm ci` on create, ports 5173/4173
forwarded, ESLint/Prettier). Rebuild/run the app from any browser: **Code ▸ Codespaces ▸
Create on `main`** → `npm run dev` / `npm run build`. Guide + env/secrets notes:
**`docs/CODESPACES.md`** (app runs local-only with no env; Supabase/feedback vars and the
gitignored asset-gen keys re-add as Codespace secrets, never committed). Cloud accounts
de-risk *data*; this de-risks the *build environment*.
- ✅ Verified (2026-06-29): Codespace "crispy spoon" created on `main`, `npm ci` + `npm run
  build` succeed, the 3 `VITE_*` values added as Codespaces secrets, and the forwarded
  5173 URL added to Supabase Auth redirect URLs (so magic-link sign-in works from the
  Codespace). README has an "Open in Codespaces" badge. Optional later: enable **prebuilds**
  for faster startup.

---
> Items 9–13 came from the Agent Council review — see `docs/COUNCIL_REVIEW_RESPONSE.md`
> for what we accepted / reframed / declined and why.

## 9. In-session parent progress line — ✅ DONE (2026-07-01)
A single, **parent-facing** end-of-session line ("Today with Mia: 3 new words · 2 phrases").
Closes the passive caregiver feedback loop without a dashboard rebuild. **Not** a child-facing
score (keeps `no scores/streaks/pressure`). Needs a small per-child **daily activity bucket**
(reset on date rollover) fed by the `record*` actions; surfaced at natural session-end moments
(game "done" screen, Today complete, Rest wind-down).

## 10. Cooperative "we did it!" moment (Twin Mode) — ✅ DONE (2026-07-01)
Twin Mode now ends on a **shared, no-winner finale**: "You did it together!" naming BOTH children
("Mia & Leo found all 8 — great teamwork!"), a second confetti burst, and a spoken line that says
both names + the celebration (reuses existing name clips + the "All done!" clip — no new audio).
`ChoiceGame.jsx` gates on `players.length >= 2`. Solo games keep "Wonderful listening!".
Verified: `scripts/verify-twin-finale.mjs`.

## 11. Expectant-pause option (Learning Screen) — ✅ DONE (2026-07-01)
Per-child **"Wait time"** toggle in the Parent area (default OFF). When ON, the Learning screen
holds ~4s before auto-speaking so the child gets a communicative-opportunity window to name the
picture first; tapping the picture still speaks it immediately (no doubled speak). Auto Play stays
snappy (pause applies to hands-on play only). Per-child field `expectantPause` (store + migration +
cloud sync). Verified: `scripts/verify-expectant-pause.mjs`.

## 12. Sound cache-budget review — ✅ DONE (2026-07-01)
Raised the `/sounds/` runtime cache `maxEntries` 900 → **1600** (covers a single child's voice UI +
the songs they play within a session; LRU beyond it evicts + re-fetches gracefully) and images
240 → 400. Documented the byte tradeoff in `vite.config.js` (songs dominate ~29 MB; a dedicated
song cache with its own cap is the future lever). NOT a content-hash manifest (would break the
stable-URL self-heal). See `COUNCIL_REVIEW_RESPONSE.md`.

## 14. Twin Mode name audio for unknown names — DONE (pilot) + future (on-demand)
Custom/renamed children have no name clip, so they can't be spoken in the warm voice.
- ✅ DONE (2026-07-01): a generic **"Your turn!"** cue clip per voice + name clips for the
  owner's nieces/nephews **Ezra, Leila, Ethan** (added to `gen-tts-gcloud.mjs` name list +
  `NAME_CLIP_NAMES` in `audio.js`). Turn-taking now speaks the name when a clip exists
  (audrey/adriel/ezra/leila/ethan), else "Your turn!"; the co-op finale speaks known names
  then the celebration. No chime for unknown names. Verified: `verify-twin-finale.mjs`.
- ⏳ FUTURE (the real SaaS fix — **do not lose sight of this**): **on-demand name TTS** so ANY
  parent-chosen name is spoken. When a parent sets/renames a child, generate its clip via a
  serverless TTS endpoint → store in **Supabase Storage** → serve per-account. Fits the paid
  tier. Until then, custom names outside the known set fall back to the "Your turn!" cue.

## 13. Supabase offline-merge / conflict resolution — future (before heavier sync)
Part B reconcile is pilot-simple (cloud-wins on fresh sign-in, else push local — see
`src/lib/cloud.js`). Fine at pilot scale. Before shipping richer/real-time sync, define + test a
proper conflict-resolution/merge policy. **Do not add real-time sync without it.**
