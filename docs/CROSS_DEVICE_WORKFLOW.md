# 🔄 TinyVoice: Cross-Device Development Workflow
**Quick Reference for GitHub-Based Development Across Devices**

---

## ⚡ TL;DR — The Essential Commands

### Before Leaving a Device (Save Your Work)
```bash
cd ~/tinyvvoice
git add .
git commit -m "Your brief description here"
git push origin main
```

### Arriving at a New Device (Get Latest Code)
```bash
# First time only:
git clone https://github.com/yourname/tinyvvoice.git
cd tinyvvoice
npm install

# Every other time:
cd ~/tinyvvoice
git pull origin main
```

**That's it!** You're now at the latest code + all documentation.

---

## 🔄 Full Workflow Guide

### Scenario 1: Working on PC, Switching to Laptop

**Step 1: Finalize on PC**
```bash
cd ~/tinyvvoice

# See what changed
git status

# Stage all changes
git add .

# Commit with meaningful message
git commit -m "Add HomeScreen component with color palette"

# Push to GitHub
git push origin main
```

**Step 2: Start on Laptop**
```bash
# If first time on this device:
git clone https://github.com/yourname/tinyvvoice.git
cd tinyvvoice
npm install

# If you've already cloned before:
cd ~/tinyvvoice
git pull origin main
```

**Step 3: Continue Coding**
```bash
# You now have all latest code + all documentation
# Read /TINYVVOICE_PROJECT_CONTEXT.md for instant design context
# Claude Code can reference it directly
```

### Scenario 2: Back to Original Device (Sync Latest Changes)

**Step 1: Pull Latest Code**
```bash
cd ~/tinyvvoice
git pull origin main
```

**Step 2: Install Any New Dependencies (if needed)**
```bash
npm install
```

**Step 3: Check What's New**
```bash
git log --oneline -5
# Shows last 5 commits, see what you worked on
```

---

## 📝 Commit Message Best Practices

### Good Commit Messages (Be Specific)
```bash
git commit -m "Build HomeScreen component with 6 category cards"
git commit -m "Implement SoundGame celebration animation (confetti)"
git commit -m "Update v4 learning framework: add twin mode"
git commit -m "Add Unsplash API integration for animal photos"
git commit -m "Fix wobble animation timing (incorrect answer)"
```

### Bad Commit Messages (Too Vague)
```bash
git commit -m "stuff"
git commit -m "changes"
git commit -m "fix"
git commit -m "update"
```

**Why?** When you switch devices, your commit history tells you what you were building. Good messages = faster context recovery.

---

## 🛠️ Setup for Success (One Time)

### 1. Add `.gitignore` to Your Repo
Create file: `tinyvvoice/.gitignore`

```gitignore
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
.next/
out/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Temporary files
.cache/
.temp/
temp/
```

Then commit it:
```bash
git add .gitignore
git commit -m "Add .gitignore for Node/React projects"
git push origin main
```

**Why?** This prevents accidental commits of files you don't want (node_modules, IDE settings, etc.)

### 2. Create `CURRENT_SESSION.md` (Optional but Helpful)
Create file: `tinyvvoice/CURRENT_SESSION.md`

```markdown
# Current Session Tracking

## Last Session (PC) — June 2026
**Date**: June 15, 2026  
**Device**: PC  
**Time**: 2 hours

### What I Built
- HomeScreen component with 6 category cards
- Integrated Tailwind CSS color palette
- Set up Howler.js audio player

### What I Tested
- Category card tap interactions
- Color rendering on mobile (375px)
- Audio playback across browsers

### What I Found
- Animation timing feels good (0.4s ease-out)
- Color contrast passes WCAG AA
- TODO: Test on actual tablet device

### Next Steps
1. Build SoundGame choice buttons
2. Implement celebration animation
3. Test with actual twins (critical!)

### Blockers
- None yet, smooth sailing!

### Code Quality
- ✅ All components documented with JSDoc
- ✅ Component props are typed (TypeScript)
- ✅ Accessibility checked (ARIA labels added)
```

Update this before you commit/push, so the next device knows exactly where you left off.

```bash
# Edit CURRENT_SESSION.md with your notes
git add CURRENT_SESSION.md
git commit -m "Update session notes before device switch"
git push origin main
```

---

## 🎯 Typical Daily Workflow

### Morning (Switching to New Device)
```bash
# Get to your project
cd ~/tinyvvoice

# Fetch latest changes
git pull origin main

# Check what you were working on
cat CURRENT_SESSION.md

# Open in your editor
code .
# or
npm run dev
```

### Throughout the Day
```bash
# Make changes, test locally
# Build components, write code

# Every couple hours, save progress
git add .
git commit -m "Progress: [what you just built]"
git push origin main
```

### Evening (Before Switching Device or Ending Session)
```bash
# Update session notes
# Edit CURRENT_SESSION.md with:
# - What you built today
# - What to work on tomorrow
# - Any blockers

# Final commit
git add .
git commit -m "Final commit: [summary of today's work]"
git push origin main

# Verify it's on GitHub
git log --oneline -3  # Should show your commits
```

---

## 🔗 File Structure (What's in Your Repo)

```
tinyvvoice/
├─ .git/                              ← Git history (auto-managed)
├─ .gitignore                         ← Files to ignore
│
├─ TINYVVOICE_PROJECT_CONTEXT.md      ← Design/tech reference
├─ CURRENT_SESSION.md                 ← Session notes
├─ CROSS_DEVICE_WORKFLOW.md          ← This file!
│
├─ TinyVoice_MasterBlueprint.md        ← Full design docs
├─ TinyVoice_WireframeSystem.md        ← Wireframes & specs
├─ TinyVoice_RealAssetsGuide.md        ← Asset sourcing
├─ TinyVoice_ContentDatabase.csv       ← All 155+ words
├─ TinyVoice_Twins_v4_Masterplan.md   ← Learning framework
│
├─ src/                               ← React source code
│  ├─ components/
│  │  ├─ HomeScreen.jsx
│  │  ├─ LearningScreen.jsx
│  │  ├─ SoundGameScreen.jsx
│  │  └─ ...
│  ├─ hooks/
│  ├─ store/                          ← zustand state
│  ├─ utils/
│  └─ App.jsx
│
├─ public/                            ← Static assets
│  ├─ sounds/                         ← MP3 files (when sourced)
│  └─ images/                         ← When cached locally
│
├─ package.json                       ← Project dependencies
├─ package-lock.json
├─ tailwind.config.js                 ← Design tokens
├─ .env.example                       ← Template for .env
└─ README.md                          ← Project overview
```

---

## ⚠️ Troubleshooting

### "Git says I have uncommitted changes"
```bash
git status  # See what's different
git add .
git commit -m "Save current work"
git push origin main
```

### "Pull conflicts - two devices edited same file"
```bash
# GitHub will tell you which files conflict
# Open those files and manually merge changes
# Then:
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

### "I forgot to commit before switching, and lost code"
```bash
# If it was pushed to GitHub earlier, it's safe
git log --all --full-history  # Search history
git reflog                      # Last 30 actions

# If not pushed, code may be lost locally
# Best prevention: commit frequently + push daily
```

### "npm install fails on new device"
```bash
# Make sure Node.js is installed (v16+)
node --version

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# If still failing, check package.json for typos
```

---

## ✅ Daily Checklist Before Device Switch

- [ ] All code changes committed (`git status` shows clean)
- [ ] Code is pushed to GitHub (`git push origin main`)
- [ ] CURRENT_SESSION.md updated with progress
- [ ] No uncommitted files left locally
- [ ] README or session notes explain next steps

---

## 🚀 Pro Tips

### Tip 1: Push Frequently
```bash
# Don't wait until end of day
git commit -m "Feature: [specific thing]"
git push origin main
# Do this every 1-2 hours
```

### Tip 2: Use Descriptive Branch Names (Optional)
```bash
# Once you get comfortable, try feature branches:
git checkout -b feature/sound-game-celebration
# Work on this feature
git push origin feature/sound-game-celebration
# Then merge back to main when done
```

### Tip 3: Check GitHub Web Interface
Visit github.com/yourname/tinyvvoice
- See your commits
- Browse files
- Check if everything is pushed
- Open pull requests (when you add branches)

### Tip 4: Tag Important Milestones
```bash
# After completing a major feature:
git tag -a v1.0-homescreen -m "HomeScreen component complete"
git push origin v1.0-homescreen
# Helps you remember what was built when
```

---

## 📞 Quick Reference Commands

| Task | Command |
|------|---------|
| **See current status** | `git status` |
| **See recent commits** | `git log --oneline -10` |
| **Commit + Push** | `git add . && git commit -m "msg" && git push` |
| **Pull latest** | `git pull origin main` |
| **Undo last commit** | `git reset --soft HEAD~1` |
| **See what changed** | `git diff` |
| **Switch devices safely** | Commit + Push on old device, Pull on new device |

---

## 🎯 Remember

1. **Commit before switching devices** — It's your safety net
2. **Push to GitHub** — Your single source of truth
3. **Update CURRENT_SESSION.md** — Your memory across devices
4. **Reference /TINYVVOICE_PROJECT_CONTEXT.md** — Instant design context anywhere
5. **Pull when arriving** — Latest code is always one command away

**GitHub = Your safety net. Commit = Your insurance. Push = Your backup.**

---

**Document Created**: June 2026  
**Last Updated**: [Update this when you improve the workflow]  
**Version**: 1.0

