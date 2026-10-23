'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useIsMobile } from '@/lib/useIsMobile'
import { colors } from '@/lib/theme'
import { ChevronLeftIcon, SendIcon } from '@/components/icons'

export type ThreadSummary = { customerId: string; label: string; initials: string; preview: string; time: string }
export type MessageRow = { id: number; sender_id: string; body: string; created_at: string }

export default function MessagesView({
  threads,
  selectedCustomerId,
  initialMessages,
  currentUserId,
}: {
  threads: ThreadSummary[]
  selectedCustomerId: string | null
  initialMessages: MessageRow[]
  currentUserId: string
}) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [view, setView] = useState<'list' | 'chat'>(isMobile ? 'list' : 'chat')
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages])

  // Live delivery for the other party's messages — our own sends are
  // appended directly from the insert's result, so no echo-dedup is needed.
  useEffect(() => {
    if (!selectedCustomerId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`messages:${selectedCustomerId}`)
      .on(
        'postgres_changes' as never,
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `customer_id=eq.${selectedCustomerId}` },
        (payload: { new: MessageRow }) => {
          setMessages((prev) => (prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new]))
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedCustomerId])

  function openThread(id: string) {
    setView('chat')
    router.push(`/admin/messages?customer=${id}`)
  }

  async function send() {
    const body = draft.trim()
    if (!body || !selectedCustomerId || sending) return
    setSending(true)
    setDraft('')
    const supabase = createClient()
    const { data, error } = await supabase
      .from('messages')
      .insert({ customer_id: selectedCustomerId, sender_id: currentUserId, body })
      .select()
      .single()
    setSending(false)
    if (!error && data) {
      setMessages((prev) => [...prev, data])
      router.refresh() // keeps the thread-list preview/time in sync
    }
  }

  const active = threads.find((t) => t.customerId === selectedCustomerId)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'minmax(220px, 300px) minmax(0, 1fr)',
        background: colors.layout.surface,
        border: `1px solid ${colors.layout.divider}`,
        borderRadius: 12,
        overflow: 'hidden',
        height: isMobile ? 'calc(100vh - 220px)' : 'calc(100vh - 150px)',
        minHeight: 420,
      }}
    >
      <div style={{ display: isMobile && view === 'chat' ? 'none' : 'block', borderRight: `1px solid ${colors.layout.divider}`, overflow: 'auto' }}>
        {threads.length === 0 && <div style={{ padding: 20, fontSize: 13, color: colors.content.muted }}>No conversations yet.</div>}
        {threads.map((t) => (
          <button
            key={t.customerId}
            onClick={() => openThread(t.customerId)}
            style={{
              width: '100%',
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              padding: '14px 16px',
              border: 'none',
              borderBottom: `1px solid ${colors.default[100]}`,
              background: t.customerId === selectedCustomerId ? colors.secondary[50] : colors.layout.surface,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                flexShrink: 0,
                borderRadius: '50%',
                background: colors.secondary[50],
                color: colors.secondary[600],
                display: 'grid',
                placeItems: 'center',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {t.initials}
            </span>
            <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: colors.content.primary }}>{t.label}</span>
                <span style={{ fontSize: 11.5, color: colors.content.muted, flexShrink: 0 }}>{t.time}</span>
              </span>
              <span style={{ fontSize: 12.5, color: colors.content.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {t.preview}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div style={{ display: isMobile && view === 'list' ? 'none' : 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${colors.layout.divider}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          {isMobile && (
            <button
              aria-label="Back"
              onClick={() => setView('list')}
              style={{ width: 32, height: 32, border: `1px solid ${colors.layout.divider}`, borderRadius: 8, background: colors.layout.surface, display: 'grid', placeItems: 'center', cursor: 'pointer' }}
            >
              <ChevronLeftIcon size={14} />
            </button>
          )}
          <span style={{ fontSize: 15, fontWeight: 600 }}>{active?.label || 'Select a conversation'}</span>
        </div>
        <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 10, background: colors.default[50] }}>
          {messages.map((m) => {
            const mine = m.sender_id === currentUserId
            return (
              <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '10px 14px',
                    borderRadius: 14,
                    fontSize: 14,
                    lineHeight: 1.45,
                    background: mine ? colors.secondary[500] : colors.layout.surface,
                    color: mine ? '#fff' : colors.content.primary,
                    border: mine ? 'none' : `1px solid ${colors.layout.divider}`,
                  }}
                >
                  {m.body}
                </div>
              </div>
            )
          })}
          {selectedCustomerId && messages.length === 0 && (
            <div style={{ fontSize: 13, color: colors.content.muted }}>No messages yet. Say hello.</div>
          )}
        </div>
        <div style={{ padding: 14, borderTop: `1px solid ${colors.layout.divider}`, display: 'flex', gap: 10 }}>
          <input
            placeholder="Write a reply"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send()
            }}
            disabled={!selectedCustomerId}
            style={{ flex: 1, minWidth: 0, height: 40, border: `1px solid ${colors.default[200]}`, borderRadius: 999, padding: '0 16px', fontSize: 14, outline: 'none' }}
          />
          <button
            onClick={send}
            disabled={!selectedCustomerId || !draft.trim()}
            style={{
              height: 40,
              padding: '0 20px',
              border: 'none',
              borderRadius: 999,
              background: colors.secondary[500],
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              opacity: !selectedCustomerId || !draft.trim() ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <SendIcon size={14} /> Send
          </button>
        </div>
      </div>
    </div>
  )
}
