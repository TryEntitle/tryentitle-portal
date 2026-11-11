'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import AuthShell, { authButtonStyle, authInputStyle, authLinkStyle } from '@/components/AuthShell'
import { friendlyAuthError } from '@/lib/friendlyError'
import { colors } from '@/lib/theme'

/**
 * Split login matching the product mock: dark left panel with logo +
 * infographic (AuthShell / WorkflowPattern), form on the right.
 */
export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(friendlyAuthError(error.message))
        setLoading(false)
        return
      }
      router.push('/')
      router.refresh()
    } catch (err) {
      setError(friendlyAuthError(err instanceof Error ? err.message : undefined))
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      <form onSubmit={onSubmit} style={{ width: '100%', display: 'grid', gap: 16 }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 600, color: colors.content.primary }}>
          Sign in to your account
        </h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          style={authInputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          style={authInputStyle}
        />
        <div style={{ textAlign: 'right', marginTop: -6 }}>
          <Link href="/reset-password" style={{ ...authLinkStyle, fontSize: 13 }}>
            Forgot password?
          </Link>
        </div>
        {error && <p style={{ color: colors.danger[600], fontSize: 14, margin: 0 }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ ...authButtonStyle, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <p style={{ margin: '8px 0 0', textAlign: 'center', fontSize: 13, color: colors.content.muted }}>
          Need access?{' '}
          <a href="mailto:hello@tryentitle.tech" style={authLinkStyle}>
            Contact us
          </a>
        </p>
      </form>
    </AuthShell>
  )
}
