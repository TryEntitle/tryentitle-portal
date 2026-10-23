'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import IconButton from '@/components/IconButton'
import { MailIcon, BellIcon } from '@/components/icons'
import { colors } from '@/lib/theme'
import { labelFor } from '@/lib/customers'

type Item = { text: string; time: string; href: string }

export default function HeaderNotifications() {
  const router = useRouter()
  const [open, setOpen] = useState<'mail' | 'bell' | null>(null)
  const [threads, setThreads] = useState<Item[]>([])
  const [events, setEvents] = useState<Item[]>([])
  const [readAll, setReadAll] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: messages }, { data: orders }, { data: customers }] = await Promise.all([
        supabase.from('messages').select('customer_id, sender_id, body, created_at').order('created_at', { ascending: false }).limit(20),
        supabase.from('orders').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('profiles').select('id, company, email'),
      ])
      const companyById = new Map((customers ?? []).map((c) => [c.id, c]))

      const seen = new Set<string>()
      const threadItems: Item[] = []
      for (const m of messages ?? []) {
        if (seen.has(m.customer_id)) continue
        seen.add(m.customer_id)
        const c = companyById.get(m.customer_id)
        threadItems.push({
          text: `${labelFor(c?.company ?? null, c?.email ?? null)}: ${m.body}`,
          time: new Date(m.created_at).toLocaleDateString(),
          href: `/admin/messages?customer=${m.customer_id}`,
        })
        if (threadItems.length >= 4) break
      }
      setThreads(threadItems)

      const incoming = (messages ?? [])
        .filter((m) => m.sender_id !== user.id)
        .slice(0, 4)
        .map((m) => {
          const c = companyById.get(m.customer_id)
          return { text: `${labelFor(c?.company ?? null, c?.email ?? null)} sent you a message`, time: m.created_at, href: `/admin/messages?customer=${m.customer_id}` }
        })
      const newOrders = (orders ?? []).map((o) => ({ text: `New order: ${o.title || 'Untitled order'}`, time: o.created_at ?? '', href: `/admin/orders/${o.id}` }))
      const combined = [...incoming, ...newOrders].sort((a, b) => (a.time < b.time ? 1 : -1)).slice(0, 4)
      setEvents(combined.map((e) => ({ ...e, time: e.time ? new Date(e.time).toLocaleDateString() : '' })))
    }
    load()
  }, [])

  return (
    <div style={{ display: 'flex', gap: 10, position: 'relative' }}>
      <IconButton title="Messages" active={open === 'mail'} onClick={() => setOpen(open === 'mail' ? null : 'mail')}>
        <MailIcon size={18} />
      </IconButton>
      <IconButton title="Notifications" active={open === 'bell'} onClick={() => setOpen(open === 'bell' ? null : 'bell')} style={{ position: 'relative' }}>
        <BellIcon size={18} />
        {!readAll && events.length > 0 && (
          <span style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: '50%', background: colors.secondary[500], border: '1.5px solid #fff' }} />
        )}
      </IconButton>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 48,
            right: open === 'mail' ? 50 : 0,
            width: 300,
            background: colors.layout.surface,
            border: `1px solid ${colors.layout.divider}`,
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            zIndex: 10,
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: `1px solid ${colors.default[100]}` }}>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>{open === 'mail' ? 'Messages' : 'Notifications'}</span>
            {open === 'bell' && (
              <button onClick={() => setReadAll(true)} style={{ border: 'none', background: 'none', padding: 0, fontSize: 12.5, color: colors.secondary[600], cursor: 'pointer' }}>
                Mark all as read
              </button>
            )}
          </div>
          {(open === 'mail' ? threads : events).length === 0 && (
            <div style={{ padding: '18px 16px', fontSize: 13, color: colors.content.muted }}>
              {open === 'mail' ? 'No messages yet.' : "You're all caught up."}
            </div>
          )}
          {(open === 'mail' ? threads : events).map((item, i) => (
            <button
              key={i}
              onClick={() => {
                setOpen(null)
                router.push(item.href)
              }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                padding: '12px 16px',
                border: 'none',
                borderBottom: `1px solid ${colors.default[50]}`,
                background: colors.layout.surface,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 13.5, color: colors.content.primary, lineHeight: 1.4 }}>{item.text}</span>
              <span style={{ fontSize: 12, color: colors.content.muted }}>{item.time}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
