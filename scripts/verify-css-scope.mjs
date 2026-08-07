/*
 * CSS scope guard — catches the class of bug that shipped once: a shared className used in
 * one screen's JSX but DEFINED only in a different screen/component's CSS. When everything
 * was one bundle that worked by accident; with per-screen code-splitting, that other CSS
 * chunk isn't loaded, so the element renders unstyled.
 *
 * Invariant: every static class used in a file's JSX must be defined in the GLOBAL stylesheet
 * (always loaded) or in a CSS file that JSX imports. A class defined only in some *other*
 * file's CSS is a code-split hazard → FAIL.
 *
 * Static base classes only (conditional `is-*` state classes are screen-local by nature and
 * live in their own CSS). Run standalone or via `npm run check`.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(__dirname, '..', 'src')

// Classes that are always present regardless of splitting (global stylesheet + the app
// shell that main.jsx/App.jsx always mount). Extend if a new always-loaded sheet is added.
const GLOBAL_CSS = ['styles/global.css']
// Known-OK exceptions: classes applied by JS/3rd-party or intentionally styled by a parent
// selector rather than their own rule. Add sparingly, with a reason.
const ALLOW = new Set([])

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name)
    const s = statSync(p)
    if (s.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

const files = walk(SRC)
const cssFiles = files.filter((f) => f.endsWith('.css'))
const jsxFiles = files.filter((f) => f.endsWith('.jsx'))

// class -> Set(cssFile) that DEFINES it (comments stripped so a comment mention doesn't count).
const definedIn = new Map()
const rel = (f) => path.relative(path.join(SRC, '..'), f).replace(/\\/g, '/')
for (const f of cssFiles) {
  const css = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '') // strip comments
  for (const m of css.matchAll(/\.(-?[a-z_][\w-]*)/gi)) {
    const cls = m[1]
    if (!definedIn.has(cls)) definedIn.set(cls, new Set())
    definedIn.get(cls).add(rel(f))
  }
}
const globalClasses = new Set()
for (const [cls, set] of definedIn) if ([...set].some((f) => GLOBAL_CSS.includes(f.replace('src/', '')))) globalClasses.add(cls)

// Extract the static class tokens a JSX file uses in className=.
function usedClasses(src) {
  const tokens = new Set()
  const push = (val) => {
    // drop ${...} template expressions, keep the static tokens around them
    for (const t of val.replace(/\$\{[^}]*\}/g, ' ').split(/\s+/)) {
      if (/^-?[a-z_][\w-]*$/i.test(t)) tokens.add(t)
    }
  }
  for (const m of src.matchAll(/className\s*=\s*"([^"]*)"/g)) push(m[1])
  for (const m of src.matchAll(/className\s*=\s*\{\s*`([^`]*)`\s*\}/g)) push(m[1])
  for (const m of src.matchAll(/className\s*=\s*\{\s*'([^']*)'\s*\}/g)) push(m[1])
  return tokens
}
// CSS files a JSX imports (resolved relative to it).
function importedCss(file, src) {
  const out = new Set()
  for (const m of src.matchAll(/import\s+['"](.+?\.css)['"]/g)) {
    out.add(rel(path.resolve(path.dirname(file), m[1])))
  }
  return out
}

export function runCssScopeCheck({ fail, ok } = {}) {
  const report = fail || ((m) => console.error('✗', m))
  const pass = ok || ((m) => console.log('✓', m))
  const hazards = []
  for (const f of jsxFiles) {
    const src = readFileSync(f, 'utf8')
    const own = importedCss(f, src)
    for (const cls of usedClasses(src)) {
      if (ALLOW.has(cls) || globalClasses.has(cls)) continue
      const defs = definedIn.get(cls)
      if (!defs) continue // undefined anywhere → likely dynamic/inline; not a split hazard
      if ([...defs].some((d) => own.has(d))) continue // OK: defined in a CSS this file imports
      hazards.push({ file: rel(f), cls, definedIn: [...defs].join(', ') })
    }
  }
  for (const h of hazards) {
    report(`[css-scope] ${h.file} uses .${h.cls} — defined only in ${h.definedIn} (not global, not imported here); move it to src/styles/global.css or import that CSS`)
  }
  if (!hazards.length) pass(`CSS scope clean (${jsxFiles.length} components, ${definedIn.size} classes) — no code-split style hazards`)
  return hazards.length
}

// Standalone run.
if (process.argv[1]?.endsWith('verify-css-scope.mjs')) {
  const n = runCssScopeCheck()
  if (n) process.exit(1)
}
