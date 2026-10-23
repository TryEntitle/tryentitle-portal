import { colors } from '@/lib/theme'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost'

const VARIANTS: Record<Variant, React.CSSProperties> = {
  // Dark pill — the main call-to-action style used across the app (login's
  // sign-in button, "Save changes", etc).
  primary: {
    background: colors.content.primary,
    color: colors.layout.surface,
    border: 'none',
  },
  // Orange pill — for the single most important action on brighter surfaces
  // (e.g. "Pay out now", "Send invite").
  secondary: {
    background: colors.secondary[500],
    color: '#fff',
    border: 'none',
  },
  // Bordered, transparent — secondary actions (Cancel, Download).
  outline: {
    background: colors.layout.surface,
    color: colors.content.primary,
    border: `1px solid ${colors.layout.divider}`,
  },
  // No border/background — tertiary text-like actions.
  ghost: {
    background: 'transparent',
    color: colors.secondary[600],
    border: 'none',
  },
}

export default function Button({
  variant = 'primary',
  style,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...rest}
      style={{
        height: 40,
        padding: '0 20px',
        borderRadius: 999,
        fontSize: 14,
        fontWeight: 600,
        cursor: rest.disabled ? 'default' : 'pointer',
        opacity: rest.disabled ? 0.6 : 1,
        ...VARIANTS[variant],
        ...style,
      }}
    >
      {children}
    </button>
  )
}
