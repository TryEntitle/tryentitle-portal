import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import StatCard from '@/components/StatCard'
import Table, { Td } from '@/components/Table'
import StatusBadge from '@/components/StatusBadge'
import { UsersIcon, OrdersIcon, PulseIcon } from '@/components/icons'
import { ADMIN_NAV } from '@/lib/nav'

// Admin dashboard. RLS lets admins read every customer's rows.
export default async function Admin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: customers } = await supabase.from('profiles').select('id, company, role')
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  const activeOrders = (orders ?? []).filter((o) => o.status !== 'completed' && o.status !== 'cancelled')
  const recent = (orders ?? []).slice(0, 5)

  return (
    <AppShell title="Admin" userEmail={user?.email} nav={ADMIN_NAV}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard label="Customers" value={customers?.length ?? 0} icon={<UsersIcon />} />
        <StatCard label="Total orders" value={orders?.length ?? 0} icon={<OrdersIcon />} />
        <StatCard label="Active orders" value={activeOrders.length} icon={<PulseIcon />} />
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 12px' }}>Recent orders</h2>
      <Table columns={['Title', 'Status', 'Created']}>
        {recent.map((o) => (
          <tr key={o.id}>
            <Td>{o.title || '—'}</Td>
            <Td>
              <StatusBadge status={o.status} />
            </Td>
            <Td>{o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}</Td>
          </tr>
        ))}
        {!recent.length && (
          <tr>
            <Td>No orders yet.</Td>
            <Td></Td>
            <Td></Td>
          </tr>
        )}
      </Table>
    </AppShell>
  )
}
