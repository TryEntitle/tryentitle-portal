import { colors } from '@/lib/theme'

export default function Skeleton({ style }: { style?: React.CSSProperties }) {
  return <div style={{ background: colors.default[100], borderRadius: 6, ...style }} />
}

// A page's worth of placeholder blocks, matching the common
// stat-row + card layout most screens use.
export function PageSkeleton() {
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        <Skeleton style={{ height: 96 }} />
        <Skeleton style={{ height: 96 }} />
        <Skeleton style={{ height: 96 }} />
        <Skeleton style={{ height: 96 }} />
      </div>
      <Skeleton style={{ height: 320 }} />
    </div>
  )
}
