import { TrendUpIcon, TrendDownIcon } from '@/components/icons'
import { colors } from '@/lib/theme'

export default function StatCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: { direction: 'up' | 'down'; label: string }
}) {
  return (
    <div
      style={{
        border: `1px solid ${colors.layout.divider}`,
        background: colors.layout.surface,
        borderRadius: 16,
        padding: '20px 22px',
        minWidth: 160,
        flex: '1 1 160px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 8px 24px rgba(0,0,0,0.04)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <div>
        <div style={{ fontSize: 13, color: colors.content.muted }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 600, marginTop: 6, color: colors.content.primary }}>{value}</div>
        {trend && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              marginTop: 8,
              fontSize: 12,
              fontWeight: 600,
              color: trend.direction === 'up' ? colors.success[600] : colors.danger[600],
            }}
          >
            {trend.direction === 'up' ? <TrendUpIcon /> : <TrendDownIcon />}
            {trend.label}
          </div>
        )}
      </div>
      {icon && (
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: colors.secondary[50],
            color: colors.secondary[500],
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      )}
    </div>
  )
}
