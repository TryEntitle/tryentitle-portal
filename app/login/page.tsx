'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import AuthShell, { authButtonStyle, authInputStyle, authLinkStyle } from '@/components/AuthShell'
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
    router.push('/') // app/page.tsx sends admins to /admin, customers to /dashboard (or onboarding)
    router.refresh()
  }

  return (
    <AuthShell>
      <form onSubmit={onSubmit} style={{ maxWidth: 320, width: '100%', display: 'grid', gap: 16 }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 600 }}>Sign in to your account</h1>
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
        {error && <p style={{ color: colors.danger[600], fontSize: 14, margin: 0 }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ ...authButtonStyle, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <p style={{ margin: 0, textAlign: 'center', fontSize: 13, color: colors.content.muted }}>
          <Link href="/reset-password" style={authLinkStyle}>
            Forgot password?
          </Link>
        </p>
        <p style={{ margin: '4px 0 0', textAlign: 'center', fontSize: 13, color: colors.content.muted }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={authLinkStyle}>
            Sign up
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
