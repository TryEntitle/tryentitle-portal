import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import Table, { Td } from '@/components/Table'
import { ADMIN_NAV } from '@/lib/nav'

export default async function AdminCustomers() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: customers } = await supabase.from('profiles').select('id, company, role')

  return (
    <AppShell
      title="Customers"
      subtitle="Everyone with access to your portal."
      userEmail={user?.email}
      nav={ADMIN_NAV}
    >
      <Table columns={['Company', 'Role', 'ID']}>
        {(customers ?? []).map((c) => (
          <tr key={c.id}>
            <Td>{c.company || '—'}</Td>
            <Td style={{ textTransform: 'capitalize' }}>{c.role}</Td>
            <Td>
              <span style={{ color: '#aaa', fontSize: 12 }}>{c.id}</span>
            </Td>
          </tr>
        ))}
        {!customers?.length && (
          <tr>
            <Td>No customers yet.</Td>
            <Td></Td>
            <Td></Td>
          </tr>
        )}
      </Table>
    </AppShell>
  )
}
