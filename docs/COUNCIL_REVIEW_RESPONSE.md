# Council Review — Response & Decisions

> A code-grounded response to the "TinyVoice Twins Agent Council" review(s). The council
> analysed the product **without access to the codebase**, so this doc separates genuine
> signal from claims that are wrong about the actual implementation, and records what we
> accept / reframe / decline. Written 2026-07-01. Companion to `docs/LEFT_TO_DO.md`.

## Standing principles this is measured against
- **No scores / streaks / pressure** — growth is surfaced to *parents*, never as a child-facing scoreboard.
- **Speech-first, warm pre-rendered voice; missing clip → soft chime, never the device voice.**
- **Stable asset URLs** — re-recording a clip/image at the same path self-heals via `StaleWhileRevalidate`.
- **Real illustrations (WebP), not photos; no emoji; no synthetic placeholders.**

## ✅ Accept (valuable, on-brand, mostly cheap)
1. **Audio integrity is a quality gate** — replace the duck quack + add the 5 missing FX
   (Snake/Owl/Wolf/Goose/Crow). Elevated from "optional" to priority. `LEFT_TO_DO §4`.
   *(Blocked on ear-auditioned CC audio — Claude can't hear; owner sources the files.)*
2. **In-session parent progress line** — a single end-of-session, **parent-facing** line
   ("Today: 3 new words · 2 phrases"). No dashboard rebuild; closes the passive caregiver
   feedback loop the whole council flags. **Must not be a child-facing score.** `LEFT_TO_DO §9`.
3. **Karaoke lyric highlighting = P1 of the songs upgrade** — highest per-screen ROI; it's
   the auditory-visual binding for 2–3yos. `docs/SONG_ANIMATIONS_SCOPE.md`, `LEFT_TO_DO §6`.
4. **Cooperative "we did it" moment (no winner)** — shared twin payoff after turn-taking.
   Real twin differentiator; on-brand celebration. `LEFT_TO_DO §10`.
5. **Expectant pause (optional)** — a 3–5s "communicative opportunity" delay before the
   Learning Screen auto-speaks (Dunst & Trivette responsiveness). Parent toggle, default off
   so the frictionless launch stays available. `LEFT_TO_DO §11`.

## 🔁 Reframe (right worry, wrong fix)
- **"Hash-based TTS asset manifest / content-hashed filenames"** — declined as prescribed:
  content-hashing `/sounds/` filenames **breaks our deliberate stable-URL self-heal** and adds
  manifest-lookup complexity (Vite already hashes JS/CSS). The real kernel is a **cache budget**:
  the `/sounds/` runtime cache is capped at `maxEntries: 900` while we have **~3,000 clips**, so
  least-recently-used clips evict and re-fetch on next play (graceful → chime if offline). Fix =
  **document the budget + consider raising `maxEntries`**, not a manifest rebuild. `LEFT_TO_DO §12`.

## ❌ Decline (conflicts with the code or our principles)
- **"Fix TTS graceful degradation, it's undocumented/untested"** — already solved: the playback
  fallback (chosen voice → Aoede default → soft chime, never device voice) is a golden rule.
- **Child-facing mastery indicators / progress bars** — violates *no scores/streaks/pressure*.
  Note the council **contradicts its own Quality Gate** ("no competitive scoring of any kind").
  Growth stays parent-facing (dashboard "words mastered" + the new in-session line).
- **Prior council's "Howler.js / serving PNGs / photographs"** — factually wrong: no Howler
  (custom `audio.js`), assets are WebP, visuals are illustrations by design.

## 📌 Validated known limitation (agree, future work)
- **Supabase offline-merge / conflict resolution before heavier sync ships.** Part B reconcile
  is intentionally pilot-simple (cloud-wins on fresh sign-in, else push local). Fine at pilot
  scale; a real merge is future work. **Do not add real-time sync without documented conflict
  resolution.** `LEFT_TO_DO §13`.

## Verdict
Priority instincts (audio integrity + caregiver feedback loop) are right; the one infra
prescription (hash manifest) is wrong for this codebase and is swapped for a cache-budget tune;
the mastery-indicator push is rejected on principle. Highest-leverage cheap action both docs
converge on and that ships today: the **in-session parent progress line**.
