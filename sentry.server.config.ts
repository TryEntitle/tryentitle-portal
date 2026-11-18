import * as Sentry from '@sentry/nextjs'
import { scrubSentryEvent } from '@/lib/sentry/scrub'

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  enabled: !!(process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN),
  beforeSend(event) {
    return scrubSentryEvent(event)
  },
})
