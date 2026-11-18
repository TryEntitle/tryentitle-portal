import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { CookieOptions } from '@supabase/ssr'
import { reportSupabaseConfigOutage } from './outage'
import { readSupabaseServerEnv } from './server-env'

export async function createClient() {
  // Touch cookies first so a missing-env redirect stays a dynamic response.
  // Redirecting before this lets `next build` prerender a static 307 with no
  // Location header, and `/` (not covered by the old matcher) never reached login.
  const cookieStore = await cookies()
  const env = readSupabaseServerEnv()
  if (!env.ok) {
    // createServerClient throws when URL or key is missing, which 500s the page.
    await reportSupabaseConfigOutage(env.missing)
    redirect('/unavailable')
  }

  return createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Server Components can't write cookies; safe to ignore here.
        }
      },
    },
  })
}
