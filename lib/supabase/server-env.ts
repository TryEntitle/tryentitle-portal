// Runtime Supabase env for the server, middleware, and instrumentation.
// Direct `process.env.NEXT_PUBLIC_*` reads are inlined at build time, so a
// value present only during `next build` would hide a missing process env
// (and the reverse). The name is assembled at runtime so the server sees the
// process environment. Names only — never log the values.
//
// Do not import this from a client component. The browser client keeps the
// build-time public values in lib/supabase/env.ts.

export type SupabaseServerEnv =
  | { ok: true; url: string; key: string }
  | { ok: false; missing: string[] }

function envName(...parts: string[]): string {
  return parts.join('_')
}

export function readServerEnv(name: string): string | undefined {
  const value = process.env[name]
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function read(name: string): string | undefined {
  return readServerEnv(name)
}

export function supabaseProjectUrlName(): string {
  return envName('NEXT_PUBLIC', 'SUPABASE', 'URL')
}

export function serviceRoleEnvName(): string {
  return envName('SUPABASE', 'SERVICE', 'ROLE', 'KEY')
}

export function readSupabaseServerEnv(): SupabaseServerEnv {
  const urlName = supabaseProjectUrlName()
  const keyName = envName('NEXT_PUBLIC', 'SUPABASE', 'ANON', 'KEY')
  const url = read(urlName)
  const key = read(keyName)
  if (!url || !key) {
    const missing: string[] = []
    if (!url) missing.push(urlName)
    if (!key) missing.push(keyName)
    return { ok: false, missing }
  }
  return { ok: true, url, key }
}
