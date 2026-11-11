'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import AuthShell, { authButtonStyle, authInputStyle, authLinkStyle } from '@/components/AuthShell'
import { colors } from '@/lib/theme'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const [checking, setChecking] = useState(true)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Session is established by /auth/callback (PKCE code exchange). Also accept
  // legacy hash tokens if Supabase still delivers them that way.
  useEffect(() => {
    let cancelled = false
    async function check() {
      const supabase = createClient()
      const hash = typeof window !== 'undefined' ? window.location.hash : ''
      if (hash.includes('access_token') || hash.includes('type=recovery')) {
        // Let the client parse the hash into a session.
        await supabase.auth.getSession()
      }
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!cancelled) {
        setReady(!!session)
        setChecking(false)
      }
    }
    check()
    return () => {
      cancelled = true
    }
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
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
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(friendlyAuthError(error.message))
      setLoading(false)
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <AuthShell>
      <form onSubmit={onSubmit} style={{ width: '100%', display: 'grid', gap: 16 }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 600 }}>Choose a new password</h1>
        {checking ? (
          <p style={{ margin: 0, fontSize: 14, color: colors.content.muted }}>Checking your reset link…</p>
        ) : !ready ? (
          <>
            <p style={{ margin: 0, fontSize: 14, color: colors.danger[600], lineHeight: 1.45 }}>
              This reset link is missing or expired. Request a new one from the forgot-password page.
            </p>
            <p style={{ margin: '4px 0 0', textAlign: 'center', fontSize: 13, color: colors.content.muted }}>
              <Link href="/reset-password" style={authLinkStyle}>
                Request a new link
              </Link>
            </p>
          </>
        ) : (
          <>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
              style={authInputStyle}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
              style={authInputStyle}
            />
            {error && <p style={{ color: colors.danger[600], fontSize: 14, margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ ...authButtonStyle, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Saving...' : 'Update password'}
            </button>
          </>
        )}
      </form>
    </AuthShell>
  )
}
