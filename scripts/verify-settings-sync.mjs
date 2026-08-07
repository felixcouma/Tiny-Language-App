/*
 * Per-child settings sync guard. CLAUDE.md: a new per-child setting must be added to the
 * seed + loadProfiles() migration + cloud.js so it persists AND syncs. Miss the seed and a
 * new child never gets the field; cloud then writes undefined — silent, no error.
 *
 * Checks (source-level, since store.js touches localStorage at import so can't be required):
 * every key cloud's toChildRow syncs must exist in the child seed (store.js GENERIC_CHILDREN).
 * Best-effort: if the source shape changes so the patterns don't match, it warns (update this
 * check) rather than hard-failing a build.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(__dirname, '..', 'src')
const read = (f) => readFileSync(path.join(SRC, f), 'utf8')

const keysIn = (block) => [...block.matchAll(/(\w+)\s*:/g)].map((m) => m[1])
// cloud toChildRow's `settings: { ... }` — the keys that get written to the cloud.
const cloudSyncedKeys = (src) => {
  const m = src.match(/settings:\s*\{([\s\S]*?)\}/)
  return m ? keysIn(m[1]) : null
}
// The first seeded child object in store.js GENERIC_CHILDREN.
const seedKeys = (src) => {
  const m = src.match(/GENERIC_CHILDREN\s*=\s*\[\s*\{([^}]*)\}/)
  return m ? keysIn(m[1]) : null
}

export function runSettingsSyncCheck({ fail, ok } = {}) {
  const report = fail || ((m) => console.error('✗', m))
  const pass = ok || ((m) => console.log('✓', m))
  const synced = cloudSyncedKeys(read('lib/cloud.js'))
  const seeded = seedKeys(read('store.js'))
  if (!synced || !seeded) {
    pass('per-child settings sync: source shape changed — update verify-settings-sync.mjs (skipped)')
    return 0
  }
  const seedSet = new Set(seeded)
  let n = 0
  for (const k of synced) {
    if (!seedSet.has(k)) {
      report(`[settings] cloud syncs "${k}" but it's missing from the child seed (store.js GENERIC_CHILDREN) — new children won't have it, cloud writes undefined`)
      n++
    }
  }
  if (!n) pass(`per-child settings sync: all ${synced.length} synced keys are seeded`)
  return n
}

if (process.argv[1]?.endsWith('verify-settings-sync.mjs')) {
  if (runSettingsSyncCheck()) process.exit(1)
}
