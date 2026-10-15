import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/LogoutButton'

// Admin dashboard. RLS lets admins read every customer's rows.
export default async function Admin() {
  const supabase = await createClient()
  const { data: customers } = await supabase.from('profiles').select('id, company, role')
  const { data: orders } = await supabase.from('orders').select('*')

  return (
    <main style={{ padding: 24 }}>
      <h1>Admin</h1>
      <LogoutButton />
      <h2>Customers</h2>
      <pre>{JSON.stringify(customers, null, 2)}</pre>
      <h2>All orders</h2>
      <pre>{JSON.stringify(orders, null, 2)}</pre>
      {/* Replace the <pre> blocks with your existing dashboard components */}
    </main>
  )
}
