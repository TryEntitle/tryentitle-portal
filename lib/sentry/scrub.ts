// Drop query strings, cookies, and auth headers before an event leaves the
// process. Auth callback URLs carry a one-time code; Supabase hosts stay off
// the event as well.

import type { ErrorEvent } from '@sentry/nextjs'

export function scrubSentryEvent(event: ErrorEvent): ErrorEvent {
  const request = event.request
  if (!request) return event
  if (request.url) {
    try {
      const url = new URL(request.url)
      const host = url.hostname
      if (host.endsWith('.supabase.co') || host.endsWith('.supabase.in')) {
        delete request.url
      } else {
        request.url = `${url.origin}${url.pathname}`
      }
    } catch {
      delete request.url
    }
  }
  delete request.query_string
  delete request.cookies
  if (request.headers) {
    for (const key of Object.keys(request.headers)) {
      if (/cookie|authorization|apikey|api-key|token|secret/i.test(key)) {
        delete request.headers[key]
      }
    }
  }
  return event
}
