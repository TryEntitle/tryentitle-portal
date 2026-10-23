'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/Card'
import Switch from '@/components/Switch'
import { colors } from '@/lib/theme'

type Prefs = { order_updates: boolean; new_messages: boolean; weekly_summary: boolean }

const ROWS: { key: keyof Prefs; label: string; desc: string }[] = [
  { key: 'order_updates', label: 'Order updates', desc: 'Email me when an order changes status.' },
  { key: 'new_messages', label: 'New messages', desc: 'Email me when a customer writes in.' },
  { key: 'weekly_summary', label: 'Weekly summary', desc: 'A Monday digest of sales and activity.' },
]

export default function NotificationsTab({ userId, prefs }: { userId: string; prefs: Prefs }) {
  const [state, setState] = useState(prefs)

  async function flip(key: keyof Prefs) {
    const next = { ...state, [key]: !state[key] }
    setState(next)
    const supabase = createClient()
    await supabase.from('notification_prefs').upsert({ user_id: userId, ...next })
  }

  return (
    <Card style={{ padding: '4px 24px' }}>
      {ROWS.map((r) => (
        <div
          key={r.key}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            padding: '14px 0',
            borderBottom: `1px solid ${colors.default[100]}`,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{r.label}</span>
            <span style={{ fontSize: 12.5, color: colors.content.muted }}>{r.desc}</span>
          </div>
          <Switch on={state[r.key]} onClick={() => flip(r.key)} />
        </div>
      ))}
    </Card>
  )
}
