export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }

  const { readSupabaseServerEnv } = await import('./lib/supabase/server-env')
  const { reportSupabaseConfigOutage } = await import('./lib/supabase/outage')
  const env = readSupabaseServerEnv()
  if (!env.ok) await reportSupabaseConfigOutage(env.missing)
}
