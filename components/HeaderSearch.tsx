'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SearchIcon } from '@/components/icons'
import { colors } from '@/lib/theme'
import { currency } from '@/lib/analytics'
import { labelFor } from '@/lib/customers'

type Result = { kind: string; label: string; sub: string; href: string }

export default function HeaderSearch({ wide }: { wide?: boolean }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      const supabase = createClient()
      const [orders, customers, products] = await Promise.all([
        supabase.from('orders').select('id, title, amount').ilike('title', `%${q}%`).limit(4),
        supabase.from('profiles').select('id, company, email').or(`company.ilike.%${q}%,email.ilike.%${q}%`).limit(3),
        supabase.from('products').select('id, name, price').ilike('name', `%${q}%`).limit(3),
      ])
      const next: Result[] = [
        ...(orders.data ?? []).map((o) => ({ kind: 'Order', label: o.title || 'Untitled order', sub: `#${o.id} · ${currency(Number(o.amount) || 0)}`, href: `/admin/orders/${o.id}` })),
        ...(customers.data ?? []).map((c) => ({ kind: 'Customer', label: labelFor(c.company, c.email), sub: c.email || '', href: `/admin/customers/${c.id}` })),
        ...(products.data ?? []).map((p) => ({ kind: 'Product', label: p.name, sub: currency(Number(p.price) || 0), href: `/admin/products/${p.id}` })),
      ]
      setResults(next)
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={boxRef} style={{ position: 'relative', flex: wide ? '1 1 auto' : '0 0 auto' }}>
      <span style={{ position: 'absolute', left: 12, top: 13, color: colors.default[400], pointerEvents: 'none' }}>
        <SearchIcon size={15} />
      </span>
      <input
        placeholder="Search"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        style={{
          height: 40,
          width: wide ? '100%' : 240,
          boxSizing: 'border-box',
          border: `1px solid ${colors.layout.divider}`,
          borderRadius: 8,
          padding: '0 12px 0 34px',
          fontSize: 14,
          background: colors.layout.surface,
          outline: 'none',
        }}
      />
      {open && query.trim() && (
        <div
          style={{
            position: 'absolute',
            top: 48,
            right: 0,
            width: 320,
            maxWidth: 'calc(100vw - 32px)',
            background: colors.layout.surface,
            border: `1px solid ${colors.layout.divider}`,
            borderRadius: 12,
            boxShadow: '0 12px 32px rgba(31,30,28,0.12)',
            zIndex: 15,
            overflow: 'hidden',
            padding: '6px 0',
          }}
        >
          {results.length === 0 && (
            <div style={{ padding: '14px 16px', fontSize: 13.5, color: colors.content.muted }}>Nothing matches &quot;{query}&quot;.</div>
          )}
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => {
                setOpen(false)
                setQuery('')
                router.push(r.href)
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 16px',
                border: 'none',
                background: colors.layout.surface,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase', color: colors.content.muted, width: 56, flexShrink: 0 }}>
                {r.kind}
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
                <span style={{ fontSize: 14, color: colors.content.primary }}>{r.label}</span>
                <span style={{ fontSize: 12.5, color: colors.content.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.sub}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
