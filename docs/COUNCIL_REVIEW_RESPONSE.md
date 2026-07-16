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

---

# Competitive Review — 2026-07-15 (vs. the top-5 toddler speech apps)

> The council was re-run in **comparative** mode against current (2025–26) market research on
> **Speech Blubs · Khan Academy Kids · Otsimo · Lingumi · Proloquo2Go** (see the refreshed
> `tools/council/council.js` context). Below is the code-grounded response: what's a real gap vs.
> what the council couldn't see is already built. Measured against the same standing principles above.

## How we compare (council consensus, grounded)
- **WIN — multi-child / twin on one device.** Renamable per-child profiles, per-child voice / songs /
  screen-time / stage / `focusWords`, cooperative (no-winner) Twin Mode. **None** of the top-5 do this
  (they treat 2 kids as an account problem). Structural moat — protect it.
- **WIN — warm pre-rendered voice + offline.** 3 named voices, no-robotic-voice guarantee, chime
  fallback, StaleWhileRevalidate self-heal. Speech Blubs leans on live mic ASR, Otsimo on brittle ML
  scoring; we have sub-tap-latency audio offline. The whole top-5 are native store apps — our **PWA +
  free web demo** is a structural differentiator none of them have.
- **WIN — expectant pause as a per-child, research-named parameter** (Dunst & Trivette). No competitor
  operationalizes child-responsive *timing* at the interaction layer.
- **PARITY — clinical scaffolding.** Otsimo matches our depth (worse UX); we're ahead of Khan/Speech
  Blubs/Lingumi on articulation intent.
- **BEHIND — caregiver "why" + structured targets.** Speech Blubs' Parents' Academy and Otsimo's
  per-drill caregiver rationale + weekly plan out-communicate us to the adult who keeps the app on the
  tablet. This is the one real, closable gap.

## ✅ Accept (cheap, on-brand, all reuse state we ALREADY store)
1. **Twin divergence nudge** — a single plain-language, parent-facing card derived from existing
   per-child `byWorld`/`seen`/`lastSeen` (*"Mia explored 3 new worlds this week; Leo hasn't visited
   Animals yet — try it together"*). Cheap (read-only derivation + a conditional card in the already-
   gated parent area). **Uniquely ours** — turns the twin architecture from a setup convenience into a
   therapeutic signal for the asymmetric-twin parent (one late talker). No scores/ranking — a
   cooperative suggestion. **Highest leverage-to-bloat ratio in the whole review.**
2. **"What to say at home" focus-word card + focus-first Auto Play** — `focusWords` already exist,
   are already prioritized in `today.js buildTodaySession`, and already surface on the Word Board; the
   gap is (a) Learning-screen **Auto Play still walks raw world order**, not focus-first, and (b) there's
   no plain-language parent prompt per focus word (*"When you pour juice, say 'more juice' and wait"*).
   This is aided language input in the natural environment (Goossens/Drager) and closes Otsimo's
   structured-targets gap **without** a therapist dashboard. Cheap–medium (mostly wiring existing state).
3. **Surface the "why" on the therapy toggles** — the expectant pause and voice choice are clinically
   meaningful but unlabeled; one line of rationale in the parent area converts baked-in science into
   parent-legible value. Closes the Parents'-Academy gap at ~0 build cost (copy only).

## 🔁 Reframe (right worry — partly already built; adjust the fix)
- **"Word Board is static / not adaptive" (Iris)** — partly wrong about the code: `today.js` already
  prioritizes `focusWords` and sorts by **least-recently-seen**, and focus words already surface on the
  board. Kernel: that adaptivity isn't reflected in **Auto Play order** or made **legible** (no visible
  "focus" chip). Fix = wire focus-first + show it, not build a new adaptive engine.
- **"No spaced retrieval" (Dr. Sofia)** — partly built: `lastSeen` already drives least-recently-seen
  ordering in the adaptive session. Reframe to a light **revisit weighting** for near-mastered words,
  not a new scheduler.
- **"Usage-signal SW cache prioritization" (Marcus)** — valuable but an evolution of the already-logged
  **cache-budget** item (`maxEntries: 900` vs ~3,000 clips, `LEFT_TO_DO §12`). Do the cheap budget tune
  first; defer the per-child SW warm-queue rewrite. Medium, not urgent.

## ❌ Decline (conflicts with principles — council mostly agrees)
- **Live ASR / mic imitation scoring** (Speech Blubs' moat) — brittle on toddler speech, latency-heavy,
  and a scoring mechanic that breaks *no scores/streaks*. Don't chase their moat; win on the gaps.
- **Streaks / achievements / daily-unlock gamification** (Khan, Lingumi) — violates *no scores/streaks*.
- **Full therapist dashboard with formal assessment** (Otsimo scope) — that's a clinical platform, i.e.
  bloat. The two "targets"/"what-to-say" cards give therapist-*useful* without therapist-*dependent*.

## 📌 Validated limitation (agree, future — keep the pilot lean)
- **No therapist identity / pilot handoff** (Iris red flag): no in-app therapist onboarding or shareable
  session summary, and the 30-day trial banner is an ambiguous handoff moment in an SLP-recommended
  install. Real for adoption, but a larger build — note as future; don't add a therapist portal now.

## Verdict
The moat is real and *structural* — the unclaimed intersection of **multi-child/twin + warm offline
voice + expectant pause + no-scores + PWA** is exactly where a small focused app wins, and no top-5 app
holds it. The edge doesn't come from new surfaces; it comes from **making state we already store speak
to the parent**: (1) the twin divergence nudge, (2) focus-word "what to say at home" + focus-first Auto
Play, (3) one-line "why" on the therapy toggles. Skip ASR, streaks, and a clinical dashboard — those
add bloat and erode the no-pressure brand the pilot is built on.
