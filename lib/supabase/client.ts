import { createBrowserClient } from '@supabase/ssr'
import { readSupabasePublicEnv } from './env'

export const createClient = () => {
  const env = readSupabasePublicEnv()
  if (!env.ok) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Set them in .env.local (see .env.example).',
    )
  }
  return createBrowserClient(env.url, env.key)
}
