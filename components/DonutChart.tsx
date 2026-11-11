'use client'
import { useState } from 'react'
import { colors } from '@/lib/theme'

// Reserved status palette — validated colorblind-safe as a categorical set
// (see dataviz skill: node scripts/validate_palette.js).
const STATUS_COLORS = colors.status

const SEGMENT_FALLBACKS = [
  colors.secondary[500],
  colors.secondary[300],
  colors.secondary[200],
  colors.primary[400],
  colors.primary[200],
  colors.default[400],
]

function colorFor(label: string, index: number, palette?: string[]) {
  if (palette?.[index]) return palette[index]
  return STATUS_COLORS[label.toLowerCase()] ?? SEGMENT_FALLBACKS[index % SEGMENT_FALLBACKS.length]
}

export default function DonutChart({
  data,
  centerValue,
  centerLabel = 'orders',
  colors: palette,
  legendAsPercent,
  size = 140,
}: {
  data: { label: string; value: number }[]
  /** Override the number shown in the hole (defaults to sum of values). */
  centerValue?: string | number
  centerLabel?: string
  /** Explicit segment colors in data order. */
  colors?: string[]
  /** Show pct of total in the legend instead of raw counts. */
  legendAsPercent?: boolean
  size?: number
}) {
  const [hover, setHover] = useState<number | null>(null)
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const r = 60
  const stroke = 22
  const circumference = 2 * Math.PI * r
  // Tracks where the next segment should start on the circle.
  let offset = 0
  const displayCenter = centerValue !== undefined ? centerValue : data.reduce((s, d) => s + d.value, 0)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
      <div style={{ order: 2, flex: '1 1 auto', minWidth: 120 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          {data.map((d, i) => {
            const color = colorFor(d.label, i, palette)
            const pct = Math.round((d.value / total) * 100)
            return (
              <div
                key={d.label}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  opacity: hover === null || hover === i ? 1 : 0.5,
                  cursor: 'pointer',
                }}
              >
                <span style={{ width: 9, height: 9, borderRadius: 2, background: color, flexShrink: 0 }} />
                <span style={{ color: colors.content.primary }}>{d.label}</span>
                <span style={{ color: colors.content.muted }}>{legendAsPercent ? `${pct}%` : d.value}</span>
              </div>
            )
          })}
        </div>
      </div>

      <svg viewBox="0 0 160 160" width={size} height={size} style={{ order: 3, flexShrink: 0 }}>
        <g transform="translate(80 80) rotate(-90)">
          <circle r={r} cx="0" cy="0" fill="none" stroke={colors.default[100]} strokeWidth={stroke} />
          {data.map((d, i) => {
            const frac = d.value / total
            const len = Math.max(0, frac * circumference - 2) // 2px surface gap between segments
            const dash = `${len} ${circumference - len}`
            const dashoffset = -offset
            offset += frac * circumference
            const color = colorFor(d.label, i, palette)
            return (
              <circle
                key={d.label}
                r={r}
                cx="0"
                cy="0"
                fill="none"
                stroke={color}
                strokeWidth={hover === i ? stroke + 4 : stroke}
                strokeDasharray={dash}
                strokeDashoffset={dashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-width 120ms', cursor: 'pointer' }}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
              />
            )
          })}
        </g>
        {displayCenter !== '' && displayCenter !== null && displayCenter !== undefined && (
          <text x="80" y={centerLabel ? 76 : 84} textAnchor="middle" fontSize="20" fontWeight={700} fill={colors.content.primary}>
            {displayCenter}
          </text>
        )}
        {centerLabel ? (
          <text x="80" y="92" textAnchor="middle" fontSize="11" fill={colors.content.muted}>
            {centerLabel}
          </text>
        ) : null}
      </svg>
    </div>
  )
}
