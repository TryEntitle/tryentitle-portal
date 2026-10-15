import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/LogoutButton'

// Customer dashboard. RLS filters rows to the logged-in customer automatically.
export default async function Dashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: orders } = await supabase.from('orders').select('*')

  return (
    <main style={{ padding: 24 }}>
      <h1>Your dashboard</h1>
      <p>{user?.email}</p>
      <LogoutButton />
      <pre>{JSON.stringify(orders, null, 2)}</pre>
      {/* Swap in your existing dashboard components here */}
    </main>
  )
}
