# Generating warm voice clips via Google Cloud TTS

An alternative backend to the AI Studio Gemini scripts (`gen-audio.mjs` / `gen-phrases.mjs`),
for when AI Studio **prepayment credits are depleted**. Same warm voices (Aoede / Leda /
Sulafat), but billed through **Google Cloud** — a completely separate billing path.

Script: `scripts/gen-tts-gcloud.mjs`. Cloud TTS returns MP3 directly (no lamejs step) and
writes to the exact same paths the app reads, so it's a drop-in.

## Cost reality (read first)
- **Gemini-TTS voices (Aoede/Leda/Sulafat) on Cloud TTS have NO free tier** — token-billed
  (~$10 / 1M audio tokens). The entire remaining backlog is only a few minutes of audio, so
  this is roughly **a dollar or two total**, and a **new GCP project's $300 / 90-day free
  trial covers it completely**.
- The **free** Cloud TTS option is **Chirp 3 HD** (1M chars/month free) — but it's a
  *different* voice, so it means re-recording a folder. Use `GOOGLE_TTS_MODE=chirp` +
  `--force` if you'd rather go free and accept a new voice. (Chirp has no `leda`/`sulafat`
  personas; stand-ins are mapped in the script.)

## One-time setup
```bash
# 1. Pick/create a Google Cloud project with billing enabled (the $300 trial counts).
# 2. Install the gcloud CLI, then:
gcloud auth application-default login                       # opens a browser; grants local ADC
gcloud auth application-default set-quota-project YOUR_PROJECT_ID
gcloud services enable texttospeech.googleapis.com         # enable the API on the project

# 3. This repo needs the auth client (heavy lib, not in package.json):
npm install google-auth-library --no-save
```
The script uses Application Default Credentials, so no API key or service-account file is
needed — ADC auto-refreshes, so long batches won't expire mid-run.

## Run it
Priority order matches our action list — counting + family re-records float to the front
automatically:
```bash
node scripts/gen-tts-gcloud.mjs                 # voice clips (aoede/leda/sulafat); number-*/home-* FIRST
node scripts/gen-tts-gcloud.mjs --kind phrases  # the ~770 phrase clips (single Aoede folder)
```
Useful flags / env:
- `--voices aoede` — one persona only
- `--only number-5` — a single key (all selected voices)
- `--force` — regenerate existing files
- `TTS_MODEL=gemini-3.1-flash-tts-preview` — newer preview model (default `gemini-2.5-flash-tts`)
- `PACE_MS=600` — delay between calls (Cloud TTS has no 10-req/min cap, so this can be small)
- `GOOGLE_TTS_MODE=chirp` — use the FREE Chirp 3 HD voices instead (pair with `--force`)

Resumable: skips existing files; stops early on a billing/quota/permission error.

## After generating
```bash
npm run build                                   # content checks + bundle
git add public/sounds && git commit && git push # deploy via the Pages action
```

## Note on counting pace
For `number-*` clips this backend adds a sing-song "count slowly, pause between each number"
style prompt (Gemini-TTS only) — matching the slower device-voice fallback already shipped,
so the warm clip and the fallback sound consistent.
