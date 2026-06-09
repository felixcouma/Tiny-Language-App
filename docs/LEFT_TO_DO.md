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
