'use client'
import { useEffect } from 'react'
import Button from '@/components/Button'
import { AlertCircleIcon } from '@/components/icons'
import { colors } from '@/lib/theme'

// Next.js error boundary for the /admin segment — a client component by
// its own convention. Rendered standalone (no AppShell): whatever threw
// may be the same data fetch AppShell itself depends on, so this avoids
// compounding the failure.
export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: colors.layout.background, padding: 24 }}>
      <div
        style={{
          maxWidth: 420,
          background: colors.layout.surface,
          border: `1px solid ${colors.layout.divider}`,
          borderRadius: 16,
          padding: '56px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 10,
        }}
      >
        <div style={{ width: 52, height: 52, borderRadius: 14, background: colors.danger[50], color: colors.danger[600], display: 'grid', placeItems: 'center', marginBottom: 6 }}>
          <AlertCircleIcon size={22} />
        </div>
        <div style={{ fontSize: 17, fontWeight: 600 }}>We couldn&apos;t load this page</div>
        <div style={{ fontSize: 14, color: colors.content.muted, lineHeight: 1.5 }}>
          Check your internet connection and try again. If it keeps happening, contact support.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => (window.location.href = 'mailto:hello@tryentitle.tech')}>
            Contact support
          </Button>
        </div>
      </div>
    </div>
  )
}
