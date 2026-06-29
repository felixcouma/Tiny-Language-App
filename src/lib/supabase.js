import { createClient } from '@supabase/supabase-js'

// Cloud accounts + sync are OPTIONAL. With no Supabase env vars the app runs
// exactly as before — fully local, no sign-in. When both are present, parents
// can sign in (magic link) to back up + sync progress and run their trial.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const cloudConfigured = Boolean(url && key)

export const supabase = cloudConfigured
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // completes the magic-link redirect
      },
    })
  : null
