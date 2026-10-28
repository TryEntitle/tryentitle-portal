import * as Sentry from '@sentry/nextjs'
import type { Metadata } from 'next'

export function generateMetadata(): Metadata {
  return {
    title: 'TryEntitle',
    description: 'TryEntitle customer portal',
    other: {
      ...Sentry.getTraceData(),
    },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>{children}</body>
    </html>
  )
}
