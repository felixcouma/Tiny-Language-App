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

Words without a picture now render as a **bold coloured word tile that fills the cell**
(via `components/WordPic.jsx`) — consistent and readable, not bare. Generating real art for
the concrete ones is still nice-to-have:
- **Concrete objects (12)** — the ONLY pending image work: `Plane, Boat, Bike, Motorcycle,
  Helicopter, Mouse, Pencil, Paper, Crayon, Scissors, Glue, Shape`
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

## 1b. Re-record clips whose TEXT changed (deleted → now device-voice, correct text)
When a `say` line changes, its old pre-rendered clip is stale (plays the OLD words). We
deleted those so the device voice reads the CURRENT text; `gen-audio.mjs` will re-record
them (warm voice) automatically since they're now missing. `gen-audio.mjs` now floats
these `number-*` / `home-*` keys to the FRONT (priority sort) so they regenerate first.
Affected:
- **Counting** `number-1..20` (×3 voices) — new "Five silly monkeys!" wording + correct count.
- **Family** `home-sister/brother/grandma/grandpa` (×3 voices) — new "My sister! I love…" lines.
Run after credits are topped up: `GEMINI_API_KEY=$K PACE_MS=6500 node scripts/gen-audio.mjs` (skips existing).

> **BLOCKER (2026-06-10):** TTS is NOT gated by the free daily quota right now — both flash
> models (`gemini-2.5-flash-preview-tts` and `gemini-3.1-flash-tts-preview`) return
> `429 "Your prepayment credits are depleted."` This is the SAME account-level credit block
> that stopped image gen — a daily reset will not clear it. Top up Gemini prepayment credits
> at https://ai.studio/projects, then run the priority batch above. The whole TTS backlog
> (§2) is blocked behind this, not behind the per-day cap.

## 2. TTS phrase + voice clips — resumes on daily quota reset
- Phrase clips ~356/763 done; ~407 phrase + 20 voice (Leda 2 / Sulafat 18) remain.
- ~200/day across the two free flash models → ~2–3 more mornings. Commands in this file's
  sibling notes / `CURRENT_SESSION.md`. The 8am cloud reminder prompts the next batch.
- NOTE: several game-prompt clips changed (action wording "Which one is eating?") and the
  Safari ladders / counting ladders / family lines changed — their old clips are now
  orphaned and the new text will regenerate (device-voice fallback until then).

## 3. Optional / future
- **Music Forest** build-out (richer sound-play + phonics) — wanted once its clips exist.
- **Grid Vocabulary**: could grow the board size / add a "mastered → retire word" mode.
