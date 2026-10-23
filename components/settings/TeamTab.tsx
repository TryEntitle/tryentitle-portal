'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { TextInput } from '@/components/Input'
import StatusBadge from '@/components/StatusBadge'
import { initialsFor, labelFor } from '@/lib/customers'
import { colors } from '@/lib/theme'

type Teammate = { id: string; email: string | null; full_name: string | null; company: string | null; created_at: string | null }

export default function TeamTab({ currentUserId, teammates }: { currentUserId: string; teammates: Teammate[] }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const ownerId = useMemo(() => {
    const sorted = [...teammates].sort((a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? ''))
    return sorted[0]?.id
  }, [teammates])

  async function invite() {
    setError('')
    setSending(true)
    const res = await fetch('/api/admin/invite-teammate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const body = await res.json().catch(() => ({}))
    setSending(false)
    if (!res.ok) return setError(body.error || 'Could not send the invite.')
    setEmail('')
    router.refresh()
  }

  async function remove(id: string) {
    setRemovingId(id)
    const supabase = createClient()
    await supabase.from('profiles').update({ role: 'customer' }).eq('id', id)
    setRemovingId(null)
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Invite a teammate</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <TextInput
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            style={{ flex: '1 1 220px', width: 'auto' }}
          />
          <Button onClick={invite} disabled={sending || !email.trim()}>
            {sending ? 'Sending...' : 'Send invite'}
          </Button>
        </div>
        {error && <div style={{ fontSize: 13, color: '#a3321f' }}>{error}</div>}
        <div style={{ fontSize: 12.5, color: colors.content.muted, lineHeight: 1.5 }}>
          Invites grant full admin access — there&apos;s only one real team role today, since nothing in
          the database yet enforces a more limited one.
        </div>
      </Card>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {teammates.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 14,
              padding: '14px 20px',
              borderBottom: `1px solid ${colors.default[100]}`,
            }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                flexShrink: 0,
                borderRadius: '50%',
                background: colors.primary[50],
                color: colors.primary[600],
                display: 'grid',
                placeItems: 'center',
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              {initialsFor(m.company, m.email, m.full_name)}
            </span>
            <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{labelFor(m.company, m.email, m.full_name)}</span>
              <span style={{ fontSize: 12.5, color: colors.content.muted }}>{m.email}</span>
            </div>
            {m.id === ownerId ? (
              <span style={{ fontSize: 13.5, color: colors.content.muted, width: 96 }}>Owner</span>
            ) : (
              <>
                <StatusBadge status="active" />
                {m.id !== currentUserId && (
                  <Button variant="ghost" onClick={() => remove(m.id)} disabled={removingId === m.id}>
                    {removingId === m.id ? 'Removing...' : 'Remove'}
                  </Button>
                )}
              </>
            )}
          </div>
        ))}
      </Card>
    </div>
  )
}
