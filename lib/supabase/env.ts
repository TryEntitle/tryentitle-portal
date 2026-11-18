// Public Supabase env for the browser client. Static process.env.NEXT_PUBLIC_*
// reads are inlined at build time, which is what the browser bundle needs.
// The server and middleware use lib/supabase/server-env.ts so a missing
// runtime process env is still visible. Names only — never log the values.

const SUPABASE_URL_ENV = 'NEXT_PUBLIC_SUPABASE_URL'
const SUPABASE_ANON_KEY_ENV = 'NEXT_PUBLIC_SUPABASE_ANON_KEY'

export type SupabasePublicEnv =
  | { ok: true; url: string; key: string }
  | { ok: false; missing: string[] }

function nonempty(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export function readSupabasePublicEnv(): SupabasePublicEnv {
  // Static access is intentional: the browser bundle only receives these
  // public values when they were present at build time.
  const url = nonempty(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const key = nonempty(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  if (!url || !key) {
    const missing: string[] = []
    if (!url) missing.push(SUPABASE_URL_ENV)
    if (!key) missing.push(SUPABASE_ANON_KEY_ENV)
    return { ok: false, missing }
  }
  return { ok: true, url, key }
}
