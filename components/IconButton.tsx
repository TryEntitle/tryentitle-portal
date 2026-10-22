import { colors } from '@/lib/theme'

export default function IconButton({
  children,
  active,
  style,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      {...rest}
      style={{
        width: 40,
        height: 40,
        flexShrink: 0,
        borderRadius: 10,
        border: `1px solid ${active ? colors.secondary[500] : colors.layout.divider}`,
        background: colors.layout.surface,
        color: colors.default[500],
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer',
        ...style,
      }}
    >
      {children}
    </button>
  )
}
