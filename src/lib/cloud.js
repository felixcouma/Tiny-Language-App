import { supabase } from './supabase'

/*
 * Cloud sync (Part B). Offline-first: localStorage stays the source of truth for
 * the child UI; this layer mirrors the active parent's children + per-child
 * progress to Supabase so it survives a reinstall and follows them to a new
 * device. Sign-in is optional and lives in the (gated) Parent area.
 *
 * Reconciliation policy (pilot-simple, recovery-first):
 *  - Fresh magic-link SIGN-IN: if the cloud is empty, push this device's data up
 *    (first backup); otherwise ADOPT the cloud copy (cloud wins) so a new device
 *    recovers the family's progress.
 *  - Later reloads (session restored): local is canonical — just keep the cloud
 *    current by pushing. We never overwrite freshly-played local progress on a
 *    plain reload.
 *  - While signed in: debounced push of profiles + the active child's progress
 *    whenever they change.
 */

const PROG_PREFIX = 'tv_progress_v1__'
const localProgress = (id) => {
  try {
    return JSON.parse(localStorage.getItem(PROG_PREFIX + id)) || {}
  } catch {
    return {}
  }
}

// local profile  <->  `children` row (guest "Everyone" never syncs — it's local-only)
const toChildRow = (uid, p, slot) => ({
  account_id: uid,
  id: p.id,
  name: p.name,
  slot,
  settings: {
    color: p.color,
    initials: p.initials,
    stage: p.stage,
    limit: p.limit,
    bedtime: p.bedtime,
    phraseLevel: p.phraseLevel,
    focusWords: p.focusWords || [],
    enabledSongs: p.enabledSongs || [],
    expectantPause: !!p.expectantPause,
  },
})
const fromChildRow = (r) => ({ id: r.id, name: r.name, ...(r.settings || {}) })

async function uid() {
  if (!supabase) return null
  const { data } = await supabase.auth.getUser()
  return data?.user?.id || null
}

// ---- pushes ----------------------------------------------------------------
export async function pushChildren(profiles) {
  const id = await uid()
  if (!id) return
  const rows = profiles.filter((p) => !p.guest).map((p, i) => toChildRow(id, p, i + 1))
  if (rows.length) {
    const { error } = await supabase.from('children').upsert(rows)
    if (error) console.warn('[cloud] pushChildren', error.message)
  }
}

export async function pushProgress(childId, data) {
  if (!childId || childId === 'guest') return
  const id = await uid()
  if (!id) return
  const { error } = await supabase.from('progress').upsert({
    account_id: id,
    child_id: childId,
    data: data || {},
    updated_at: new Date().toISOString(),
  })
  if (error) console.warn('[cloud] pushProgress', error.message)
}

// ---- pull + reconcile ------------------------------------------------------
async function pullAll() {
  if (!supabase) return null
  const [{ data: children }, { data: progress }] = await Promise.all([
    supabase.from('children').select('*').order('slot'),
    supabase.from('progress').select('*'),
  ])
  return { children: children || [], progress: progress || [] }
}

async function reconcile(store) {
  const cloud = await pullAll()
  if (!cloud) return
  if (cloud.children.length === 0) {
    // First backup from this device → push everything up.
    const profiles = store.getState().profiles
    await pushChildren(profiles)
    for (const k of profiles.filter((p) => !p.guest)) {
      await pushProgress(k.id, localProgress(k.id))
    }
  } else {
    // Cloud wins → adopt it locally so this device recovers the family's data.
    const profiles = cloud.children.map(fromChildRow)
    const progressByChild = {}
    for (const r of cloud.progress) progressByChild[r.child_id] = r.data
    store.getState().applyCloudState({ profiles, progressByChild })
  }
}

// ---- account / trial -------------------------------------------------------
// Create-if-missing then return the account row. Self-healing: doesn't rely on
// the signup trigger, and ignoreDuplicates means an existing row (and its trial
// clock) is never reset. RLS lets a parent insert only their own id.
export async function ensureAccount() {
  const id = await uid()
  if (!id) return null
  const { data: u } = await supabase.auth.getUser()
  const { error: upErr } = await supabase
    .from('accounts')
    .upsert({ id, email: u?.user?.email }, { onConflict: 'id', ignoreDuplicates: true })
  if (upErr) console.warn('[cloud] ensureAccount upsert', upErr.message)
  const { data, error } = await supabase.from('accounts').select('*').eq('id', id).maybeSingle()
  if (error) console.warn('[cloud] ensureAccount select', error.message)
  return data || null
}

// ---- auth actions (used by the Parent area) --------------------------------
export async function signInWithEmail(email) {
  if (!supabase) throw new Error('Cloud not configured')
  return supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  })
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut()
}

// COPPA/GDPR-K: a one-tap "delete my data". Removes the account row; children +
// progress cascade away via the FK. The auth user itself can only be removed
// server-side (admin), but all of the family's data is gone.
export async function deleteCloudData() {
  const id = await uid()
  if (!id) return
  await supabase.from('accounts').delete().eq('id', id)
  await supabase.auth.signOut()
}

// ---- one-time wiring (called from App) -------------------------------------
let started = false
export function initCloud(store) {
  if (!supabase || started) return
  started = true

  // A magic link that's expired or already used redirects back with an error in
  // the URL hash (e.g. #error_code=otp_expired). Capture it for a friendly note
  // in the Account area, then strip the hash so the URL stays clean.
  try {
    const h = window.location.hash || ''
    if (/(?:^|[#&])(?:error|error_code)=/.test(h)) {
      const params = new URLSearchParams(h.replace(/^#/, ''))
      store.getState().setAuthError(params.get('error_code') || params.get('error') || 'link_error')
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  } catch {
    /* ignore */
  }

  let reconciledFor = null
  supabase.auth.onAuthStateChange(async (event, session) => {
    store.getState().setSession(session || null)
    if (!session?.user) {
      store.getState().setAccount(null)
      store.getState().setCloudStatus('idle')
      return
    }
    store.getState().setAuthError(null) // a good session clears any stale-link note
    store.getState().setCloudStatus('syncing')
    try {
      // Ensure the account row exists FIRST — children/progress FK to it, and the
      // trial banner needs it. Show it immediately so the parent sees their trial.
      store.getState().setAccount(await ensureAccount())
      if (event === 'SIGNED_IN' && reconciledFor !== session.user.id) {
        reconciledFor = session.user.id
        await reconcile(store) // fresh login → recover/seed
      } else {
        await pushChildren(store.getState().profiles) // reload → keep cloud current
      }
      store.getState().setCloudStatus('synced')
    } catch (e) {
      console.warn('[cloud] sync failed', e?.message || e)
      store.getState().setCloudStatus('error')
    }
  })

  // Debounced pushes while signed in (profiles + active child's progress).
  let tp = null
  let tg = null
  store.subscribe((state, prev) => {
    if (!state.session?.user) return
    if (state.profiles !== prev.profiles) {
      clearTimeout(tp)
      tp = setTimeout(() => pushChildren(state.profiles), 800)
    }
    if (
      state.progress !== prev.progress &&
      state.activeProfileId &&
      state.activeProfileId !== 'guest'
    ) {
      clearTimeout(tg)
      tg = setTimeout(() => pushProgress(state.activeProfileId, state.progress), 800)
    }
  })
}
