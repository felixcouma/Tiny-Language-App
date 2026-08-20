# On-demand name voice (serverless TTS) — scope

**Goal.** Speak *any* child's name — not just the baked 200 — in the **same warm Gemini
voice** the parent picked, without shipping every name. First play synthesizes once (needs
network); it's cached forever after, so it plays offline thereafter and costs nothing on
repeat. Keeps the golden rule: **never chime / device-voice a name** — the fallback stays the
gentle "Your turn!".

**Status.** Scoped, not built. Baked 200 (this session) covers the large majority; this is the
long-tail top-up. Blocked on nothing but a decision to build + a Vercel env secret.

## Why not the existing premium path
`src/lib/tts.js` (`premiumSpeak`, ElevenLabs via `VITE_TTS_PROXY_URL`) already synthesizes +
caches on demand — but it's a **different voice** from the baked Aoede/Leda/Sulafat clips, so an
uncommon name would sound noticeably off next to everything else. The whole point here is
**voice match**, which means calling the *same* Google Cloud TTS the bake uses.

## Architecture (one serverless function + two cache tiers)
```
client (audio.js sayName)
  1. baked clip?  sounds/<voice>/phrases/<name>.mp3 → sounds/phrases/<name>.mp3   (offline, free)
  2. Cache Storage hit? (tv-name-tts-v1, keyed name+voice)                        (offline, free)
  3. GET /api/tts?name=Ava&voice=aoede  → Vercel function                         (network, once)
        └─ holds the GCP secret; calls Cloud TTS (gemini-2.5-flash-tts, voice=Aoede,
           text "Ava," — identical params to gen-tts-gcloud.mjs) → returns MP3
        └─ Cache-Control: public, max-age=31536000, immutable  → Vercel CDN caches by URL
           so repeats across ALL users skip the function entirely
  4. neither reachable (offline first-play / no endpoint) → return false → caller says "Your turn!"
```
Voice-match is exact: same model, same voice name, same `"Name,"` calling-comma text, **no style
prompt** (it bled into audio — see the bake). Slug matches `slugify()` so if we later *bake* a
name, tier 1 silently supersedes the synth.

## Endpoint contract — `GET /api/tts`
- **In:** `name` (required), `voice` (aoede|leda|sulafat, default aoede).
- **Out:** `audio/mpeg` on success; `4xx` on bad input; `5xx` on upstream fail. Client treats any
  non-2xx as "couldn't speak" → "Your turn!".
- **GET (not POST)** so the CDN + service worker can cache by URL.

## Security & abuse controls (public endpoint = a cost vector — take seriously)
- **Secret stays server-side.** Vercel env `GCLOUD_TTS_KEY` (a Cloud-TTS-restricted API key) **or**
  `GCLOUD_SA_JSON` (base64 SA key + google-auth-library). Never a `VITE_` var — those ship in the
  public bundle. *Decision: API key is simplest for a serverless fn; SA key reuses the bake's auth.*
- **Input shape:** reject anything but a single name token — `^[A-Za-z][A-Za-z'’-]{0,19}$`. No
  spaces, no sentences → can't be repurposed as a free general-purpose TTS.
- **Length cap** (≤20 chars) bounds per-call cost.
- **Rate limit** per IP (Vercel KV / Upstash, or best-effort in-memory) — e.g. 30/min.
- **Aggressive caching** (immutable Cache-Control) means abuse only pays once per unique string;
  the CDN absorbs repeats.
- Honest note: a client "shared secret" header is *not* real security (public bundle). Shape +
  length + rate-limit + cache is the pragmatic bar.

## Client integration
- New `src/lib/nameVoice.js`: `synthName(name, voiceId)` → Cache-Storage lookup (`tv-name-tts-v1`)
  → `fetch('/api/tts?…')` → cache + play. Endpoint URL defaults to same-origin `/api/tts`
  (Vercel); optional `VITE_NAME_TTS_URL` absolute override for the GitHub Pages demo (needs CORS).
- `audio.js`: add `sayName(name)` = tier 1 baked → tier 2/3 synth → returns `false` if it couldn't
  speak. Keep name synth **name-scoped** (do NOT route generic `voice()` through it — that would
  mask the audio-coverage guard and turn every missing phrase into a billed call).
- `ChoiceGame.jsx`: replace the raw-name push into `voiceSeq` with
  `const spoke = await sayName(name); if (!spoke) await voice('Your turn!')`.
- `canSpeakName(name)` (up-front cue decision) → `hasNameClip(name) || (navigator.onLine &&
  endpointConfigured)`; premium ElevenLabs drops out of the name path (wrong voice).

## Offline behavior (be precise)
"Offline" = **cached after first online play**, not "any never-seen name works offline." A brand-new
name with no network → "Your turn!" that once; next time online it synthesizes + caches; forever
after it's offline. The baked 200 are the true always-offline set — that's why baking the common
names matters.

## Cost
Names are 1–2 words. Cloud TTS Gemini pricing → fractions of a cent each; with immutable CDN
caching each unique name is paid **once, ever**. Even thousands of distinct names ≈ a few dollars.
Negligible on the $300 GCP trial and trivial pay-as-you-go after.

## Guards / tests
- Extend `verify-audio-coverage` reasoning: names are still covered by baked clips; the synth is a
  *supplement*, so the guard is unchanged (baked set must stay complete).
- New `scripts/verify-name-tts.mjs` (in `verify:ui`): mock `/api/tts`, assert (a) a non-baked name
  triggers exactly one fetch then plays from cache on the 2nd call, (b) offline + non-baked → no
  chime, "Your turn!" path taken, (c) bad input (spaces/long) is rejected client-side before fetch.
- Local dev: `vercel dev` (or a tiny Vite middleware) to serve `/api/tts` against the SA key.

## Rollout
1. `api/tts.js` + input validation + voice-match synth (SA or API key). `vercel.json` if needed.
2. `nameVoice.js` + `audio.js sayName` + `ChoiceGame` wiring + `canSpeakName` update.
3. PWA: rely on Cache-Storage (tier 2); optionally add an `/api/tts` runtimeCaching route in
   `vite.config.js` so the service worker also serves it offline.
4. `verify-name-tts.mjs`; set Vercel env; ship. Pages demo: keep graceful fallback (or set
   `VITE_NAME_TTS_URL` + CORS on the function).

## Open decisions
- **Auth:** Cloud-TTS API key (simplest) vs SA key (reuses bake auth). Lean API key.
- **Pages demo:** graceful-fallback only, or cross-origin call to the Vercel function (CORS)?
- **Rate-limit store:** Vercel KV/Upstash (durable) vs in-memory (free, resets per cold start).
