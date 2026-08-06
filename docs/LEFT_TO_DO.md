# Left To Do

> Tracked backlog of things deliberately deferred (mostly blocked on credits/quota).
> When ready, do the steps below and commit.

## 🔊 Baby-cry sound (owner request 2026-08-05) — TO SCOPE
The **Crying / Baby** element should play a distinctive **cartoonish, rhythmic, repetitive
baby-cry** — the classic "**wah-wah-wah**" / "**wee-wee-wee**" whimper (like kids' apps/videos) —
not just the spoken "Boo hoo. It's okay." it says today.
- **Where it triggers:** decide — the Things-I-Do **Crying** item, the **Cry** verb, and/or the
  **Baby** word (confirm with owner).
- **How to source:** likely a real short cartoon-cry FX in `public/sounds/fx/<key>.mp3` (looped
  3–4× like the animal sounds, credited in `public/sounds/CREDITS.md`) and played via `playFx` the
  way fx-animals do — TTS saying "wah wah wah" would sound like a voice, not a cry, so avoid that.
- **Toddler-safety:** keep it light/cartoonish, never a distressing real infant cry.

## 📍 Phases remaining (at a glance) — updated 2026-08-06
- **SLP Phase 1 (language) — ✅ DONE.** 1.4 / 1.8 / 1.9 plus the earlier language corrections,
  natural game prompts, labelled praise, errorless retry, real-fx sounds, Word Board AAC redesign.
- **SLP Phase 2 — A+B+C DONE; D open.**
  - **A ✅ Social category** (16 words) + **`fn` tags** on all words.
  - **B ✅ Lint Rule C** (function-word coverage) in `npm run check`.
  - **C ✅ "Every Day with Pip"** — 5 routines (Mealtime, Bedtime, Getting dressed, Bath, Park),
    tap-along + generous auto-advance, verb animations, fully voiced. `verify-routines.mjs` in suite.
  - **D ⏳ Weekly parent narrative** — not started (parent-track, local weekly signal).
- **Premium image re-render — ✅ COMPLETE (static images).** Every representational static image is
  now premium (soft cel-shading, richer palette — `gen-symbols.mjs` STYLE). Covered Social, Animals,
  Verbs, Food/Mealtime, People, Body/Clothes, Nature/Places/Toys, Things/Home/School,
  Describing/Feelings, Where/Questions/Time, ABC "Alphabet Friends", content leftovers. Character
  renders are **multi-ethnic** (auto skin-tone rotation + diverse family: Black Mama/Dada, Asian
  Baby; Home Village Mommy/Daddy + Bath **reuse** those images). Counting Mountain now uses the
  premium **number cards** (1–20). `gen-symbols` gained **429-auto-retry** + **auto-diversify**.
  - **Left as-is (intentional):** Colour swatches + Number cards (flat is better for those targets).
  - **Cache bumped** `tv-images-v2`→`-v3` (force-purge stale art everywhere).
- **Animation frames (~125: song-/act-/do-) — ✅ DECIDED: LEAVE AS-IS (2026-08-06).** Ran a
  throwaway premium pilot (do-eating + do-jumping, anchor-conditioned, temp/untracked). Finding:
  consistency holds, but the premium lift is **marginal** — anchoring on the flat base pose (required
  to keep the character stable) pulls the render back toward flat, and motion masks the rest. A real
  lift would need re-drawing the premium bases + re-anchoring all 125 frames + full motion re-review —
  not worth it. Static-image premium is where the payoff is, and that's done.
- **Parent insight instrumentation (#2) + weekly narrative (#3 = Phase 2 D) — future**, gated on a
  privacy-safe local signal (see `COUNCIL_REVIEW_RESPONSE.md`).
- **Part C — Stripe billing — scoped, not built.**
- **Owner ear-checks — ongoing:** regenerated Stage-1 lines, new word/prompt clips, Counting 11–20,
  and the re-recorded **"pig"** word clip (was "pid").
- **Dev automation (local):** `post-commit` hook auto-starts the Vite dev server; the
  `TinyVoice-dev-idle-stop` scheduled task stops it after 24h with no commit.

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

## 4. Animal sound effects (new safari animals + duck) — ✅ ESSENTIALLY DONE
Real animal FX aren't TTS — they're CC audio that must be ear-auditioned (Claude can't hear), so
this closed out incrementally as the owner + Claude sourced clips:
- **Duck** quack fixed (real quack, not a chick); **Wolf / Goose / Crow** owner-provided
  (2026-06-10). **Owl** = real tawny-owl hoot (Wikimedia, CC BY-SA 4.0 — Alvaro Ortiz Troncoso;
  2026-07-17). **Chicken** = real hen cluck + new **Rooster** using the old crow (2026-07-17).
- **Snake** = **intentionally spoken-only** (warm "hiss, hissss!"). No clean CC snake-hiss exists on
  Wikimedia (verified across species/term queries) and a real hiss reads poorly on phone speakers, so
  snake was **removed from `FX_KEYS`** and now behaves like butterfly/turtle/fish (spoken label, no
  fx file). If a good hiss is ever sourced, drop it at `public/sounds/fx/snake.mp3` and re-add the key.

All wired `FX_KEYS` now have a real `public/sounds/fx/<key>.mp3`, credited in `public/sounds/CREDITS.md`.

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

## 7b. "Things I Do" action animations — ✅ DONE (2026-07-12)
Every "Things I Do" verb now **animates** on the big Learning stage — the same our-own-character,
key-pose idea as the songs, but with **no audio to sync** (a verb just loops 2 frames on a fixed
interval, so it can't drift and is far simpler). `components/ActionAnimation.jsx` +
**`src/data/actionAnimations.js`** (keyed by the item's `sound`, e.g. `do-jumping`); `ItemVisual`
plays it on the stage only, game/grid cards use frame 0. **Hard-cut flip-book, not a fade** (action
silhouettes differ too much to fade cleanly). Under `prefers-reduced-motion` the loop still plays
(the motion demonstrates the verb) but at a calmer ≥1s cadence — it must NOT freeze, or verbs look
static on phones/tablets that have Reduce Motion on (fixed 2026-07-13, `scripts/diag-live-actions.mjs`).
- **Two characters**: the existing Head/Shoulders **boy** (`song-ready`) + a **new girl** anchor
  (`act-girl-ready`, coral dress / pigtails). Solo verbs alternate boy/girl; the social verbs
  **Hugging / Dancing / Laughing / Playing / Peekaboo** show **both children together**.
- **28 verbs** (14 new added to `content.js doing[]`: Riding a bike, Blowing bubbles, Climbing
  stairs, Playing with toys, Kicking a ball, Reading a book, Waving, Swimming, Crying, Painting,
  Throwing a ball, Cooking, Peekaboo, Waking up, Pointing, Getting dressed). Content = **139
  items**. ~56 `act-*.webp` (8–23 KB).
- **Adding a verb:** add an entry to `ACTIONS` in `scripts/gen-action-poses.mjs` (anchor on
  `song-ready`/`act-girl-ready`, or draw a fresh base first) → generate + `optimize-images.mjs
  --replace` → add a config in `actionAnimations.js` → (new word) add the item + generate its
  `do-*` clips (`gen-tts-gcloud.mjs --only …`) + prompts (`--kind phrases`) → `verify-actions.mjs`.
- **Lesson learned:** a 4-frame full-circle bike pedal looked **glitchy** — independently generated
  frames don't register pixel-for-pixel, so fast multi-frame cutting jitters the whole child.
  **Rule: smooth = few frames held calmly.** Every action is a calm 2-frame loop.
- **Regression suite (2026-07-13):** `npm run verify:ui` (`scripts/verify-suite.mjs`) builds → serves
  `vite preview` → runs the UI checks as one pass/fail gate. `verify-actions.mjs` tests a **device ×
  reduced-motion matrix** and asserts every verb CYCLES — this exists because a Reduce-Motion freeze
  once shipped unnoticed (the old test only ran motion-ON). **Do not drop the reduced-motion cases.**
- **Optional next verbs:** other routines/emotions as wanted (e.g. Combing hair, Sneezing, Falling).

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

## 15. SLP Content & Speech Plan (Phases 0–2) — 2026-07/08
Source: `TinyVoice_SLP_Content_Working_Plan_FINAL`. Grading/response in `COUNCIL_REVIEW_RESPONSE.md`.

### Phase 0 — guardrails — ✅ DONE
- **Language linter** `scripts/lint-language.mjs` wired into `npm run check`: Rule A (contractions),
  Rule B (habitual 3sg on `say` + full-sentence rungs). Rule C (fn coverage) deferred to Phase 2.
- 0.1 (council context refresh) — moot; the root `council.js` was consolidated into `tools/council/`.

### Phase 1 — correct existing language — mostly ✅
- ✅ **1.1/1.2/1.3** `content.js`: Things-I-Do ladders character-narrated progressive (pronoun from
  `actionAnimations.js`), Safari rung-3 progressive, Music "It's a…", Home/Rainbow contractions,
  stale header rewritten. Re-rendered ×3 voices; stale clips pruned.
- ✅ **1.5** Natural game prompts — "Where's the …?" / "Who's …?" (SoundGame/TwinMode/Phonics).
- ✅ **1.6** Labelled praise — "You found the {word}!" + a light interjection ~1 in 4
  (`PRAISE_TEMPLATES` / `PRAISE_LIGHT` in `content.js`).
- ✅ **1.7 / 1.11** Errorless retry ladder — "Try again" → repeat prompt → narrow to 2 (others fade +
  go inert) → MODEL the answer ("Here — cow!") and accept as success. Help fires only on the child's
  tap (patient; no failure state). `ChoiceGame.jsx`.
- ✅ **1.8 (prompt half)** Mislabel cues fixed (Zebra → "Black and white stripes", not the horse's
  neigh; butterfly/turtle). **Real animal fx in game prompts** — fx-animals play the recorded sound
  (real trumpet / oink ×3) instead of TTS onomatopoeia; `FX_KEYS` shared via `src/data/fxKeys.js`,
  played by `ChoiceGame` before the spoken "Where's the …?".
- ✅ **1.10** Feelings → emotions only (More/Yes/No/All done live on the Word Board **Core** page).
- ⬜ **1.4** Phrase Builder natural audio (say-override): telegraphic cubes ("Look Dog") but natural
  spoken audio ("Look, dog!"). Structural change to `phraseContent.js` + `PhraseScreen` + the clip
  pipeline — slug stays on the blocks so existing clips don't orphan.
- ⬜ **1.8 (rule half)** homonym game-pool rule: never co-place `food-chicken` + `chicken` (or
  `food-fish` + `fish`) in one choice array.
- ⬜ **1.9** `list-phrases.mjs` wording ("articulation target" → pronunciation reference) + regenerate
  `PHRASES_REVIEW.md`.

### §S1 — Word Board = real AAC board — ✅ DONE (+ vocab fill-out)
- Fixed **Core** page (`CORE_BOARD` in `phraseContent.js`), position-stable fringe pages, **CLEAR =
  message strip only**, Find decoupled, parent-modelling hint. `verify-word-board.mjs` in `verify:ui`.
- **Full vocab fill-out**: every page a multiple of 4; **4 columns on every screen** (bigger toddler
  targets, gap-free on all devices); Colours full set (pink/brown/black/white/grey/rainbow), School 12,
  People 12 (family), Body 12, Questions 8; verbs split **Move / Play / Everyday**; **Numbers hidden**
  from the board (they live in Counting Mountain). ~30 new AAC symbols + clips (3 voices), clearer
  Hair/Ears/Knee, a proper "more" sign. **Counting Mountain 11–20** now names the number + shows the
  quantity (no boring recount).

### Phase 2 — not started
Vocabulary expansion, `fn` tags (unlocks lint Rule C), routine-based language ("Every Day with Pip"),
weekly parent narrative. Some new vocab may need images + 3-voice clips (Vertex, on the GCP credit).
