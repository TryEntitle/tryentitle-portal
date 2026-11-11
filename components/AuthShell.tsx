'use client'
import Image from 'next/image'
import WorkflowPattern from '@/components/WorkflowPattern'
import { colors, breakpoints } from '@/lib/theme'

/**
 * Shared split layout for /login, /signup, /reset-password, /update-password.
 * Desktop: two-column art + form. ≤860px: art folds away, compact brand above
 * the stacked full-width form. ≤480px: edge-to-edge card for ~375px phones.
 */
export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="te-auth-page">
      <style>{`
        .te-auth-page {
          min-height: 100vh;
          background: ${colors.layout.background};
          padding: 24px;
          box-sizing: border-box;
          overflow-x: hidden;
        }
        .te-auth-shell {
          max-width: 1000px;
          width: 100%;
          margin: 0 auto;
          min-height: calc(100vh - 48px);
          border-radius: 20px;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 1fr;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
          box-sizing: border-box;
        }
        .te-auth-art {
          background: ${colors.content.primary};
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-width: 0;
        }
        .te-auth-form-pane {
          background: ${colors.layout.surface};
          display: grid;
          place-items: center;
          padding: 32px;
          min-width: 0;
          box-sizing: border-box;
        }
        .te-auth-form-stack {
          width: 100%;
          max-width: 320px;
          display: grid;
          gap: 0;
          box-sizing: border-box;
        }
        .te-auth-mobile-brand {
          display: none;
          width: 100%;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          box-sizing: border-box;
        }
        .te-auth-form-stack > form {
          width: 100%;
          max-width: none;
          box-sizing: border-box;
        }

        /* Tablet / small laptop (~768px): fold illustration, stack form */
        @media (max-width: ${breakpoints.mobile}px) {
          .te-auth-page {
            padding: 16px;
          }
          .te-auth-shell {
            grid-template-columns: 1fr;
            min-height: calc(100vh - 32px);
            border-radius: 16px;
          }
          .te-auth-art {
            display: none;
          }
          .te-auth-form-pane {
            padding: 36px 28px;
            align-content: center;
          }
          .te-auth-mobile-brand {
            display: flex;
          }
          .te-auth-form-stack {
            max-width: 400px;
          }
          .te-auth-form-stack > form h1 {
            font-size: 24px !important;
          }
        }

        /* Phone (~375px): full-bleed surface, safe-area padding */
        @media (max-width: 480px) {
          .te-auth-page {
            padding: 0;
            background: ${colors.layout.surface};
          }
          .te-auth-shell {
            min-height: 100vh;
            border-radius: 0;
            box-shadow: none;
          }
          .te-auth-form-pane {
            padding: 28px 20px;
            padding-top: max(48px, env(safe-area-inset-top, 48px));
            padding-bottom: max(28px, env(safe-area-inset-bottom, 28px));
            align-content: start;
          }
          .te-auth-form-stack {
            max-width: none;
          }
          .te-auth-form-stack > form h1 {
            font-size: 22px !important;
          }
        }
      `}</style>
      <div className="te-auth-shell">
        <div className="te-auth-art">
          <Image src="/logo-wordmark.png" alt="TryEntitle" width={260} height={91} priority unoptimized />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '24px 0' }}>
            <WorkflowPattern />
          </div>
          <span style={{ color: colors.default[500], fontSize: 12 }}>&copy; {new Date().getFullYear()} TryEntitle</span>
        </div>

        <div className="te-auth-form-pane">
          <div className="te-auth-form-stack">
            <div className="te-auth-mobile-brand">
              <Image src="/logo.png" alt="" width={36} height={36} priority unoptimized />
              <span style={{ fontSize: 18, fontWeight: 600, color: colors.content.primary }}>TryEntitle</span>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Touch-friendly pill inputs (16px avoids iOS focus zoom). */
export const authInputStyle: React.CSSProperties = {
  padding: '14px 16px',
  minHeight: 48,
  borderRadius: 999,
  border: `1px solid ${colors.default[200]}`,
  fontSize: 16,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  WebkitAppearance: 'none',
  appearance: 'none',
  background: colors.layout.surface,
  color: colors.content.primary,
}

export const authButtonStyle: React.CSSProperties = {
  padding: '14px 16px',
  minHeight: 48,
  borderRadius: 999,
  border: 'none',
  background: colors.content.primary,
  color: colors.layout.surface,
  fontSize: 16,
  fontWeight: 500,
  cursor: 'pointer',
  width: '100%',
  boxSizing: 'border-box',
  touchAction: 'manipulation',
}

export const authLinkStyle: React.CSSProperties = {
  color: colors.secondary[500],
  textDecoration: 'none',
}
