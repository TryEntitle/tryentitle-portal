'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import WorkflowPattern from '@/components/WorkflowPattern'
import { colors } from '@/lib/theme'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Create the client only on submit — calling createBrowserClient during
  // prerender throws when NEXT_PUBLIC_SUPABASE_* aren't available at build.
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/') // app/page.tsx sends admins to /admin, customers to /dashboard
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.layout.background, padding: 24, boxSizing: 'border-box' }}>
      <style>{`
        .te-login-shell { max-width: 1000px; margin: 0 auto; min-height: calc(100vh - 48px); border-radius: 20px; overflow: hidden; display: grid; grid-template-columns: 1fr 1fr; box-shadow: 0 20px 60px rgba(0,0,0,0.08); }
        .te-login-art { background: ${colors.content.primary}; padding: 40px; display: flex; flex-direction: column; justify-content: space-between; }
        .te-login-form-pane { background: ${colors.layout.surface}; display: grid; place-items: center; padding: 32px; }
        .te-login-mobile-brand { display: none; }
        @media (max-width: 860px) {
          .te-login-shell { grid-template-columns: 1fr; min-height: auto; }
          .te-login-art { display: none; }
          .te-login-form-pane { padding: 28px 20px; }
          .te-login-mobile-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
        }
      `}</style>
      <div className="te-login-shell">
        <div className="te-login-art">
          <Image src="/logo-wordmark.png" alt="TryEntitle" width={260} height={91} priority unoptimized />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '24px 0' }}>
            <WorkflowPattern />
          </div>
          <span style={{ color: colors.default[500], fontSize: 12 }}>&copy; {new Date().getFullYear()} TryEntitle</span>
        </div>

        <div className="te-login-form-pane">
          <form onSubmit={onSubmit} style={{ maxWidth: 320, width: '100%', display: 'grid', gap: 16 }}>
            <div className="te-login-mobile-brand">
              <Image src="/logo.png" alt="TryEntitle" width={36} height={36} priority unoptimized />
              <span style={{ fontSize: 18, fontWeight: 600, color: colors.content.primary }}>TryEntitle</span>
            </div>
            <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 600 }}>Sign in to your account</h1>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
            {error && <p style={{ color: colors.danger[600], fontSize: 14, margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <p style={{ margin: '8px 0 0', textAlign: 'center', fontSize: 13, color: colors.content.muted }}>
              Need access?{' '}
              <a href="mailto:hello@tryentitle.tech" style={{ color: colors.secondary[500], textDecoration: 'none' }}>
                Contact us
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '14px 16px',
  borderRadius: 999,
  border: `1px solid ${colors.default[200]}`,
  fontSize: 15,
  outline: 'none',
}

const buttonStyle: React.CSSProperties = {
  padding: '14px 16px',
  borderRadius: 999,
  border: 'none',
  background: colors.content.primary,
  color: colors.layout.surface,
  fontSize: 15,
  fontWeight: 500,
  cursor: 'pointer',
}
