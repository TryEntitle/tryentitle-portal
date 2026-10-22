import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import Table, { Td } from '@/components/Table'
import StatusBadge from '@/components/StatusBadge'
import Pill from '@/components/Pill'
import EmptyState from '@/components/EmptyState'
import { OrdersIcon } from '@/components/icons'
import { ADMIN_NAV } from '@/lib/nav'
import { currency } from '@/lib/analytics'

const STATUSES = ['new', 'in progress', 'completed', 'cancelled']
const LABEL: Record<string, string> = { new: 'New', 'in progress': 'In progress', completed: 'Completed', cancelled: 'Cancelled' }

export default async function AdminOrders({ searchParams }: { searchParams: { status?: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: customers } = await supabase.from('profiles').select('id, company')
  const { data: orders } = await supabase
    .from('orders')
    .select('id, title, amount, status, created_at, customer_id')
    .order('created_at', { ascending: false })

  const all = orders ?? []
  const companyById = new Map((customers ?? []).map((c) => [c.id, c.company]))
  const active = searchParams.status && STATUSES.includes(searchParams.status) ? searchParams.status : null
  const filtered = active ? all.filter((o) => (o.status || 'new') === active) : all

  return (
    <AppShell title="Orders" subtitle="Everything your customers have ordered." userEmail={user?.email} nav={ADMIN_NAV}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Pill href="/admin/orders" active={!active} count={all.length}>
            All
          </Pill>
          {STATUSES.map((s) => (
            <Pill
              key={s}
              href={`/admin/orders?status=${encodeURIComponent(s)}`}
              active={active === s}
              count={all.filter((o) => (o.status || 'new') === s).length}
            >
              {LABEL[s]}
            </Pill>
          ))}
        </div>

        {all.length === 0 ? (
          <EmptyState
            icon={<OrdersIcon size={22} />}
            title="No orders yet"
            text="When a customer orders something, it will show up here with its status and amount."
          />
        ) : (
          <Table columns={['Order', 'Customer', 'Amount', 'Status', 'Created']}>
            {filtered.map((o) => (
              <tr key={o.id}>
                <Td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Link href={`/admin/orders/${o.id}`} style={{ fontWeight: 500, color: 'inherit', textDecoration: 'none' }}>
                      {o.title || 'Untitled order'}
                    </Link>
                    <span style={{ fontSize: 12, color: '#aaa', fontFamily: 'ui-monospace, monospace' }}>#{o.id}</span>
                  </div>
                </Td>
                <Td>{companyById.get(o.customer_id) || <span style={{ color: '#aaa' }}>Unknown customer</span>}</Td>
                <Td>{currency(Number(o.amount) || 0)}</Td>
                <Td>
                  <StatusBadge status={o.status || 'new'} />
                </Td>
                <Td>{o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}</Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <Td>No orders with this status.</Td>
                <Td></Td>
                <Td></Td>
                <Td></Td>
                <Td></Td>
              </tr>
            )}
          </Table>
        )}
      </div>
    </AppShell>
  )
}
