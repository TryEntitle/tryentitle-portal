// Public Supabase env shared by the browser client, the server client, and
// middleware. The presence check matches @supabase/ssr, which throws when
// either value is missing. Names only — never read these back out for logs.

const SUPABASE_URL_ENV = 'NEXT_PUBLIC_SUPABASE_URL'
const SUPABASE_ANON_KEY_ENV = 'NEXT_PUBLIC_SUPABASE_ANON_KEY'

export type SupabasePublicEnv =
  | { ok: true; url: string; key: string }
  | { ok: false; missing: string[] }

export function readSupabasePublicEnv(): SupabasePublicEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    const missing: string[] = []
    if (!url) missing.push(SUPABASE_URL_ENV)
    if (!key) missing.push(SUPABASE_ANON_KEY_ENV)
    return { ok: false, missing }
  }
  return { ok: true, url, key }
}

/** Server-side only. `missing` must be variable names, never values. */
export function logMissingSupabasePublicEnv(missing: readonly string[]): void {
  const names =
    missing.length > 0 ? missing.join(', ') : `${SUPABASE_URL_ENV}, ${SUPABASE_ANON_KEY_ENV}`
  console.error(
    `Missing ${names}. Set them in the environment (see .env.example). Supabase server client was not created.`,
  )
}
