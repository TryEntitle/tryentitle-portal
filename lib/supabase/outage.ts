// Server and edge only. Do not import this from a client component: it reads
// the Slack webhook and the service-role key, which must never ship to the browser.
//
// Alerts no-op when their secret is unset. Nothing here puts a secret value,
// token, or Supabase host into a log line or into the public HTML.

import { NextResponse } from 'next/server'
import { colors } from '@/lib/theme'
import { scrubSentryEvent } from '@/lib/sentry/scrub'
import { readServerEnv, serviceRoleEnvName, supabaseProjectUrlName } from './server-env'

const ALLOWED_MISSING = new Set([
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
])

const ALERT_COOLDOWN_MS = 6 * 60 * 60 * 1000

type Impact = 'site' | 'invites'

type OutageGlobal = typeof globalThis & {
  __tryentitleOutageAlertAt?: Partial<Record<Impact, number>>
}

export function safeMissingNames(missing: readonly string[]): string[] {
  return missing.filter((name) => ALLOWED_MISSING.has(name))
}

function shouldSendAlerts(): boolean {
  if (process.env.NEXT_PHASE === 'phase-production-build') return false
  if (process.env.npm_lifecycle_event === 'build') return false
  return process.env.NODE_ENV === 'production'
}

function claimAlertSlot(impact: Impact): boolean {
  const g = globalThis as OutageGlobal
  const book = (g.__tryentitleOutageAlertAt ??= {})
  const previous = book[impact] ?? 0
  const now = Date.now()
  if (now - previous < ALERT_COOLDOWN_MS) return false
  book[impact] = now
  return true
}

/** Public HTML. No env names, values, tokens, or hosts. */
export function supabaseConfigOutageHtml(): string {
  const muted = colors.content.muted
  const primary = colors.content.primary
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="tryentitle-status" content="configuration-incomplete">
<title>TryEntitle is temporarily unavailable</title>
</head>
<body style="margin:0;min-height:100vh;box-sizing:border-box;display:grid;place-items:center;background:${colors.layout.background};padding:24px;font-family:system-ui,sans-serif">
  <main style="max-width:420px;background:${colors.layout.surface};border:1px solid ${colors.layout.divider};border-radius:16px;padding:56px 24px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px">
    <h1 style="margin:0;font-size:17px;font-weight:600;color:${primary}">TryEntitle is temporarily unavailable</h1>
    <p style="margin:0;font-size:14px;line-height:1.5;color:${muted}">This site is down because server configuration is incomplete. Your account is fine. Please try again later.</p>
    <p style="margin:0;font-size:14px;line-height:1.5;color:${muted}">If you need help sooner, email <a href="mailto:hello@tryentitle.tech" style="color:${primary}">hello@tryentitle.tech</a>.</p>
  </main>
</body>
</html>`
}

export function supabaseConfigOutageResponse(): NextResponse {
  return new NextResponse(supabaseConfigOutageHtml(), {
    status: 503,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'retry-after': '3600',
      'x-robots-tag': 'noindex',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'permissions-policy': 'camera=(), microphone=(), geolocation=()',
      'x-tryentitle-status': 'configuration-incomplete',
    },
  })
}

function logOutage(impact: Impact, names: string[]): void {
  const shown =
    names.length > 0
      ? names.join(', ')
      : impact === 'site'
        ? 'NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY'
        : 'SUPABASE_SERVICE_ROLE_KEY'
  const effect =
    impact === 'site'
      ? 'The portal is showing the configuration outage page.'
      : 'Team invites were not sent.'
  console.error(`Missing ${shown}. Set them in the environment (see .env.example). ${effect}`)
}

function slackText(impact: Impact, names: string[]): string {
  const what =
    impact === 'site'
      ? 'TryEntitle portal is down: server configuration is incomplete.'
      : 'TryEntitle team invites are unavailable: server configuration is incomplete.'
  const missing = names.length > 0 ? ` Missing: ${names.join(', ')}.` : ''
  return `${what}${missing} No secret values are included in this alert.`
}

/** https://<ref>.supabase.co only, so the service-role key is never sent elsewhere. */
export function supabaseProjectOrigin(raw: string | undefined): string | null {
  if (!raw) return null
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    return null
  }
  if (parsed.protocol !== 'https:') return null
  if (parsed.username || parsed.password || parsed.port) return null
  if (parsed.pathname !== '/' && parsed.pathname !== '') return null
  if (parsed.search || parsed.hash) return null
  const host = parsed.hostname
  if (!/^[a-z0-9]{10,40}\.supabase\.co$/.test(host)) return null
  return parsed.origin
}

function slackWebhook(raw: string | undefined): string | null {
  if (!raw) return null
  let parsed: URL
  try {
    parsed = new URL(raw.trim())
  } catch {
    return null
  }
  if (parsed.protocol !== 'https:') return null
  if (parsed.username || parsed.password) return null
  if (parsed.hostname !== 'hooks.slack.com') return null
  return parsed.toString()
}

async function notifySentry(impact: Impact, names: string[]): Promise<void> {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
  if (!dsn) return
  try {
    const Sentry = await import('@sentry/nextjs')
    if (!Sentry.getClient()) {
      Sentry.init({
        dsn,
        enabled: true,
        tracesSampleRate: 0,
        beforeSend(event) {
          return scrubSentryEvent(event)
        },
      })
    }
    const message =
      impact === 'site'
        ? 'Portal is down: server configuration is incomplete'
        : 'Team invites are unavailable: server configuration is incomplete'
    Sentry.captureMessage(message, {
      level: 'error',
      fingerprint: [`supabase-config-${impact}`],
      tags: { area: 'supabase-config', impact },
      extra: { missing: names },
    })
    await Sentry.flush(2000)
  } catch {
    console.error('Sentry outage alert failed.')
  }
}

async function notifySlack(impact: Impact, names: string[]): Promise<void> {
  const webhook = slackWebhook(process.env.SLACK_WEBHOOK_URL)
  if (!process.env.SLACK_WEBHOOK_URL) return
  if (!webhook) {
    console.error('Slack outage alert skipped: SLACK_WEBHOOK_URL is not an https://hooks.slack.com URL.')
    return
  }
  try {
    const res = await fetch(webhook, {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(2500),
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: slackText(impact, names) }),
    })
    if (!res.ok) console.error('Slack outage alert failed.')
  } catch {
    console.error('Slack outage alert failed.')
  }
}

async function notifySupabase(): Promise<void> {
  // Indirect lookup: a direct NEXT_PUBLIC_ read is frozen at build time.
  const origin = supabaseProjectOrigin(readServerEnv(supabaseProjectUrlName()))
  const key = readServerEnv(serviceRoleEnvName())
  if (!origin || !key) return
  try {
    const res = await fetch(`${origin}/rest/v1/rpc/record_config_outage`, {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(2500),
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    })
    if (!res.ok) console.error(`Supabase outage alert failed (HTTP ${res.status}).`)
  } catch {
    console.error('Supabase outage alert failed.')
  }
}

/**
 * Log safe variable names and, in production, notify Sentry, Slack, and
 * Supabase. Each channel no-ops when its secret is unset. GitHub is notified
 * by .github/workflows/portal-config-outage.yml (built-in token), not from here.
 */
export async function reportSupabaseConfigOutage(
  missing: readonly string[],
  impact: Impact = 'site',
): Promise<void> {
  const names = safeMissingNames(missing)
  logOutage(impact, names)
  if (!shouldSendAlerts()) return
  if (!claimAlertSlot(impact)) return
  await Promise.allSettled([notifySentry(impact, names), notifySlack(impact, names), notifySupabase()])
}
