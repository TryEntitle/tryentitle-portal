'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16 }}>
      <form
        onSubmit={onSubmit}
        style={{ maxWidth: 320, width: '100%', display: 'grid', gap: 12 }}
      >
        <h1 style={{ margin: 0 }}>TryEntitle</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <p style={{ margin: '16px 0 0', textAlign: 'center', fontSize: 12, color: '#888' }}>
          Powered by <strong>TryEntitle</strong>
        </p>
      </form>
    </div>
  )
}
