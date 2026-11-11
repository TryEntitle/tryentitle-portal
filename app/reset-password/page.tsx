'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import AuthShell, { authButtonStyle, authInputStyle, authLinkStyle } from '@/components/AuthShell'
import { friendlyAuthError } from '@/lib/friendlyError'
import { colors } from '@/lib/theme'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const origin = window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/update-password`,
    })
    setLoading(false)
    if (error) {
      setError(friendlyAuthError(error.message))
      return
    }
    setSent(true)
  }

  return (
    <AuthShell>
      <form onSubmit={onSubmit} style={{ width: '100%', display: 'grid', gap: 16 }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 600 }}>Reset password</h1>
        <p style={{ margin: 0, fontSize: 14, color: colors.content.muted, lineHeight: 1.45 }}>
          Enter your email and we&apos;ll send a link to choose a new password.
        </p>
        {sent ? (
          <>
            <p style={{ color: colors.success[600], fontSize: 14, margin: 0, lineHeight: 1.45 }}>
              If an account exists for that email, a reset link is on its way. Check your inbox.
            </p>
            <p style={{ margin: '4px 0 0', textAlign: 'center', fontSize: 13, color: colors.content.muted }}>
              <Link href="/login" style={authLinkStyle}>
                Back to sign in
              </Link>
            </p>
          </>
        ) : (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={authInputStyle}
            />
            {error && <p style={{ color: colors.danger[600], fontSize: 14, margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ ...authButtonStyle, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
            <p style={{ margin: '4px 0 0', textAlign: 'center', fontSize: 13, color: colors.content.muted }}>
              <Link href="/login" style={authLinkStyle}>
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </form>
    </AuthShell>
  )
}
