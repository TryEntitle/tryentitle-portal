import Link from 'next/link'
import { colors } from '@/lib/theme'

const pillStyle = (active?: boolean): React.CSSProperties => ({
  height: 32,
  padding: '0 14px',
  borderRadius: 999,
  border: `1px solid ${active ? colors.content.primary : colors.default[200]}`,
  background: active ? colors.content.primary : colors.layout.surface,
  color: active ? '#fff' : colors.content.secondary,
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  whiteSpace: 'nowrap',
  textDecoration: 'none',
})

// Neutral/selectable pill — filter chips, segmented range pickers. For an
// order/product status badge use StatusBadge instead. Pass `href` for a
// server-rendered filter link (no client JS needed); `onClick` for a
// client-side toggle.
export default function Pill({
  children,
  active,
  onClick,
  href,
  count,
}: {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
  href?: string
  count?: number
}) {
  const content = (
    <>
      {children}
      {count !== undefined && <span style={{ opacity: 0.7 }}>{count}</span>}
    </>
  )
  if (href) {
    return (
      <Link href={href} style={pillStyle(active)}>
        {content}
      </Link>
    )
  }
  const Tag = onClick ? 'button' : 'span'
  return (
    <Tag onClick={onClick} style={{ ...pillStyle(active), cursor: onClick ? 'pointer' : 'default' }}>
      {content}
    </Tag>
  )
}
