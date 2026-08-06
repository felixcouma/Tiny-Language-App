// Cloud accounts + sync are OPTIONAL. With no Supabase env vars the app runs exactly as
// before — fully local, no sign-in. When both are present, parents can sign in (magic
// link) to back up + sync progress and run their trial.
//
// `cloudConfigured` is a PURE env check (no heavy import), so the app can decide whether
// to show cloud UI without pulling in @supabase/supabase-js. The client itself is loaded
// LAZILY (dynamic import) the first time cloud is actually used — keeping that big library
// out of the initial bundle so the app loads fast for everyone who never signs in.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const cloudConfigured = Boolean(url && key)

let client = null
let loading = null
// Resolve the Supabase client, loading the library on first use. Returns null when cloud
// isn't configured (the common case), so callers just early-return.
export function getSupabase() {
  if (!cloudConfigured) return Promise.resolve(null)
  if (client) return Promise.resolve(client)
  if (!loading) {
    loading = import('@supabase/supabase-js').then(({ createClient }) => {
      client = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true, // completes the magic-link redirect
        },
      })
      return client
    })
  }
  return loading
}
