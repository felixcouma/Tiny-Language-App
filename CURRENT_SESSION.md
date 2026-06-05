# Current Session Tracking

> Update before commit/push so the next device/session knows where things stand.
> Full state: `TINYVVOICE_PROJECT_CONTEXT.md`.

## Last Session — 2026-06-05 · Branch `main` · Live: https://felixcouma.github.io/Tiny-Language-App/

### Built this session (v5 → v5.1 → bug fixes)
- Cartoon UI shell (sky + globe + Pip mascot + chunky Auto Play/arrow/round buttons).
- Auto Play, persisted Mute, Parent voice picker; premium ElevenLabs voice wired
  (via secret-keeping Cloudflare Worker — needs Worker URL to activate).
- Real photos (Wikimedia) in cartoon frame; no emoji.
- Revamped Rainbow/Counting/Music visuals; Listening Game + Twin Mode; Parent Dashboard.

### 🐞 Layout bugs fixed (the "nothing visible" reports)
1. **Background globe rendered in-flow** — a `.home2 > * { position:relative }` rule
   was overriding `.scene-globe { position:absolute }`, so the ~700px globe pushed
   all content off-screen. Fixed with `:not(.scene-globe)` + re-asserted absolute.
   (Same fix applied to Learning.)
2. **Shell clipped tall screens** — Parent Dashboard overflowed with no scroll.
   Shell is now a definite-height `overflow-y:auto` scroll container.
3. **Confetti overlay** had the same `.game > *` clobber → excluded `:not(.confetti)`.

### Guardrails added
- `scripts/check-content.mjs` (npm `check`, runs as `prebuild` + in CI):
  validates 7 worlds / 97 items / counting 1..20 / colour swatches / game-pool size.

### ✅ Please verify AT YOUR DESK (I can't render in this sandbox — browser CDNs are blocked)
- [ ] **Home** shows from the top: "TinyVoice" + ••• → Pip + "What shall we learn?"
      → 7 world cards → Listening Game / Twin Mode (globe is just a hill behind).
- [ ] **••• Parent Dashboard** scrolls through stats → "Choose the voice" → tip → Reset.
- [ ] A **world** (e.g. Safari) shows photo + word, speaks, Auto Play advances, arrows work.
- [ ] **Listening Game**: tapping the right photo bursts confetti over the tiles.

### Next (after you confirm layout is good)
- Send the **Cloudflare Worker URL** → I switch on the natural voice.
- Tell me any **photos to swap**.
- Optional: cartoon-theme the Parent Dashboard; ABC phonics world; story/auto-play mode.
