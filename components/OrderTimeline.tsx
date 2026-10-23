import { colors } from '@/lib/theme'

// Derived entirely from the order's current `status` plus its one real
// timestamp (created_at) — there's no per-step history in the schema, so
// reached-but-not-current steps are marked "Done" without a fabricated time.
export default function OrderTimeline({ status, createdAt }: { status: string; createdAt: string | null }) {
  const cancelled = status === 'cancelled'
  const steps = cancelled ? ['Order placed', 'Cancelled'] : ['Order placed', 'In progress', 'Completed']
  const reached = cancelled ? 1 : status === 'completed' ? 2 : status === 'in progress' ? 1 : 0
  const placedAt = createdAt ? new Date(createdAt).toLocaleString() : '—'

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {steps.map((label, i) => {
        const done = i <= reached
        const danger = cancelled && i === steps.length - 1
        const dot = done ? (danger ? colors.danger[500] : colors.secondary[500]) : colors.layout.surface
        const ring = done ? (danger ? colors.danger[500] : colors.secondary[500]) : colors.default[200]
        const isLast = i === steps.length - 1
        return (
          <div key={label} style={{ display: 'flex', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 12 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  flexShrink: 0,
                  borderRadius: '50%',
                  background: dot,
                  border: `2px solid ${ring}`,
                  boxSizing: 'border-box',
                  marginTop: 3,
                }}
              />
              {!isLast && <span style={{ flex: 1, width: 2, background: i < reached ? colors.secondary[200] : colors.default[100], minHeight: 28 }} />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: 18 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: done ? colors.content.primary : colors.content.muted }}>{label}</span>
              <span style={{ fontSize: 12.5, color: colors.content.muted }}>
                {i === 0 ? placedAt : done ? 'Done' : 'Waiting'}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
