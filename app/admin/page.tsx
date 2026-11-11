import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import AnalyticsView from '@/components/AnalyticsView'
import { ADMIN_NAV } from '@/lib/nav'

// Analytics. RLS lets admins read every customer's rows; AnalyticsView does
// all the range-filtering/bucketing client-side so switching ranges is
// instant (no refetch). Payouts feed Funds received / P&L expense.
export default async function Admin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: customers } = await supabase.from('profiles').select('id, company, role')
  const { data: orders } = await supabase
    .from('orders')
    .select('id, amount, status, created_at, customer_id')
    .order('created_at', { ascending: false })
  const { data: payouts } = await supabase
    .from('payouts')
    .select('amount, status, created_at')
    .order('created_at', { ascending: false })

  return (
    <AppShell
      title="Analytics"
      subtitle="Sales, revenue and user activity."
      userEmail={user?.email}
      nav={ADMIN_NAV}
    >
      <AnalyticsView orders={orders ?? []} customers={customers ?? []} payouts={payouts ?? []} />
    </AppShell>
  )
}
