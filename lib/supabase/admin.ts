import { createClient } from '@supabase/supabase-js'

// Service-role client — bypasses RLS. Server-only: never import this from
// a 'use client' component or anything that ships to the browser. Used
// solely for the admin.inviteUserByEmail call in
// app/api/admin/invite-teammate, which first checks the caller is already
// an admin using the normal cookie-scoped client before touching this.
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
