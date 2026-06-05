# 🎙️ Premium natural voice — setup (≈10 minutes)

This swaps the robotic device voice for a warm, lifelike voice (ElevenLabs).
Because the app is **public**, we keep your API key on a tiny free **Cloudflare
Worker** instead of inside the app, so nobody can steal it. Clips are cached on
each device, so it's fast and very cheap after the first play.

> Prefer the quickest possible local test instead? Skip to **"Local-only quick test"** at the bottom.

---

## Step 1 — Get an ElevenLabs API key
1. Make a free account at https://elevenlabs.io
2. Profile → **API Keys** → copy your key.
3. (Optional) Pick a voice you like under **Voices** and copy its **Voice ID**.
   A warm default is already set if you skip this.

## Step 2 — Create the Cloudflare Worker (free, no card)
1. Sign up at https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Create Worker**.
2. Give it a name (e.g. `tinyvoice-tts`) → **Deploy** (the default code is fine for now).
3. Click **Edit code**, replace everything with the contents of
   [`infra/tts-worker.js`](../infra/tts-worker.js) in this repo, then **Deploy**.

## Step 3 — Add your key as a secret
In the Worker → **Settings → Variables**:
- Add **Secret** `ELEVENLABS_API_KEY` = *your key*
- (Optional) Add **Variable** `ELEVENLABS_VOICE` = *your voice id*
- (Optional) Add **Variable** `ALLOW_ORIGIN` = `https://felixcouma.github.io`
- **Save and deploy.** Copy the Worker URL (e.g. `https://tinyvoice-tts.<you>.workers.dev`).

## Step 4 — Point the app at the Worker
Tell the deployed site the Worker URL via a build-time variable named
`VITE_TTS_PROXY_URL`. Two options:

**A. Easiest — paste it into the deploy workflow.** In
`.github/workflows/deploy.yml`, the build step can pass it through. Tell me the
Worker URL and I'll add it (it's not secret — only the key is).

**B. Local `.env`.** Copy `.env.example` → `.env`, set
`VITE_TTS_PROXY_URL=https://…workers.dev`, run `npm run dev`.

That's it — the app now speaks with the premium voice and falls back to the
device voice automatically if the Worker is ever unreachable.

---

## Cost & caching
- Each unique word/phrase is synthesized **once per device**, then cached
  (Cache Storage API). Re-plays cost nothing.
- The app's vocabulary is small and short, so typical usage sits comfortably in
  free/low tiers.

## Local-only quick test (not for the public site)
Copy `.env.example` → `.env`, set `VITE_ELEVENLABS_KEY=…` (and optionally
`VITE_ELEVENLABS_VOICE`), then `npm run dev`. This calls ElevenLabs directly from
your browser — fine on your own machine, but **don't** ship it to the public site
(the key would be visible). Use the Worker for the live site.
