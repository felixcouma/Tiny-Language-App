# Current Session Tracking

> Update before commit/push so the next device/session knows where things stand.
> Full state: `TINYVVOICE_PROJECT_CONTEXT.md`.

## Latest Session — 2026-07-12 · Branch `main` · Live on **Vercel** + **GitHub Pages** (both from `main`)

> **"Things I Do" verbs are now ANIMATED** — the same our-own-character, key-pose approach as the
> songs, but with **no audio to sync to** (a verb just loops 2 frames, so it's far simpler and can't
> drift). Adds a **girl** character alongside the existing boy, with a boy/girl split and a few
> **both-together** social scenes. Owner reviewed the prototype on dev before the full rollout.

### 🤸 Things I Do — action animations (25 verbs)
- **Renderer**: `src/components/ActionAnimation.jsx` loops an action's key frames on a fixed
  interval (config: `src/data/actionAnimations.js`, keyed by the item's `sound`, e.g. `do-jumping`).
  **Hard cut (flip-book), not a cross-fade** — an action's two frames can differ a lot in silhouette
  and fading ghosts them into a confusing double-image. Under `prefers-reduced-motion` the loop
  still plays (the motion demonstrates the verb — it's informative), just at a calmer ≥1s cadence.
  ⚠️ It **used** to freeze on frame 0, which made verbs look static on phones/tablets that have
  Reduce Motion on (fixed 2026-07-13; diagnosed live with `scripts/diag-live-actions.mjs`).
- **Where it plays**: `ItemVisual` shows the animation on the **big learning stage** only; game/Word
  Board/Phonics cards use **frame 0 as a still**, so grids stay light.
- **Characters**: the existing Head/Shoulders boy (`song-ready`) + a **new girl anchor**
  (`act-girl-ready`, coral dress / pigtails). Solo verbs split boy/girl (alternating); the social
  verbs **Hugging / Dancing / Laughing / Playing with toys** show **both children together**.
- **Frames**: `scripts/gen-action-poses.mjs` (Vertex, anchor-conditioned, 2 frames/verb) → ~40 new
  `act-*.webp` (8–23 KB). **6 new verbs** added to `content.js doing[]`: Climbing stairs, Playing
  with toys, Kicking a ball, Reading a book, Waving, Swimming (+ Riding a bike / Blowing bubbles from
  the prototype). Content now **131 items**.
- **Voice**: `do-*` word clips for the 8 new verbs generated in all 3 voices (`gen-tts-gcloud.mjs
  --only …`); game/phonics prompts + expand-ladder clips filled via `--kind phrases` (skip-existing).
- **Note learned**: a 4-frame full-circle bike pedal looked **glitchy** — independently generated
  frames don't register pixel-for-pixel, so fast multi-frame cutting jitters the whole child. Rule:
  **smooth = few frames held calmly**. Every action is a calm 2-frame loop.
- **Round 2 (+5, owner-reviewed the frames first)**: **Crying** (girl — emotion, counterpart to
  Laughing), **Painting** (girl — creative), **Throwing a ball** (boy — motor pair to Kicking),
  **Cooking** (boy — routine), **Peekaboo** (both — social game). Content now **136 items**.
- Verify: **`scripts/verify-actions.mjs`** (all 25 verbs: 2 frames, correct keys, cycles, 0 errors).

---

## Earlier Session — 2026-07-10 · Branch `main` · Live on **Vercel** + **GitHub Pages** (both from `main`)

> **Song animations rolled out to ALL 13 songs and made config-driven; 8 more song trims; CI
> hardening; Supabase keep-alive.** Verified headlessly (0 console errors) on dev AND the **live
> GitHub Pages** site; owner ear-tuned the sync. All pushed to `main` (deploys both surfaces).

### 🎬 Song animations — full rollout, now config-driven (all 13 songs)
- **Config-driven**: `SongAnimation.jsx` reads per-song data from **`src/data/songAnimations.js`**
  (poses / lyric lines / cue `seq` / timing). Adding a song = generate poses + add a config entry +
  `animated:true`. `build()` gained an optional per-cue **`extra`** pause for a single phrase
  boundary (used to fix Head/Shoulders round-3 without changing tempo).
- **Teapot redone as a CHARACTER** — "I'm a Little Teapot" was a child *role-playing* a teapot
  (confusing for toddlers); now a cheerful **orange teapot** (body/handle/spout/steam/tip).
- **New character animations** (each = one consistent subject acting out the lyrics, base pose drawn
  fresh then action poses anchored on it): Twinkle (star), Hickory Dickory Dock (mouse+clock), Mary
  Had a Little Lamb (lamb), **Bingo (puppy — models the CLAP GAME**: each verse drops a leading letter
  for a clap; CC shows the letters), Alphabet (owl; letters live in the caption), One-Two-Buckle /
  Hokey Pokey / Happy Song (**reuse the Head/Shoulders child**), Are You Sleeping (bear), Hush Little
  Baby (baby), Over the River (horse+sleigh). ~30 new `song-*.webp` (10–38 KB).
- `scripts/gen-song-poses.mjs` is now **multi-song** (`--song a,b`) with graceful anchor fallback.
- **Sync tuning (owner ear-pass):** Head/Shoulders → uniform beats (removed a phrase-freeze that
  lagged round 2) + small breaths before the eyes line and the final round (round 3 on-beat). Bingo →
  one-time ~1s lead-in at the 2-clap verse. Others use first-pass defaults (tune by ear later).
  ⚠️ **"The Happy Song" captions are a best-guess** ("If You're Happy…") — confirm vs the recording
  (caption-only fix, no re-gen).
- Verify: **`scripts/verify-song-anims.mjs`** (all 12 config-driven songs) + `verify-teapot.mjs`.
  Passed on dev **and** the **live** `felixcouma.github.io` site.

### ✂️ Song trims — 8 recordings cut to song-only (this session)
Owner marked cut points with **`scripts/cut-helper.html`** (standalone timecode + mark tool).
**`scripts/trim-songs.mjs`** (static ffmpeg, 0.5s fade-out, idempotent, skips OS-locked files)
trimmed teapot (dropped a ~24s non-teapot tail, 1:02→0:38), alphabet, bingo, twinkle,
one-two-buckle, mary, hickory, are-you-sleeping. Originals stay in git for re-cutting.

### 🔧 CI + infra
- **Node 20 deprecation fixed** — bumped Pages actions to Node-24 majors (checkout v5, setup-node v6
  / build on Node 22, configure-pages v6, upload-pages-artifact v5, deploy-pages v5). Deploy green,
  no annotations.
- **Supabase keep-alive** — `.github/workflows/supabase-ping.yml` pings `/rest/v1/accounts?limit=1`
  every 3 days (free tier pauses after ~7 days idle). Repo secrets `SUPABASE_URL` /
  `SUPABASE_ANON_KEY` set. **The project had paused** (owner restored it); the anon key is valid —
  the `/rest/v1/` ROOT is service_role-only, so the ping queries a table (200). **Data survived the
  pause intact** (pause = suspend, not delete; same key still authenticates the same project ref).

### 📌 Still open / next
- Ear-pass timing on the newer song animations; confirm "The Happy Song" lyrics.
- Optional: exact per-word sync via onset detection; per-word karaoke highlight.
- Everything from the pilot backlog below still stands.

---

## Earlier Session — 2026-07-01 · Branch `main` · Pilot live on **Vercel**: https://tiny-language-app.vercel.app/

> **Agent Council review → shipped enhancements.** The owner ran an interactive "Agent Council"
> tool (now at `tools/council/`, its own package). Its critique was evaluated against the actual
> codebase in **`docs/COUNCIL_REVIEW_RESPONSE.md`** (accept / reframe / decline — several council
> claims were factually wrong about the code, e.g. Howler/PNG/runtime-TTS). The accepted items
> were then built this session.

### ✅ Shipped this session (all verified, 0 console errors)
- **§9 In-session parent progress line** — a gentle **parent-facing** "Today with `<child>`: N new
  words · N phrases" at session-end (game done + Rest). Per-child `daily` bucket (auto-resets on
  date rollover) fed by `record*`. **Not** a child-facing score. `verify-progress-line.mjs`.
- **§10 Cooperative "we did it!" Twin finale** — Twin Mode ends on a shared, **no-winner** payoff
  ("You did it together! A & B found all 8 — great teamwork!"), double confetti, both names spoken.
  `ChoiceGame` gates on `players.length >= 2`. `verify-twin-finale.mjs`.
- **Twin name audio (§14 pilot)** — unknown/renamed names no longer chime. Speak the name when a
  clip exists (`NAME_CLIP_NAMES` = audrey/adriel + **ezra/leila/ethan**, the owner's nieces/nephews
  — 12 new clips generated), else a generic **"Your turn!"** cue. `nameCue()` in `ChoiceGame`.
  FUTURE: on-demand per-name TTS → Supabase Storage (LEFT_TO_DO §14 — **do not lose sight**).
- **§11 Expectant-pause option** — per-child **"Wait time"** toggle (Parent area, default OFF).
  ON → Learning screen holds ~4s before speaking (communicative-opportunity window); tap speaks
  immediately; Auto Play stays snappy. New per-child `expectantPause` (store + migration + sync).
  `verify-expectant-pause.mjs`.
- **§12 Sound cache-budget** — `/sounds/` `maxEntries` 900→1600, `/images/` 240→400, byte tradeoff
  documented in `vite.config.js` (songs dominate; dedicated song cache is the future lever). NOT a
  content-hash manifest (would break stable-URL self-heal).
- **Tooling:** the Agent Council moved to **`tools/council/`** (own `package.json`; `@anthropic-ai/sdk`
  + express + dotenv kept OUT of the app's deps). `cd tools/council && npm install && npm start`.

### 🎬 Song animations — benchmark built & approach APPROVED (2026-07-02)
Flagship **Head, Shoulders, Knees, and Toes** ships an in-app animation: a **consistent toddler**
(generated + anchor-conditioned key-pose frames, ~11 KB each) acts out head/shoulders/knees/toes +
eyes/ears/mouth/nose, driven by the **actual audio time** (per-word cue timeline modelling the slow
choir "drag") with a **karaoke caption**. `SongAnimation.jsx`, `songs.js animated:true`,
`gen-song-poses.mjs`, `verify-song-animation.mjs`. **Decision: build our own, not source** (Lottie
& Pixabay video are Cloudflare-gated + style-inconsistent + license-fussy — sourcing attempts in
`.verify-shots/`). Rollout recipe: `LEFT_TO_DO §6`. §7 song trims also done earlier this session.

### 📌 Backlog now — remaining items are input-gated or bigger
- **Roll out song animations to more songs** (§6 recipe) — pose-based songs are cheap; continuous-
  motion (Wheels on the Bus, Itsy Bitsy) cost more. Optional: exact per-word sync via onset detection.
- **§4 Duck quack + 5 animal FX** — owner sources + ear-auditions CC audio; keys pre-wired.
- **§13 offline-merge** · **§14 on-demand name TTS** — future (before heavier sync / paid tier).
- **Part C billing** (Stripe + privacy policy) — after pilot feedback sets a price.

---

## Earlier Session — 2026-06-29 · Branch `main` · Pilot live on **Vercel**: https://tiny-language-app.vercel.app/

> **Strategic shift:** TinyVoice is now a **therapist-driven pilot product**. Vercel is the
> primary surface (it runs serverless + has the cloud env); GitHub Pages stays as a free demo.
> Goal: get it in front of parents beyond Audrey/Adriel, gather feedback, then add billing.

### 🚸 Part A — generic, renamable child profiles + "How many children?" onboarding (shipped)
The twins are no longer hard-coded — names are **per-child data**, so one build serves both our
Audrey/Adriel device and a generic giveaway version.
- `store.js`: generic `child1`/`child2` seeds replace Audrey/Adriel defaults; fresh devices seed
  only "Everyone" and ask at setup. New `childCount` (1|2), `setChildCount()`, `renameProfile()`.
  `loadChildCount()` **infers the count for existing installs** so our device skips setup and keeps
  its profiles **untouched** (non-destructive migration — verified).
- New `SetupScreen` ("One / Two children"); `App.jsx` routes to it on a truly fresh device.
- Twin Mode button gated on `childCount ≥ 2`; `TwinModeScreen` players come from the two real
  profile names. Parent area gained a **"Children"** section (1↔2 toggle + rename rows).
- Verify: `scripts/verify-profiles.mjs` (17 checks — fresh One/Two flows + migration). All pass.

### ☁️ Part B — optional parent accounts + cloud sync + 30-day trial (Supabase, shipped)
Offline-first SaaS spine. App still runs **fully local** when Supabase env is absent; when set, an
**Account** section appears in the (gated) Parent area.
- Stack: **Supabase** (auth + Postgres + RLS) on the user's hobby account. Project URL
  `https://clbeelfstlnvahzjbgfo.supabase.co`. Tables `accounts` / `children` / `progress` with
  RLS (each parent sees only their own rows) + a signup trigger. SQL is in the chat history /
  re-runnable. **Magic-link** email auth; redirect URLs include the Vercel domain + localhost.
- `src/lib/supabase.js` (null-safe client) + `src/lib/cloud.js` (auth + sync). Debounced push of
  children + active child's progress; **cloud-wins reconcile** on a fresh sign-in (new device
  recovers data); `ensureAccount()` **self-heals** the account row (idempotent, preserves the
  trial clock — don't depend on the trigger); one-tap `deleteCloudData()` (COPPA/GDPR-K). All
  writes log `[cloud]` warnings on error.
- `store.js`: `session`/`account`/`cloudStatus`/`authError` + `applyCloudState`. `App.jsx` calls
  `initCloud(useStore)` once.
- Parent area: **soft trial banner** ("N days left" / gentle ended state — **child play is never
  blocked**, per the pilot decision) + magic-link sign-in / sign-out / delete-data.
- **Expired/used magic link** (`#error_code=otp_expired`) now handled gracefully — hash stripped,
  friendly "request a fresh link" note. (Single-use, ~1h expiry links are *expected* to fail on
  reuse; the persisted session keeps you signed in across reloads — no re-link needed.)
- Env: `.env.local` (gitignored) holds the Supabase + feedback keys locally; **Vercel has
  `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` set & deployed** (confirmed). `.env.example`
  documents them; `.gitignore` hardened for `.env*`.
- Verify: `scripts/verify-cloud.mjs` (13 checks — UI, magic-link flow w/ OTP stubbed, trial-gating,
  stale-link). Passes against **both** dev and the **deployed Vercel** site.
- New dep: `@supabase/supabase-js` (saved). **Note:** bundle grew ~78→136 KB gzip — lazy-loading
  supabase-js is a easy future win.

### 🎵 "Sing with Pip" — 13 public-domain children's songs, per-child selectable (shipped)
Real sung recordings from the **U.S. State Department "Sing Out Loud: Children's Songs"**
collection — U.S. government works, **public domain** (no indicated copyright on any track;
verified), credited in `public/sounds/CREDITS.md` (no seal/endorsement implied).
- `public/sounds/songs/*.mp3` (13, ~29 MB) — **runtime-cached** via the existing `/sounds/`
  StaleWhileRevalidate rule, **NOT precached** (precache stayed 7 entries → no install bloat).
- `src/data/songs.js` (catalog: exact titles, vocab `tag`, card `grad`, `DEFAULT_SONG_IDS`).
  `SongScreen` — "Sing with Pip" Home shelf (only the child's enabled songs) + a simple Pip
  player (big card, play/pause, progress; one song at a time, stops on exit).
- Per-child **`enabledSongs`** on the profile (seeds/migration/`toggleSong`/`openSongs`),
  defaulting to **Alphabet · Head-Shoulders · Bingo · Twinkle**; **synced via Part B**
  (added to the cloud `settings` blob). Parent area → **Songs** toggle list (all 13).
- Verify: `scripts/verify-songs.mjs` (11 checks). Verified on dev **and** the deployed
  `.vercel.app`. Owner ear-tested (incl. switching on non-defaults) → ✅.

### 🧰 GitHub Codespaces backup — DONE & verified
`.devcontainer/devcontainer.json` (Node 20, `npm ci`, ports 5173/4173) + `docs/CODESPACES.md`
+ an **"Open in Codespaces"** badge in `README.md`. Verified end-to-end: Codespace built,
`npm run build` green, the 3 `VITE_*` values added as **Codespaces secrets**, and the forwarded
5173 URL added to **Supabase Auth redirect URLs** (magic-link works from the Codespace). Backup
story complete — **code** (GitHub) · **data** (Supabase sync) · **build env** (Codespaces).
The owner stopped the Codespace for the night (optional: delete it to save storage; recreate via
the badge anytime).

### 🟢 Pilot status — running. Next is feedback, not features.
Parents can sign in, sync across devices, a 30-day trial runs, and there are songs. **Let the
pilot run**; let price/appetite emerge from real feedback before building billing.

### 📌 Backlog (open) — pick up here tomorrow
- **Song animations (Lottie/vector sync)** — SCOPED in `docs/SONG_ANIMATIONS_SCOPE.md`: light
  vector animations acting out lyrics, synced to audio; flagship *Head, Shoulders, Knees, and Toes*;
  pairs with deferred karaoke lyrics. (`LEFT_TO_DO §6`.)
- **Song length trims** — owner to ear-pick trim points for the long tracks: **Hokey Pokey ~3:59,
  Twinkle ~2:15, Hush Little Baby ~2:04** (others ~1:00–1:50). `LEFT_TO_DO §7`.
- **Part C — billing**: Stripe `/api/checkout` + `/api/webhook` Vercel serverless → flip
  `plan='active'` (DB columns already exist, no migration). Needs a **price** ($5–10, set by pilot
  feedback) + a **privacy policy / COPPA-GDPR-K consent** before charging. Add the deferred pricing
  question to the feedback form then too.
- **Twin Mode name audio for unknown names** (renamed kids currently chime, not spoken). Decision:
  ship a generic **"Your turn!"** clip per voice (3 clips) as the pilot fix — speak the name only
  when a clip exists (Audrey/Adriel), else play "Your turn!"; the visual turn-pill always shows the
  real name. Per-name on-demand TTS → Supabase Storage is the premium/long-term option.
- **Lazy-load supabase-js** to shrink the bundle.
- (Still open from before) animal FX sounds + duck quack (LEFT_TO_DO §4); full per-voice switching.

---

## Earlier Session — 2026-06-10 · Branch `main` · Live: https://felixcouma.github.io/Tiny-Language-App/

### 🔊 Voice pipeline migrated to Google Cloud TTS (Vertex)
AI Studio prepayment credits were depleted, so all warm-voice generation now runs through
**Google Cloud TTS / Vertex** (same Aoede/Leda/Sulafat Gemini-TTS voices) on the project's
**$300 trial credit**. Auth = service-account ADC (`scripts/gcloud-sa-key.json`, gitignored).
New tooling: `scripts/gen-tts-gcloud.mjs` (`--kind voices|phrases`, `--only a,b`, `--match`,
`--force`); `scripts/gen-symbols.mjs` gained a Vertex mode (`VERTEX_PROJECT` env). Setup:
`docs/TTS_GCLOUD_SETUP.md`. Warm voice is now **complete** (3 voices, counting, family, ~800
phrases, A–Z letters, phonics, new animals).

### 🐛 Observations batch (docs/Observations.md) — all fixed & live
- **TTS style-prompt leak**: the Gemini-TTS `input.prompt` was spoken aloud. Root cause = the
  extra counting-pace sentence (and name clips). Fix = send **text only, no style prompt**.
  Detected leaked clips by file size, regenerated only those (counting + names), not all ~1k.
- **Counting 11–20** now count fully (`1…N`) instead of skipping to the number.
- **Twin Mode** Adriel name "repeat" = leaked `adriel.mp3` (30 KB → 4 KB), fixed.
- Content text: Brother "I play with my brother", Wash hands "I wash my hands", Rabbit "Fast
  rabbit", Green "Green grass". **Rotating praise** on correct answers (Yay/Awesome/…). **Zebra**
  regenerated black-and-white.
- **Word Board "Find" mode (Adriel)**: Board↔Find toggle; one target word hops cell to cell,
  tap to find, advances after 5 finds (`GridScreen.jsx`).
- **12 concrete images + 5 new Safari animals** (Snake/Owl/Wolf/Goose/Crow → 25 animals) via
  Vertex. Real FX sound recordings + duck-quack fix are **backlog** (LEFT_TO_DO §4).

### 🤖 Robotic device voice removed everywhere
`voice()` / `sayWord()` now fall back to a **soft chime, never `speechSynthesis`**. Generated the
two things that fell through to the device voice: **A–Z letter clips** ("starts with X" buttons)
and **all phonics prompts**. Verified in-app: 0 device-speech calls. Aoede stays the default;
**full per-voice switching is backlog** (LEFT_TO_DO §3, run only within the $300 credit).

### 🩹 PWA stale-clip cache fixed (was masking every clip fix)
`/sounds/` + `/images/` were `CacheFirst`, so a re-recorded clip stayed pinned in the SW cache.
Switched to **StaleWhileRevalidate** + bumped cache names to `-v2` (`vite.config.js`) — one-time
purge now, self-healing for future re-records. Also added a **screen wake lock**
(`src/lib/useWakeLock.js`) so the device doesn't sleep mid-session.

### 📋 Backlog after this session — see `docs/LEFT_TO_DO.md`
§3 full per-voice switching (~1.6k clips, ~$3–5) · §4 animal FX sounds + duck quack (need
ear-auditioned CC audio).

---

## Last Session — 2026-06-08 · Branch `main` · Live: https://felixcouma.github.io/Tiny-Language-App/

### 🗣️ Therapy-doc pass 2 (2026-06-09)
- **Safari ladders** de-coloured: "Brown dog" → "Big dog · Dog runs · The dog runs fast"
  (animal + verb morphology, all 20).
- **Counting ladders** enriched with number-word form + varied nouns: "Five silly monkeys ·
  Count to five · I see five" (kept varied nouns per request, not apples-only).
- **New phrase patterns** added: requesting ("Want Ball", "Want More Milk"), refusing
  ("No Ball", "No More Milk"), joint attention ("Look Dog"), questions ("Where Ball Go").
  Two new words (Want, Where). Phrase banks now 54 two-word / 32 three-word; 211 words.
- See **`docs/LEFT_TO_DO.md`** — 25 remaining vocab images (credits depleted) + clip backlog.

### 🌙 Overnight 2026-06-09 (autonomous) — observations from testing
- **Auto Play timing fixed** — `LearningScreen` + `ChantScreen` now advance only AFTER the
  clip (word + animal sound) finishes playing, not on a fixed timer that cut audio short.
  (Learning: waits for `playItem()` to resolve + 900ms; Chant: + 700ms; play button no
  longer re-triggers a clip that then gets cut.)
- **Word Board images fill the cells** — `.wb-cell-img` now flexes to fill the box (was 52px).
- **Smart counting** (`content.js`) — replaced "N things!" with concrete, correctly-pluralised
  nouns + a full count to ten (Haiku-assisted): "One red apple!", "Five silly monkeys!",
  "Ten tiny toes!", "Twenty dancing raindrops!". Expand ladders use the noun too.
- **Phrase review doc** — `docs/PHRASES_REVIEW.md` (via `scripts/list-phrases.mjs`) lists every
  spoken line by source so wording can be polished in one pass.
- **TTS**: ran today's batch (quota reset) → **+182 clips**; phrase clips now **353/763**.
- **Deferred (needs phrase clips first)**: Music Forest is still bare — richer sound-play +
  phonics to come once the desired sound-profile clips exist.

### 🗣️ Speech-therapy practice — Levels 1 & 2 (built, verified, 0 console errors)
A therapist-aligned, progressive phrase-building tool for the twins (Adriel building
vocabulary, Audrey on phrases). Sound-first: tap a word/phrase → hear it in our warm
voice (device voice is the graceful fallback until clips are pre-rendered).
- **`src/data/phraseContent.js`** — the FULL `VOCABULARY_CORE_200_WORDS.md` set:
  **209 single words** across 3 frequency tiers / 19 categories (no dupes); `wordsForLevel`,
  `categoriesForLevel`; phrase banks `PHRASES` = **{2: 44 phrases, 3: 26 phrases}** (curated
  natural combos, every word in the bank); `PHRASE_SIZES`, `PHRASE_LEVELS` (L1/L2/L3 all
  active), `DEFAULT_PHRASE_LEVEL` (adriel 1 / audrey 2).
- **`src/screens/PhraseScreen.jsx` (+ .css)** — one screen, mode by `phraseLevel`:
  - **Level 1 — Word Practice**: category chips + big tap-to-hear word card + prev/next;
    auto-says each word on focus. Pulls from the **full 209-word bank** grouped by the 19
    categories (NOT tier-gated) — e.g. Doing words 48, Animals 15, Describing 17 — so any
    child gets plenty of practice words. Level controls mode (words vs phrases), not breadth.
  - **Level 2/3 — Phrase Builder**: an in-screen **2-words ↔ 3-words toggle**; N tappable
    word cubes (blue/orange/green) with tap-flash + "+" separators, then a phrase box
    “hear them together” (celebration chime) + prev/next. Level 3 opens straight to 3-word.
- **Store**: per-child `phraseLevel` (1/2/3) with migration for existing installs;
  `setPhraseLevel`, `openPhrase`; progress now tracks `recordPracticeWord` (counts toward
  words-heard/mastery, no sticker toast) + `recordPhrase` (phrase → count).
- **Home**: new chunky button labelled by level (“Word Practice” / “Phrase Builder”).
- **Word Board** (`src/screens/GridScreen.jsx` + .css) — a real therapist-style **AAC
  communication board** modelled on the reference photo: clean **white lattice** filling
  the screen, blue **"Vocab" header**, a **message strip** + **CLEAR**, scrollable category
  filter. **Blank-reveal model**: the board starts empty; tapping a blank cell reveals a
  **random** word from the chosen category (or any on "All"), speaks it, and adds it to the
  message strip (no board dupes). Tapping a filled cell repeats it; tapping the strip speaks
  the whole message. **CLEAR empties the message AND blanks the board** (category switch also
  blanks it). Cells show a symbol from `images/<contentKey|slug>.webp` when present (real
  WebP art / generated icons), else clean text. Reached from Home → **Word Board**.
- **Readiness progression** (`isPhraseReady`, `PHRASE_READY_AT = 25`) — once a child
  has heard 25+ distinct words, Word Practice shows a gentle "Ready for phrases? Try the
  Phrase Builder →" link, and the Parent Dashboard surfaces a "Move to Level 2" suggestion.
  **Never auto-switches** — the grown-up/therapist confirms. New children start in Word
  Practice; the twins keep their defaults (Adriel L1 / Audrey L2).
- **In-session mode switch** — Phrase Builder has "← Back to single words"; Word Practice
  can jump to phrases when ready. So **Everyone/guest** (and any profile) can reach every
  mode; the parent can also set Everyone's level directly in the dashboard.
- **Word Practice enriched** — Pip greeting bubble, a "starts with X" letter chip (taps to
  hear the letter), and a "✓ heard" badge once a word has been heard before.
- **Parent Dashboard**: “Speech practice level” picker (L1/L2/L3, all active), the
  readiness suggestion, and a "N different words · N phrases explored" line.
- **TTS pipeline**: the 209 words + 70 phrases are now wired into `scripts/gen-phrases.mjs`
  (prioritised first). Generated `go`/`eat` today; rest resume on the next free-quota reset.
- Stack note: the design docs mention Tailwind/Framer; this app uses plain CSS + tokens,
  so the screen matches the existing app style (chunky shadows, `.scene`, Icons.jsx, Pip).
- **Next for this feature**: pre-render the Level-1 words + the 16 phrases as Aoede clips
  (add them to `scripts/gen-phrases.mjs` pool) so they don't use the device voice; Level 3
  (3-word builder) + Grid Vocabulary mode are documented for later.


### ✨ Polish batch — 5 more (all shipped, verified, 0 console errors)
8. **Error boundary** — friendly "Oops, start again" instead of a white screen.
9. **Real install assets** — PNG icons (192/512/maskable) + apple-touch-icon
   rasterized from the SVG; manifest + index.html; dismissible Add-to-Home hint.
   (Installs cleanly on iOS/Android now.)
10. **First-run onboarding** — 3 gentle Pip steps, once per device (`tv_onboarded`).
11. **New-friend celebration** — sticker toast + Pip + chime on first collect.
12. **Per-child screen-time + quiet hours** — limit & bedtime live on each profile;
    wind-down per active child; "a little more" snoozes 10 min.

Also merged in (parallel work): **WebP illustrations** (52 MB → 0.8 MB, cache key
v3, webp-first), plus review fixes (game accuracy, Twin 3-col, chant no-inflate).

### 🚀 MVP feature batch — 7 features (all shipped, each verified, 0 console errors)
1. **Child profiles + stage** — "Who's playing?" launcher, per-child progress
   (migrates old data), First-words/Little-sentences level (`store.js`).
2. **Adaptive "Today with Pip"** — daily session mixing new + spaced-repetition
   review, stage-sized (`lib/today.js`, `TodayScreen`).
3. **Tactile cards** — tap → bounce + sparkle burst (`TactileStage`).
4. **Collection / sticker book** — every word heard becomes a collectible friend
   (`CollectionScreen`); ★ on Home.
5. **Parent zone** — sum gate, daily screen-time + calm "rest" wind-down with a
   gated "a little more", richer insight (words mastered / to discover).
6. **Sing-along** — rhythmic chant per world reusing word clips + sounds (`ChantScreen`).
7. **Offline PWA** (`vite-plugin-pwa` SW: precache shell, lazy-cache images/audio)
   **+ phonics** ("Letter Sounds" game + first-letter chip on cards).

New deps: `vite-plugin-pwa` (dev). Spaced repetition uses `progress.lastSeen`;
sticker book uses `progress.collected`; mastery = heard ≥ 4×.

### Built — real illustrations, warm spoken voice, and real animal sounds
- **53 cartoon illustrations** (`public/images/<key>.png`) via nano-banana (Gemini image).
  The app (`src/lib/images.js → fromLocal`) prefers these over Wikimedia. **My Body (13)**
  redesigned to one consistent toddler character.
- **Image fixes:** bumped cache key to `tv_img_cache_v2` (so returning visitors drop the old
  Wikimedia cache); `fromLocal` now requires an `image/*` content-type (the Vite dev server &
  SPA hosts answer 200+index.html for missing paths, which previously broke bundled images).
- **Storybook voices** (Gemini TTS) at `public/sounds/<voice>/<key>.mp3`; parent picks
  Aoede (default) / Leda / Sulafat in the Parent Dashboard. `audio.js` plays the chosen voice,
  graceful device-voice fallback.
- **Real animal sounds** — say the word, then play the recorded sound **4× in a coherent flow**.
  Voice-independent `public/sounds/fx/<key>.mp3` (16 animals), trimmed/normalized, baked repeat,
  iOS-safe MP3. Sources: Adobe (11) + Wikimedia CC (5); attribution in `public/sounds/CREDITS.md`.
  fish/rabbit/butterfly/turtle stay word-only (silent animals).

### Asset tooling (`scripts/`)
- `gen-images.mjs` (image batch), `gen-audio.mjs` (multi-voice TTS → MP3, resumable, retries
  transient empties). FX build + free-CC fetch + credits scripts live in `.verify-shots/`
  (gitignored, sources are local). One-time deps:
  `npm install @google/genai @breezystack/lamejs ffmpeg-static --no-save`.

### 🎙️ TTS audio — PHRASES FIRST, then voice (free flash models only; NO paid Pro)
- Counts: **phrases 169/491**; voice **aoede 89/89 · leda 87/89 · sulafat 71/89**.
- Both free flash TTS models (`gemini-2.5-flash-preview-tts`, `gemini-3.1-flash-tts-preview`)
  hit their per-model ~100/day cap today. **Do not use `gemini-2.5-pro-preview-tts` (paid/pricier).**
  Credit: ~$5.35 balance at start of today; today's gen ≈ ~$2 (within budget).
- **Next reset — do PHRASES first, then the last voice clips.** Resumable (skip-existing); the
  scripts now stop promptly at the daily cap:
  ```bash
  K=$(tr -d '\r\n' < scripts/gemini.key.local)
  GEMINI_API_KEY=$K PACE_MS=6500 node scripts/gen-phrases.mjs                                   # phrases (priority)
  GEMINI_API_KEY=$K PACE_MS=6500 TTS_MODEL=gemini-3.1-flash-tts-preview node scripts/gen-phrases.mjs
  GEMINI_API_KEY=$K PACE_MS=6500 node scripts/gen-audio.mjs --voices leda,sulafat               # then voice (leda 2, sulafat 18)
  GEMINI_API_KEY=$K PACE_MS=6500 TTS_MODEL=gemini-3.1-flash-tts-preview node scripts/gen-audio.mjs --voices leda,sulafat
  ```
  ~322 phrases remain; ~180/day across both free models ≈ ~2 more days. Commit + push the new
  clips each day. The phrase system + per-voice→Aoede fallback are already shipped, so until all
  exist, untapped phrases fall back to the device voice (graceful, no silence).

### 🎨 Word Board symbol icons (`scripts/gen-symbols.mjs`)
- New script generates **AAC-style symbol icons** (nano-banana) for the therapy
  **verbs + prepositions** our content art doesn't cover → `public/images/<slug>.png`
  → WebP via `optimize-images.mjs`. The board shows them automatically.
- **Word images for the full bank** — `gen-symbols.mjs` now covers ALL board words (nouns,
  feelings, colours, numbers, nature, vehicles, school, time…), writing to the exact key the
  board resolves (`imageKeyFor||slug`). **~162 of 209 words now have art** (public/images = 215
  WebP). **23 remain** (Nine, Ten, vehicles, school, time words) — blocked: **prepayment credits
  depleted**; top up Gemini credits then re-run `gen-symbols.mjs` (resumable) + optimize.
- **Pictures added to therapy screens** — Word Practice card shows the word's picture above the
  big word; Phrase Builder cubes show each word's picture (white inset on the coloured cube).
- Word Board is **24 cells (4×6)**; cell images flex to fill the boxes.

### Next
- Finish remaining Leda/Sulafat clips + the 491 phrase clips (above).
- Optional: swap pig/chicken animal sounds (currently CC BY-SA) for non-SA if desired.
