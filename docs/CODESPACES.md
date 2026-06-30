# GitHub Codespaces — rebuild & run anywhere (backup build environment)

A [dev container](../.devcontainer/devcontainer.json) so the app can be rebuilt and run from
any browser if the local machine is lost or unavailable. Your **data** is already de-risked by
cloud accounts (Part B); this de-risks the **build environment**.

## Start a Codespace
1. On GitHub: **Code ▸ Codespaces ▸ Create codespace on `main`**.
2. It provisions Node 20 and runs `npm ci` automatically (`postCreateCommand`).
3. Run the app:
   - `npm run dev` — Vite dev server. Port **5173** auto-forwards and opens a preview
     (the config binds `host: true`, so the forwarded URL works).
   - `npm run build` — production build (runs the content `check` first), emits `dist/`.
   - `npm run preview` — serve the production build (port **4173**).

That's all that's needed to **rebuild and run** the committed app.

## Environment variables (optional — only for cloud features)
The app runs **fully local** with no env (no sign-in, no sync) — exactly as on a fresh device.
To exercise the optional cloud/feedback features in a Codespace, provide:

| Var | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL (Part B accounts/sync/trial) |
| `VITE_SUPABASE_ANON_KEY` | Supabase **anon public** key (safe to expose; never the service_role key) |
| `VITE_FEEDBACK_URL` | Parent feedback form link |

Set them either as **Codespaces secrets** (GitHub ▸ Settings ▸ Codespaces ▸ repository secrets)
or by creating a local **`.env.local`** inside the Codespace (gitignored — never committed).

> Magic-link auth in a Codespace: add the forwarded Codespace URL to the Supabase
> **Auth ▸ URL Configuration ▸ Redirect URLs** allowlist, or the login link won't return.

## Asset generation (TTS / images) — extra setup, not needed to run the app
The generators (`scripts/gen-tts-gcloud.mjs`, `scripts/gen-symbols.mjs`) need the **gitignored**
secrets `scripts/gcloud-sa-key.json` and/or `scripts/gemini.key.local`. These are **not** in the
repo by design. To generate assets from a Codespace, re-add them as Codespaces secrets/files —
**never commit them**. Heavy gen libs install with `--no-save` (see `CLAUDE.md`).

## Optional: faster startup
Enable **Codespaces prebuilds** for the repo (Settings ▸ Codespaces ▸ Set up prebuild) so the
`npm ci` step is cached and new Codespaces start in seconds.
