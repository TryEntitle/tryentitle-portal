'use client'
import { useState } from 'react'
import { colors } from '@/lib/theme'

export default function BarChart({
  data,
  format,
}: {
  data: { label: string; value: number }[]
  // Tooltip renderer for a bucket's value; defaults to "<value> orders".
  format?: (value: number) => React.ReactNode
}) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(1, ...data.map((d) => d.value)) // avoid divide-by-0
  // Bars shrink (down to 3px) once there are more than ~14 of them (e.g. a
  // 30-day daily series) so they still fit the fixed 360-wide viewBox.
  const n = Math.max(1, data.length)
  const barW = Math.max(3, Math.min(24, 360 / (n + (n + 1) / 3)))
  const gap = (360 - n * barW) / (n + 1)
  const chartH = 160
  // Thin out x-axis text once bars are packed tightly, or labels overlap.
  const labelEvery = n > 14 ? Math.ceil(n / 7) : 1

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 360 ${chartH + 24}`} width="100%" height={chartH + 24}>
        {[0, 0.5, 1].map((f) => (
          <line
            key={f}
            x1="0"
            x2="360"
            y1={chartH - chartH * f}
            y2={chartH - chartH * f}
            stroke={colors.layout.divider}
            strokeWidth="1"
          />
        ))}
        {data.map((d, i) => {
          const h = Math.max(4, (d.value / max) * (chartH - 8))
          const x = gap + i * (barW + gap)
          const y = chartH - h
          return (
            <g
              key={i}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect x={x} y="0" width={barW} height={chartH} fill="transparent" />
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={Math.min(4, barW / 2)}
                fill={hover === i ? colors.secondary[600] : colors.secondary[500]}
              />
              {i % labelEvery === 0 && (
                <text x={x + barW / 2} y={chartH + 18} textAnchor="middle" fontSize="11" fill={colors.content.muted}>
                  {d.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      {hover !== null && (
        <div
          style={{
            position: 'absolute',
            left: `${((gap + hover * (barW + gap) + barW / 2) / 360) * 100}%`,
            top: 0,
            transform: 'translate(-50%, -110%)',
            background: colors.content.primary,
            color: colors.content.inverse,
            fontSize: 12,
            padding: '6px 10px',
            borderRadius: 8,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          <strong>{format ? format(data[hover].value) : data[hover].value}</strong>
          {!format && ' orders'} · {data[hover].label}
        </div>
      )}
    </div>
  )
}
