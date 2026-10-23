import Link from 'next/link'
import { colors } from '@/lib/theme'
import Button from '@/components/Button'

const ctaStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  height: 40,
  padding: '0 20px',
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 600,
  background: colors.content.primary,
  color: colors.layout.surface,
  textDecoration: 'none',
}

export default function EmptyState({
  icon,
  title,
  text,
  cta,
}: {
  icon: React.ReactNode
  title: string
  text: string
  cta?: { label: string; onClick?: () => void; href?: string }
}) {
  return (
    <div
      style={{
        border: `1px solid ${colors.layout.divider}`,
        background: colors.layout.surface,
        borderRadius: 16,
        padding: '56px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 10,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: colors.secondary[50],
          color: colors.secondary[500],
          display: 'grid',
          placeItems: 'center',
          marginBottom: 6,
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 17, fontWeight: 600, color: colors.content.primary }}>{title}</div>
      <div style={{ fontSize: 14, color: colors.content.muted, maxWidth: 380, lineHeight: 1.5 }}>{text}</div>
      {cta && (
        <div style={{ marginTop: 10 }}>
          {cta.href ? (
            <Link href={cta.href} style={ctaStyle}>
              {cta.label}
            </Link>
          ) : (
            <Button onClick={cta.onClick}>{cta.label}</Button>
          )}
        </div>
      )}
    </div>
  )
}
