'use client'
import { useState } from 'react'
import { colors } from '@/lib/theme'

export default function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(1, ...data.map((d) => d.value)) // avoid dividing by 0 when every bar is empty
  const barW = 24
  const gap = (360 - data.length * barW) / (data.length + 1) // evenly spaces bars across a fixed 360px-wide viewBox
  const chartH = 160

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
              key={d.label}
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
                rx="4"
                fill={hover === i ? colors.secondary[600] : colors.secondary[500]}
              />
              <text x={x + barW / 2} y={chartH + 18} textAnchor="middle" fontSize="11" fill={colors.content.muted}>
                {d.label}
              </text>
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
          <strong>{data[hover].value}</strong> orders · {data[hover].label}
        </div>
      )}
    </div>
  )
}
