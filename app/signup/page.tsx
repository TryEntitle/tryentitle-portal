'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import AuthShell, { authButtonStyle, authInputStyle, authLinkStyle } from '@/components/AuthShell'
import { friendlyAuthError } from '@/lib/friendlyError'
import { colors } from '@/lib/theme'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const origin = window.location.origin
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/`,
      },
    })
    if (error) {
      setError(friendlyAuthError(error.message))
      setLoading(false)
      return
    }

    // When email confirmation is off, a session is returned immediately —
    // land in the app; BusinessInfoModal asks for company after login.
    if (data.session) {
      router.push('/')
      router.refresh()
      return
    }

    setLoading(false)
    setInfo('Check your email to confirm your account, then sign in.')
  }

  return (
    <AuthShell>
      <form onSubmit={onSubmit} style={{ width: '100%', display: 'grid', gap: 16 }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 600 }}>Create your account</h1>
        <p style={{ margin: 0, fontSize: 14, color: colors.content.muted, lineHeight: 1.45 }}>
          Sign up with email to get started with TryEntitle.
        </p>
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
          autoComplete="new-password"
          minLength={8}
          style={authInputStyle}
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          minLength={8}
          style={authInputStyle}
        />
        {error && <p style={{ color: colors.danger[600], fontSize: 14, margin: 0 }}>{error}</p>}
        {info && <p style={{ color: colors.success[600], fontSize: 14, margin: 0 }}>{info}</p>}
        <button type="submit" disabled={loading} style={{ ...authButtonStyle, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
        <p style={{ margin: '4px 0 0', textAlign: 'center', fontSize: 13, color: colors.content.muted }}>
          Already have an account?{' '}
          <Link href="/login" style={authLinkStyle}>
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
