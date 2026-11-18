import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { readServerEnv, serviceRoleEnvName, supabaseProjectUrlName } from './server-env'

// Service-role client — bypasses RLS. Server-only: never import this from
// a 'use client' component or anything that ships to the browser. Used by
// app/api/admin/invite-teammate for Auth Admin user lookup/invite and the
// subsequent profiles.role (and email sync) update. That route first checks
// the caller is already an admin using the normal cookie-scoped client.
export function createAdminClient(): SupabaseClient | null {
  const url = readServerEnv(supabaseProjectUrlName())
  const serviceRoleKey = readServerEnv(serviceRoleEnvName())
  if (!url || !serviceRoleKey) return null
  try {
    return createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  } catch {
    console.error('Supabase admin client was not created.')
    return null
  }
}
