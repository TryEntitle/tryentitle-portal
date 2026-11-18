import { createBrowserClient } from '@supabase/ssr'
import { readSupabasePublicEnv } from './env'

export const createClient = () => {
  const env = readSupabasePublicEnv()
  if (!env.ok) {
    // Plain language only. Variable names and hosts stay off the page.
    throw new Error('This site is down because server configuration is incomplete.')
  }
  return createBrowserClient(env.url, env.key)
}
