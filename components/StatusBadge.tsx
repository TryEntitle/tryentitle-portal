import { colors } from '@/lib/theme'

const BG: Record<string, string> = {
  new: '#eef2ff',
  'in progress': colors.secondary[50],
  completed: colors.success[50],
  cancelled: colors.danger[50],
  active: colors.secondary[50],
  inactive: colors.default[100],
  live: colors.success[50],
  draft: colors.default[100],
  paid: colors.success[50],
  'in transit': colors.secondary[50],
}

export default function StatusBadge({ status }: { status: string }) {
  const key = status?.toLowerCase()
  const fg = colors.status[key] ?? colors.default[600]
  const bg = BG[key] ?? colors.default[100]
  return (
    <span
      style={{
        background: bg,
        color: fg,
        fontSize: 12,
        fontWeight: 500,
        padding: '4px 10px',
        borderRadius: 999,
        textTransform: 'capitalize',
      }}
    >
      {status}
    </span>
  )
}
