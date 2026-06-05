# 💻 Local setup & continuing with Claude Code (Windows / macOS)

Everything lives on GitHub (`main`). Nothing needs manual copying — clone and run.

## 1. Prerequisites (one-time)
- **Node.js 20 LTS** — https://nodejs.org (click the LTS button)
- **Git** — https://git-scm.com (Windows installer also gives you "Git Bash")

Check:
```bash
node -v   # v20.x (or v18+)
git --version
```

## 2. Get the project & run it
**Windows:** open the folder in File Explorer (`C:\Users\<you>\Tiny-Language-App`),
click the address bar, type `powershell`, Enter. **macOS:** open Terminal and `cd` in.

```bash
# first time only — clone (skip if you already have the folder)
git clone https://github.com/felixcouma/Tiny-Language-App.git
cd Tiny-Language-App

git config core.hooksPath .githooks   # enables auto-updating context doc
npm install
npm run dev                           # open the printed http://localhost:5173/
```
Production check: `npm run build` (runs the content check) then `npm run preview`.

## 3. Continue with Claude Code ON your PC (so it can see/run the app)
In a terminal **inside the project folder**:
```bash
npm install -g @anthropic-ai/claude-code
claude
```
Log in when prompted. Then tell it:
> Read `TINYVVOICE_PROJECT_CONTEXT.md` and `CURRENT_SESSION.md`, then continue.

The local session has your files + a real browser, so it can launch the app and
screenshot to verify changes (the cloud sandbox can't reach the web/render).

## 4. Daily git loop
```bash
git pull origin main                  # start of a session
# ...edit / Claude makes changes...
git add . && git commit -m "what changed"
git push origin main                  # auto-deploys the live site
```

## Troubleshooting
- **`npm` not found** → install Node.js (step 1), reopen the terminal.
- **`claude` not found** → re-run `npm install -g @anthropic-ai/claude-code`; reopen terminal.
- **Port 5173 busy** → Vite will pick the next port; use whatever URL it prints.
- **Hook errors on Windows** → harmless; the pre-commit hook just refreshes the
  context doc. You can skip it with `git commit --no-verify` if ever needed.
