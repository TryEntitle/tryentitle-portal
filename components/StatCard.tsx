import { TrendUpIcon, TrendDownIcon } from '@/components/icons'

const BRAND_ACCENT = '#e16e38'

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
        border: '1px solid #ececea',
        background: '#fff',
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
        <div style={{ fontSize: 13, color: '#8a8a87' }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 600, marginTop: 6, color: '#292928' }}>{value}</div>
        {trend && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              marginTop: 8,
              fontSize: 12,
              fontWeight: 600,
              color: trend.direction === 'up' ? '#10845a' : '#c23b3b',
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
            background: 'rgba(225,110,56,0.12)',
            color: BRAND_ACCENT,
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
