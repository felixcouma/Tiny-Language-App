# Left To Do

> Tracked backlog of things deliberately deferred (mostly blocked on credits/quota).
> When ready, do the steps below and commit.

## 1. Remaining Word Board / vocabulary images (25) — BLOCKED: Gemini credits depleted
Image generation stopped with **"Your prepayment credits are depleted."** These 25 words
still show as text-only on the Word Board / Word Practice / Phrase cubes (they hide their
image gracefully until art exists):

`Nine, Ten, Want, Where, Plane, Boat, Bike, Motorcycle, Helicopter, Mouse, Bunny, Pencil,
Paper, Crayon, Scissors, Glue, Shape, Day, Night, Morning, Afternoon, Today, Now, When, After`

**When credits are topped up** (≈ $1 for these 25, image model ~$0.039 each; image RPD is
1,000–2,000/day so no rate concern), run — it's resumable and skips the ~162 already done:
```bash
K=$(tr -d '\r\n' < scripts/gemini.key.local)
GEMINI_API_KEY=$K node scripts/gen-symbols.mjs        # generates only the missing ones
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
