'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { authButtonStyle, authInputStyle, authLinkStyle } from '@/components/AuthShell'
import { friendlyAuthError } from '@/lib/friendlyError'
import { colors } from '@/lib/theme'

/** Simple login: logo, email, password, forgot password — nothing else first. */
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
    <div
      style={{
        minHeight: '100vh',
        background: colors.layout.background,
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: '100%',
          maxWidth: 360,
          background: colors.layout.surface,
          borderRadius: 16,
          padding: '36px 28px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
          display: 'grid',
          gap: 14,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <Image src="/logo-wordmark.png" alt="TryEntitle" width={200} height={70} priority unoptimized />
        </div>

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

        <div style={{ textAlign: 'right', marginTop: -4 }}>
          <Link href="/reset-password" style={{ ...authLinkStyle, fontSize: 13 }}>
            Forgot password?
          </Link>
        </div>

        {error && <p style={{ color: colors.danger[600], fontSize: 14, margin: 0 }}>{error}</p>}

        <button type="submit" disabled={loading} style={{ ...authButtonStyle, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
