# Agent Council (standalone tool)

An internal review tool — **not part of the TinyVoice app or its build/deploy**. It runs a
panel of "council" personas (Product, Tech, Learning Science, Parent UX) + a Grandmaster
synthesis over the project context, with an interactive "reconsider with feedback" mode.

## Run
```bash
cd tools/council
npm install                 # installs its own deps (kept out of the app's package.json)
npm start                   # → http://localhost:5000
```

Requires `ANTHROPIC_API_KEY` in the **repo-root `.env.local`** (gitignored). The script
resolves that path regardless of where you run it from.

## Notes
- Uses the Anthropic API (`claude-sonnet-4-6`) — each run costs tokens.
- The embedded `projectContext` in `council.js` is a hand-maintained summary and may lag the
  real codebase; treat its output as an outside-in critique, cross-checked against
  `docs/COUNCIL_REVIEW_RESPONSE.md`.
- Its `node_modules/` is gitignored (root `.gitignore` `node_modules` rule matches nested).
