import { NextResponse } from 'next/server'
import { reportSupabaseConfigOutage, supabaseConfigOutageResponse } from '@/lib/supabase/outage'
import { readSupabaseServerEnv } from '@/lib/supabase/server-env'

// Backup for the middleware response. Must stay dynamic: a static render would
// freeze the outage page into the build even after configuration is restored.
export const dynamic = 'force-dynamic'

async function handle(request: Request) {
  const env = readSupabaseServerEnv()
  if (env.ok) return NextResponse.redirect(new URL('/', request.url))
  await reportSupabaseConfigOutage(env.missing)
  return supabaseConfigOutageResponse()
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
export const HEAD = handle
