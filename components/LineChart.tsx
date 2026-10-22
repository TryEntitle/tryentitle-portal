'use client'
import { useState } from 'react'
import { colors } from '@/lib/theme'

export default function LineChart({
  data,
  format,
}: {
  data: { label: string; value: number }[]
  format?: (value: number) => React.ReactNode
}) {
  const [hover, setHover] = useState<number | null>(null)
  const chartH = 160
  const max = Math.max(1, ...data.map((d) => d.value))
  const n = data.length
  const x = (i: number) => (n <= 1 ? 180 : (i / (n - 1)) * 360)
  const y = (v: number) => chartH - (v / max) * (chartH - 12)
  const points = data.map((d, i) => `${x(i)},${y(d.value)}`).join(' ')
  const area = `0,${chartH} ${points} 360,${chartH}`
  const labelEvery = n > 10 ? Math.ceil((n - 1) / 6) : 1

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
        <polygon points={area} fill={colors.primary[400]} fillOpacity={0.1} />
        <polyline
          points={points}
          fill="none"
          stroke={colors.primary[400]}
          strokeWidth="2.5"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {data.map((d, i) => (
          <g key={i} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
            <rect x={x(i) - 360 / Math.max(1, n) / 2} y="0" width={360 / Math.max(1, n)} height={chartH} fill="transparent" style={{ cursor: 'pointer' }} />
            <circle cx={x(i)} cy={y(d.value)} r={hover === i ? 4 : 0} fill={colors.primary[500]} />
            {i % labelEvery === 0 && (
              <text x={x(i)} y={chartH + 18} textAnchor="middle" fontSize="11" fill={colors.content.muted}>
                {d.label}
              </text>
            )}
          </g>
        ))}
      </svg>
      {hover !== null && (
        <div
          style={{
            position: 'absolute',
            left: `${(x(hover) / 360) * 100}%`,
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
          <strong>{format ? format(data[hover].value) : data[hover].value}</strong> · {data[hover].label}
        </div>
      )}
    </div>
  )
}
