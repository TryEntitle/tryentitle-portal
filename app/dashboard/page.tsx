import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import StatCard from '@/components/StatCard'
import Table, { Td } from '@/components/Table'
import StatusBadge from '@/components/StatusBadge'
import { OrdersIcon, PulseIcon, CheckIcon } from '@/components/icons'
import { CUSTOMER_NAV } from '@/lib/nav'

// Customer dashboard. RLS filters rows to the logged-in customer automatically.
export default async function Dashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  const active = (orders ?? []).filter((o) => o.status !== 'completed' && o.status !== 'cancelled')
  const completed = (orders ?? []).filter((o) => o.status === 'completed')
  const recent = (orders ?? []).slice(0, 5)

  return (
    <AppShell
      title="Dashboard"
      subtitle="Your orders and account activity."
      userEmail={user?.email}
      nav={CUSTOMER_NAV}
    >
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard label="Total orders" value={orders?.length ?? 0} icon={<OrdersIcon />} />
        <StatCard label="Active" value={active.length} icon={<PulseIcon />} />
        <StatCard label="Completed" value={completed.length} icon={<CheckIcon />} />
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
