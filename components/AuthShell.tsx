'use client'
import Image from 'next/image'
import WorkflowPattern from '@/components/WorkflowPattern'
import { colors } from '@/lib/theme'
import { useIsMobile } from '@/lib/useIsMobile'

/** Shared split layout for login / signup / reset password screens. */
export default function AuthShell({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()

  return (
    <div style={{ minHeight: '100vh', background: colors.layout.background, padding: isMobile ? 16 : 24, boxSizing: 'border-box' }}>
      <div
        style={{
          maxWidth: 1000,
          margin: '0 auto',
          minHeight: isMobile ? undefined : 'calc(100vh - 48px)',
          borderRadius: 20,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        }}
      >
        {!isMobile && (
          <div
            style={{
              background: colors.content.primary,
              padding: 40,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Image src="/logo-wordmark.png" alt="TryEntitle" width={260} height={91} priority unoptimized />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '24px 0' }}>
              <WorkflowPattern />
            </div>
            <span style={{ color: colors.default[500], fontSize: 12 }}>&copy; {new Date().getFullYear()} TryEntitle</span>
          </div>
        )}

        <div
          style={{
            background: colors.layout.surface,
            display: 'grid',
            placeItems: 'center',
            padding: isMobile ? '28px 24px 36px' : 32,
          }}
        >
          {isMobile && (
            <div style={{ width: '100%', maxWidth: 320, marginBottom: 20 }}>
              <Image src="/logo.png" alt="TryEntitle" width={48} height={48} priority unoptimized />
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

export const authInputStyle: React.CSSProperties = {
  padding: '14px 16px',
  borderRadius: 999,
  border: `1px solid ${colors.default[200]}`,
  fontSize: 15,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

export const authButtonStyle: React.CSSProperties = {
  padding: '14px 16px',
  borderRadius: 999,
  border: 'none',
  background: colors.content.primary,
  color: colors.layout.surface,
  fontSize: 15,
  fontWeight: 500,
  cursor: 'pointer',
}

export const authLinkStyle: React.CSSProperties = {
  color: colors.secondary[500],
  textDecoration: 'none',
}
