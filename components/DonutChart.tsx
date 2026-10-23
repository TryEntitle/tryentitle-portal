'use client'
import { useState } from 'react'
import { colors } from '@/lib/theme'

// Reserved status palette — validated colorblind-safe as a categorical set
// (see dataviz skill: node scripts/validate_palette.js).
const STATUS_COLORS = colors.status

export default function DonutChart({ data }: { data: { label: string; value: number }[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const r = 60
  const stroke = 22
  const circumference = 2 * Math.PI * r
  // Tracks where the next segment should start on the circle.
  let offset = 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <svg viewBox="0 0 160 160" width="140" height="140">
        <g transform="translate(80 80) rotate(-90)">
          <circle r={r} cx="0" cy="0" fill="none" stroke={colors.default[100]} strokeWidth={stroke} />
          {data.map((d, i) => {
            const frac = d.value / total
            const len = Math.max(0, frac * circumference - 2) // 2px surface gap between segments
            const dash = `${len} ${circumference - len}`
            const dashoffset = -offset
            offset += frac * circumference
            const color = STATUS_COLORS[d.label.toLowerCase()] ?? colors.content.muted
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
        <text x="80" y="76" textAnchor="middle" fontSize="20" fontWeight={700} fill={colors.content.primary}>
          {total}
        </text>
        <text x="80" y="92" textAnchor="middle" fontSize="11" fill={colors.content.muted}>
          orders
        </text>
      </svg>

      <div style={{ display: 'grid', gap: 8 }}>
        {data.map((d, i) => {
          const color = STATUS_COLORS[d.label.toLowerCase()] ?? colors.content.muted
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
              <span style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
              <span style={{ color: colors.content.primary, textTransform: 'capitalize' }}>{d.label}</span>
              <span style={{ color: colors.content.muted }}>{d.value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
