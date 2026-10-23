import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import Card from '@/components/Card'
import StatCard from '@/components/StatCard'
import Table, { Td } from '@/components/Table'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import { ChevronLeftIcon, OrdersIcon, DollarIcon, PulseIcon } from '@/components/icons'
import { ADMIN_NAV } from '@/lib/nav'
import { currency } from '@/lib/analytics'
import { customerStatus, initialsFor, labelFor } from '@/lib/customers'
import { colors } from '@/lib/theme'

export default async function AdminCustomerDetail({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: customer } = await supabase.from('profiles').select('*').eq('id', params.id).maybeSingle()
  if (!customer) notFound()
  const { data: orders } = await supabase
    .from('orders')
    .select('id, title, amount, status, created_at')
    .eq('customer_id', params.id)
    .order('created_at', { ascending: false })

  const all = orders ?? []
  const spent = all.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + (Number(o.amount) || 0), 0)
  const status = customerStatus(all.length, customer.created_at)
  const avgOrder = all.length ? spent / all.length : 0

  return (
    <AppShell title={labelFor(customer.company, customer.email)} subtitle={customer.email || undefined} userEmail={user?.email} nav={ADMIN_NAV}>
      <Link
        href="/admin/customers"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: colors.secondary[600], textDecoration: 'none', marginBottom: 16 }}
      >
        <ChevronLeftIcon size={14} /> Customers
      </Link>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Card style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 18 }}>
          <span
            style={{
              width: 56,
              height: 56,
              flexShrink: 0,
              borderRadius: '50%',
              background: colors.primary[50],
              color: colors.primary[600],
              display: 'grid',
              placeItems: 'center',
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            {initialsFor(customer.company, customer.email)}
          </span>
          <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>{labelFor(customer.company, customer.email)}</span>
            <span style={{ fontSize: 13, color: colors.content.muted }}>
              Customer since {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : '—'}
            </span>
          </div>
          <StatusBadge status={status} />
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          <StatCard label="Orders" value={all.length} icon={<OrdersIcon />} />
          <StatCard label="Total spent" value={currency(spent)} icon={<DollarIcon />} />
          <StatCard label="Average order" value={currency(avgOrder)} icon={<PulseIcon />} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Order history</h2>
          {all.length === 0 ? (
            <EmptyState icon={<OrdersIcon size={22} />} title="No orders yet" text="Orders this customer places will show up here." />
          ) : (
            <Table columns={['Order', 'Amount', 'Status', 'Created']}>
              {all.map((o) => (
                <tr key={o.id}>
                  <Td>
                    <Link href={`/admin/orders/${o.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontWeight: 500 }}>{o.title || 'Untitled order'}</span>
                        <span style={{ fontSize: 12, color: '#aaa', fontFamily: 'ui-monospace, monospace' }}>#{o.id}</span>
                      </div>
                    </Link>
                  </Td>
                  <Td>{currency(Number(o.amount) || 0)}</Td>
                  <Td>
                    <StatusBadge status={o.status || 'new'} />
                  </Td>
                  <Td>{o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}</Td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </div>
    </AppShell>
  )
}
