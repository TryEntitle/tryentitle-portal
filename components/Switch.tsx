import { colors } from '@/lib/theme'

export default function Switch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onClick}
      style={{
        width: 40,
        height: 22,
        flexShrink: 0,
        borderRadius: 999,
        border: 'none',
        background: on ? colors.secondary[500] : colors.default[200],
        padding: 2,
        display: 'flex',
        justifyContent: on ? 'flex-end' : 'flex-start',
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  )
}
