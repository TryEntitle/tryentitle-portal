// Isometric workflow diagram for the login panel: a staircase of 3D steps
// connected by a path, echoing the logo's own stepped geometry.
type Box = { x: number; y: number; accent?: boolean }

const W = 56 // front-face width
const H = 44 // front-face height
const D = 28 // depth (top/side skew)

function IsoBox({ x, y, accent }: Box) {
  const front = [`${x},${y}`, `${x + W},${y}`, `${x + W},${y + H}`, `${x},${y + H}`].join(' ')
  const top = [
    `${x},${y}`,
    `${x + W},${y}`,
    `${x + W + D * 0.6},${y - D}`,
    `${x + D * 0.6},${y - D}`,
  ].join(' ')
  const side = [
    `${x + W},${y}`,
    `${x + W + D * 0.6},${y - D}`,
    `${x + W + D * 0.6},${y - D + H}`,
    `${x + W},${y + H}`,
  ].join(' ')

  const front_c = accent ? '#e16e38' : '#3a3a37'
  const top_c = accent ? '#f0905f' : '#55564f'
  const side_c = accent ? '#b9541f' : '#242422'

  return (
    <g>
      <polygon points={side} fill={side_c} />
      <polygon points={top} fill={top_c} />
      <polygon points={front} fill={front_c} stroke="rgba(246,245,243,0.12)" strokeWidth="1" />
    </g>
  )
}

export default function WorkflowPattern() {
  const steps: Box[] = [
    { x: 10, y: 260 },
    { x: 86, y: 204 },
    { x: 162, y: 148, accent: true },
    { x: 162, y: 76 },
    { x: 238, y: 20 },
  ]

  return (
    <svg viewBox="0 0 320 340" width="100%" height="100%" style={{ maxHeight: 420 }} fill="none">
      <path
        d="M 38 260 C 70 230, 70 234, 114 204 C 150 180, 150 180, 190 148 L 190 100 C 190 90, 190 90, 190 76 C 216 50, 216 50, 266 20"
        stroke="rgba(246,245,243,0.25)"
        strokeWidth="1.5"
        strokeDasharray="3 5"
        fill="none"
      />
      {steps.map((s, i) => (
        <IsoBox key={i} {...s} />
      ))}
    </svg>
  )
}
