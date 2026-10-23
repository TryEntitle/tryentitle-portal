import { colors } from '@/lib/theme'

export default function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[]
  active: string
  onChange: (tab: string) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${colors.default[200]}`, overflowX: 'auto' }}>
      {tabs.map((t) => {
        const on = t === active
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            style={{
              height: 40,
              padding: '0 14px',
              marginBottom: -1,
              border: 'none',
              borderBottom: `2px solid ${on ? colors.secondary[500] : 'transparent'}`,
              background: 'none',
              color: on ? colors.content.primary : colors.content.secondary,
              fontSize: 14,
              fontWeight: on ? 600 : 400,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {t}
          </button>
        )
      })}
    </div>
  )
}
