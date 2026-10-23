import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import Table, { Td } from '@/components/Table'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import { UsersIcon } from '@/components/icons'
import { ADMIN_NAV } from '@/lib/nav'
import { currency } from '@/lib/analytics'
import { customerStatus, initialsFor, labelFor } from '@/lib/customers'
import { colors } from '@/lib/theme'

export default async function AdminCustomers() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: customers } = await supabase.from('profiles').select('id, company, email, created_at')
  const { data: orders } = await supabase.from('orders').select('customer_id, amount, status')

  const ordersByCustomer = new Map<string, { count: number; spent: number }>()
  for (const o of orders ?? []) {
    const cur = ordersByCustomer.get(o.customer_id) || { count: 0, spent: 0 }
    cur.count += 1
    if (o.status !== 'cancelled') cur.spent += Number(o.amount) || 0
    ordersByCustomer.set(o.customer_id, cur)
  }

  const rows = (customers ?? []).map((c) => {
    const agg = ordersByCustomer.get(c.id) || { count: 0, spent: 0 }
    return { ...c, orderCount: agg.count, spent: agg.spent, status: customerStatus(agg.count, c.created_at) }
  })

  return (
    <AppShell title="Customers" subtitle="Everyone who has access to your portal." userEmail={user?.email} nav={ADMIN_NAV}>
      {rows.length === 0 ? (
        <EmptyState
          icon={<UsersIcon size={22} />}
          title="No customers yet"
          text="Anyone who places an order is added here automatically, with their order history."
        />
      ) : (
        <Table columns={['Customer', 'Orders', 'Total spent', 'Joined', 'Status']}>
          {rows.map((c) => (
            <tr key={c.id}>
              <Td>
                <Link href={`/admin/customers/${c.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'inherit', textDecoration: 'none' }}>
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      flexShrink: 0,
                      borderRadius: '50%',
                      background: colors.primary[50],
                      color: colors.primary[600],
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {initialsFor(c.company, c.email)}
                  </span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <span style={{ fontWeight: 500 }}>{labelFor(c.company, c.email)}</span>
                    {c.email && <span style={{ fontSize: 12.5, color: colors.content.muted }}>{c.email}</span>}
                  </span>
                </Link>
              </Td>
              <Td>{c.orderCount}</Td>
              <Td>{currency(c.spent)}</Td>
              <Td>{c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}</Td>
              <Td>
                <StatusBadge status={c.status} />
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </AppShell>
  )
}
