import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import Card from '@/components/Card'
import StatusBadge from '@/components/StatusBadge'
import OrderTimeline from '@/components/OrderTimeline'
import DownloadReceiptButton from '@/components/DownloadReceiptButton'
import { ChevronLeftIcon } from '@/components/icons'
import { ADMIN_NAV } from '@/lib/nav'
import { currency } from '@/lib/analytics'
import { labelFor } from '@/lib/customers'
import { colors } from '@/lib/theme'

export default async function AdminOrderDetail({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: order } = await supabase.from('orders').select('*').eq('id', params.id).maybeSingle()
  if (!order) notFound()
  const { data: customer } = await supabase.from('profiles').select('id, company, email').eq('id', order.customer_id).maybeSingle()

  const status = order.status || 'new'
  const customerLabel = labelFor(customer?.company ?? null, customer?.email ?? null)

  return (
    <AppShell
      title={order.title || 'Untitled order'}
      subtitle={`#${order.id} · ${customerLabel}`}
      userEmail={user?.email}
      nav={ADMIN_NAV}
    >
      <Link
        href="/admin/orders"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: colors.secondary[600], textDecoration: 'none', marginBottom: 16 }}
      >
        <ChevronLeftIcon size={14} /> Orders
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 18, alignItems: 'start' }}>
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Details</h2>
            <StatusBadge status={status} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '18px 16px' }}>
            <Field label="Order ID" value={`#${order.id}`} mono />
            <Field label="Amount" value={currency(Number(order.amount) || 0)} strong />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12.5, color: colors.content.muted }}>Customer</span>
              <Link href={`/admin/customers/${order.customer_id}`} style={{ fontSize: 14, color: colors.secondary[600], textDecoration: 'none' }}>
                {customerLabel}
              </Link>
            </div>
            <Field label="Created" value={order.created_at ? new Date(order.created_at).toLocaleString() : '—'} />
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 16, borderTop: `1px solid ${colors.layout.divider}` }}>
            <DownloadReceiptButton
              orderId={order.id}
              title={order.title || 'Untitled order'}
              amount={currency(Number(order.amount) || 0)}
              customer={customerLabel}
              createdAt={order.created_at ? new Date(order.created_at).toLocaleString() : '—'}
            />
          </div>
        </Card>
        <Card>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 18px' }}>Timeline</h2>
          <OrderTimeline status={status} createdAt={order.created_at} />
        </Card>
      </div>
    </AppShell>
  )
}

function Field({ label, value, mono, strong }: { label: string; value: string; mono?: boolean; strong?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 12.5, color: colors.content.muted }}>{label}</span>
      <span
        style={{
          fontSize: 14,
          fontWeight: strong ? 600 : 400,
          fontFamily: mono ? 'ui-monospace, monospace' : undefined,
        }}
      >
        {value}
      </span>
    </div>
  )
}
