import { PageSkeleton } from '@/components/Skeleton'
import { colors } from '@/lib/theme'

// Next's Suspense fallback for every /admin/* route while its page's data
// fetch is in flight. Kept data-free on purpose — it renders before any
// query has resolved, so it can't know the real title, user email, or nav
// active-state. A lightweight approximation of AppShell's chrome instead
// of the real thing.
export default function AdminLoading() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: colors.layout.background }}>
      <div style={{ width: 240, flexShrink: 0, background: colors.content.primary }} />
      <main style={{ flex: 1, minWidth: 0, padding: 32, maxWidth: 1200, boxSizing: 'border-box' }}>
        <div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ width: 180, height: 28, borderRadius: 6, background: colors.default[100] }} />
          <div style={{ width: 260, height: 14, borderRadius: 4, background: colors.default[50] }} />
        </div>
        <PageSkeleton />
      </main>
    </div>
  )
}
