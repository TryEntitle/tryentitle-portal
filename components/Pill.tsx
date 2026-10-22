import { colors } from '@/lib/theme'

// Neutral/selectable pill — filter chips, segmented range pickers. For an
// order/product status badge use StatusBadge instead.
export default function Pill({
  children,
  active,
  onClick,
  count,
}: {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
  count?: number
}) {
  const Tag = onClick ? 'button' : 'span'
  return (
    <Tag
      onClick={onClick}
      style={{
        height: 32,
        padding: '0 14px',
        borderRadius: 999,
        border: `1px solid ${active ? colors.content.primary : colors.default[200]}`,
        background: active ? colors.content.primary : colors.layout.surface,
        color: active ? '#fff' : colors.content.secondary,
        fontSize: 13,
        fontWeight: 500,
        cursor: onClick ? 'pointer' : 'default',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
      {count !== undefined && <span style={{ opacity: 0.7 }}>{count}</span>}
    </Tag>
  )
}
