# TinyVoice — Next Builds (action plan)

> **This doc is the source of truth for what we ship next.** It marries the genuinely useful
> council concepts with project reality (I override external reviews where they're wrong about the
> code). Ordered by value × on-brand × low-dependency. Updated 2026-08-25.
>
> **Settled (not up for debate):** billing binned this pilot · no scores/streaks/pressure · no
> withholding / "communicative temptation" · no therapist dashboard · routines already discoverable.

---

## 🟢 Sprint 1 — The parent wrapper (ship next; no external deps, all on-brand)

The one thing all reviews + I agree on: the pedagogy is strong; the wrapper that keeps parents
present is thin. These three are parent-facing, cheap, and need nothing external.

### 1. Parent value-prop onboarding (before setup) — ✅ SHIPPED (2026-08-25, `cae54cd`/`b2600b8`)
- **What:** a 3-screen parent intro shown on a fresh device **before** "how many children?".
  Order (my call — lead *universal*, not Twin, so single-child families aren't alienated):
  1. **Universal:** "First words, out loud." — the warm-voice / speech-first promise.
  2. **Twin (inclusive):** "Two little ones? They play together — no rivalry." (delights 2-child
     families, excludes no one).
  3. **Credibility:** "Built with speech therapists — more than flash cards."
- **Why:** first-session dropout is the most predictable pilot leak. `ONE_PAGER.md` copy exists but
  isn't in-app. Council #1; I agree.
- **Grounding:** the current `Onboarding.jsx` is a *child* coach overlay shown *after* setup — keep
  it. Add a new pre-setup parent sequence (own gate, e.g. `tv_seen_intro`); Skip always available.
- **Assets:** Pip + existing art only. **Size: M.** No audio needed (parent reads it).
- **Done when:** fresh device → 3 parent screens → setup → child coach-marks; returning device skips.

### 2. Sharpen "A Tip for Today" → a specific daily word + micro-action — ✅ SHIPPED (`63bedb7`)
- **What:** resolve the dashboard tip to ONE concrete thing tied to real signals — a word from the
  child's **`focusWords`** (parent-pinned therapy words) or the **weekly favourite world's** vocab,
  plus a tiny action: *"Try 'more' at snack today."* Fall back to the current strategy tip when no
  focus words are set.
- **Why:** council reframe — the tip card already renders above the fold; make it *actionable*, not
  generic. There is **no "scene of the day"** to tie to (scenes rotate 2/random), so we hook the
  data we already have (`focusWords`, `progress.week`). Content/logic only.
- **Size: S.** **Done when:** a child with focus words sees a specific word+action; without, the
  warm generic tip.

### 3. Per-child "readiness" card (Parent Dashboard) — ✅ SHIPPED (`0b954ec`) · Sprint 1 COMPLETE
- **What:** when a child's `phraseLevel` / `progress.seen` shows they're ready to move word→phrase,
  a celebratory, forward-looking card: *"[Name] is starting to put words together — here's one thing
  to try this week."* **Never references a sibling.** Works for 1 *or* 2 children.
- **Why:** the strongest unbuilt clinical idea; data already exists per child. Council's twin-
  divergence, reframed to readiness-not-deficit (their refined framing, which is better + on-brand).
- **Size: M.** **Done when:** a word-stage child near the phrase threshold shows the card; a phrase-
  stage or early child doesn't; no comparison language anywhere.

---

## 🟡 Sprint 2 — Frictionless return

### 4. Sign-in friction: email OTP code + longer expiry
- **What:** switch magic-link sign-in to a **6-digit email OTP code** (type the code — no "opened in
  the wrong browser/phone" failure) and raise the OTP/link expiry (Supabase dashboard config).
- **Why (I override the council here):** their "persistent session + PIN" fix is **already 90%
  done** — `supabase.js` has `persistSession: true` + `autoRefreshToken: true`, so on-device re-entry
  already works. The real residual friction is *first sign-in link expiry / wrong browser*, which a
  PIN doesn't solve and an OTP code does. No new auth surface.
- **Size: S–M** (client flow + Supabase config). **Done when:** a parent can sign in by typing a
  code from any browser; expired-link dead-ends are gone.

---

## 🔵 Needs a decision from you (then I build — can run parallel to Sprint 1)

### 5. On-demand name TTS (voice-matched, serverless)
- Scoped in `docs/NAME_TTS_ONDEMAND.md`. **Decide:** Cloud-TTS **API key vs SA key** (I lean API
  key). Then: `/api/tts` Vercel function + `nameVoice.js` client + Cache-Storage tier. Unblocks *any*
  child name and removes the commit-per-name bottleneck (the SaaS-scale escape hatch Marcus flags).
- **Size: M.**

### 6. Domain + pilot tracking
- Scoped in `docs/DOMAIN_AND_PILOT_TRACKING.md`. **Decide:** domain name (you action the registrar),
  gate = invite-codes vs Cloudflare Access, device-cap, live-count y/n. Then: Cloudflare Web
  Analytics (free, no-PII) + invite-code device-cap + activation ledger.
- **Size: M** after decisions.

---

## 🚦 GATE — before onboarding real families with cloud sign-in
**Publish a Privacy Policy first.** By default the app collects nothing (fully local), but the
optional cloud-sync path stores **parent email + child display name + progress** (Supabase). That
makes a privacy policy necessary the moment a real family opts in — especially as a children's app
(COPPA / GDPR-K). Draft scaffolded in **`docs/PRIVACY_AND_TERMS_DRAFT.md`** (accurate to the code) —
fill placeholders, legal-review, render as an in-app page linked from the grown-ups area + the
sign-in step. Full ToS defers to commercial; the privacy policy does **not**. **Do not invite real
cloud sign-ups until this is live.**

## ⚪ Later / infra (real, not urgent — do when it bites)
- **CDN asset offload** — the committed-binary repo grows; songs (~29 MB) first. Move `/sounds/`
  (esp. songs) to a bucket/CDN behind the same stable URLs. Bigger infra; not pilot-blocking.
- **Supabase offline-merge / conflict policy** — required *before* any real-time sync (`LEFT_TO_DO
  §13`). Do not add real-time sync without it.
- **Pin the `--no-save` generators** or document a one-line reinstall — the mutual-prune fragility is
  real dev friction (not production).
- **Optional gentle pedagogy:** a "Pip taps the board" aided-language overlay during routine
  narration (models symbol-select-while-speaking). On-brand *only* because it's demonstration, not
  withholding. Nice-to-have, not sprint.

---

## Explicitly NOT building (declined)
- Billing / paywall / pricing page (owner: binned this pilot).
- Withholding / communicative-temptation mechanics (violates no-pressure).
- Child-facing scores / mastery bars / leaderboards / therapist dashboard.
- "Move routines into home nav" — already the 2nd Home button.

## Recommended path
**Ship Sprint 1 in order (1 → 2 → 3)** — it's the highest-leverage, fully-in-our-control work and
directly answers "keep parents present long enough to trust the engine." Kick off the **#5 name-TTS
decision** in parallel so it's building while Sprint 1 lands. Sprint 2 + domain follow.
