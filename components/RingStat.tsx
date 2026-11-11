import { colors } from '@/lib/theme'

/** Compact circular progress ring used on Paid invoices / Funds received cards. */
export default function RingStat({
  pct,
  color = colors.secondary[500],
  size = 52,
}: {
  pct: number
  color?: string
  size?: number
}) {
  const clamped = Math.max(0, Math.min(100, pct))
  const stroke = 6
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const filled = (clamped / 100) * c

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`translate(${size / 2} ${size / 2}) rotate(-90)`}>
          <circle r={r} cx={0} cy={0} fill="none" stroke={colors.default[100]} strokeWidth={stroke} />
          <circle
            r={r}
            cx={0}
            cy={0}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${filled} ${c - filled}`}
            strokeLinecap="round"
          />
        </g>
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          fontSize: 11,
          fontWeight: 600,
          color: colors.content.primary,
        }}
      >
        {clamped}%
      </div>
    </div>
  )
}
