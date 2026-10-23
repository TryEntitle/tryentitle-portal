import Link from 'next/link'
import { colors } from '@/lib/theme'

// Catches notFound() from any /admin/* route (order/product/customer
// detail pages) as well as unknown admin URLs. Standalone, same reasoning
// as error.tsx — no AppShell dependency.
export default function AdminNotFound() {
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
        <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1, color: colors.secondary[500] }}>404</div>
        <div style={{ fontSize: 17, fontWeight: 600 }}>Page not found</div>
        <div style={{ fontSize: 14, color: colors.content.muted, lineHeight: 1.5 }}>The page you&apos;re looking for doesn&apos;t exist or has moved.</div>
        <Link
          href="/admin"
          style={{
            marginTop: 10,
            height: 40,
            padding: '0 20px',
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: 999,
            background: colors.content.primary,
            color: colors.layout.surface,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Go to Analytics
        </Link>
      </div>
    </div>
  )
}
