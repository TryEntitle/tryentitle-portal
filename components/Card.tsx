import { colors } from '@/lib/theme'

export default function Card({
  children,
  style,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        border: `1px solid ${colors.layout.divider}`,
        background: colors.layout.surface,
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 8px 24px rgba(0,0,0,0.04)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
