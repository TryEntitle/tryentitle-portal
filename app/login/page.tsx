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
  const supabase = createClient()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
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
      <div
        style={{
          maxWidth: 1000,
          margin: '0 auto',
          minHeight: 'calc(100vh - 48px)',
          borderRadius: 20,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        }}
      >
        <div
          style={{
            background: colors.content.primary,
            padding: 40,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Image src="/demo/logo-wordmark.png" alt="TryEntitle" width={260} height={91} priority unoptimized />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '24px 0' }}>
            <WorkflowPattern />
          </div>
          <span style={{ color: colors.default[500], fontSize: 12 }}>&copy; {new Date().getFullYear()} TryEntitle</span>
        </div>

        <div style={{ background: colors.layout.surface, display: 'grid', placeItems: 'center', padding: 32 }}>
          <form onSubmit={onSubmit} style={{ maxWidth: 320, width: '100%', display: 'grid', gap: 16 }}>
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
