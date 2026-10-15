import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import Table, { Td } from '@/components/Table'
import StatusBadge from '@/components/StatusBadge'
import { CUSTOMER_NAV } from '@/lib/nav'

export default async function DashboardOrders() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <AppShell title="Orders" subtitle="Everything you've ordered." userEmail={user?.email} nav={CUSTOMER_NAV}>
      <Table columns={['Title', 'Status', 'Created']}>
        {(orders ?? []).map((o) => (
          <tr key={o.id}>
            <Td>{o.title || '—'}</Td>
            <Td>
              <StatusBadge status={o.status} />
            </Td>
            <Td>{o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}</Td>
          </tr>
        ))}
        {!orders?.length && (
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
