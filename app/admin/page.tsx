import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import StatCard from '@/components/StatCard'
import Table, { Td } from '@/components/Table'
import StatusBadge from '@/components/StatusBadge'
import { UsersIcon, OrdersIcon, PulseIcon, CheckIcon } from '@/components/icons'
import { ADMIN_NAV } from '@/lib/nav'
import BarChart from '@/components/BarChart'
import DonutChart from '@/components/DonutChart'
import Card from '@/components/Card'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Order counts for the last 6 months, oldest first.
function monthlyOrders(orders: { created_at: string | null }[]) {
  const now = new Date()
  const buckets: { label: string; value: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({ label: MONTHS[d.getMonth()], value: 0 })
  }
  for (const o of orders) {
    if (!o.created_at) continue
    const d = new Date(o.created_at)
    const monthsAgo =
      (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
    if (monthsAgo >= 0 && monthsAgo < 6) buckets[5 - monthsAgo].value += 1
  }
  return buckets
}

// Order counts grouped by status.
function statusBreakdown(orders: { status: string | null }[]) {
  const counts: Record<string, number> = {}
  for (const o of orders) {
    const key = (o.status || 'new').toLowerCase()
    counts[key] = (counts[key] || 0) + 1
  }
  return Object.entries(counts).map(([label, value]) => ({ label, value }))
}

const currency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

// Week-over-week % change for a stat card's trend badge.
function trendFor(current: number, previous: number): { direction: 'up' | 'down'; label: string } {
  if (previous === 0) {
    return current > 0 ? { direction: 'up', label: 'New this week' } : { direction: 'up', label: '0%' }
  }
  const pct = ((current - previous) / previous) * 100
  return {
    direction: pct >= 0 ? 'up' : 'down',
    label: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% vs last week`,
  }
}

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

  const all = orders ?? []
  const now = Date.now()
  const week = 7 * 24 * 60 * 60 * 1000
  const thisWeek = all.filter((o) => o.created_at && now - new Date(o.created_at).getTime() < week)
  const lastWeek = all.filter(
    (o) => o.created_at && now - new Date(o.created_at).getTime() >= week && now - new Date(o.created_at).getTime() < 2 * week
  )

  const revenueThisWeek = thisWeek.reduce((sum, o) => sum + (Number(o.amount) || 0), 0)
  const revenueLastWeek = lastWeek.reduce((sum, o) => sum + (Number(o.amount) || 0), 0)
  const totalRevenue = all.reduce((sum, o) => sum + (Number(o.amount) || 0), 0)

  return (
    <AppShell
      title="Dashboard"
      subtitle="Overview of customers, orders and revenue."
      userEmail={user?.email}
      nav={ADMIN_NAV}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
          marginBottom: 28,
          maxWidth: 560,
        }}
      >
        <StatCard
          label="Customers"
          value={customers?.length ?? 0}
          icon={<UsersIcon />}
          trend={trendFor(thisWeek.length, lastWeek.length)}
        />
        <StatCard
          label="Orders"
          value={all.length}
          icon={<OrdersIcon />}
          trend={trendFor(thisWeek.length, lastWeek.length)}
        />
        <StatCard
          label="Revenue"
          value={currency(totalRevenue)}
          icon={<PulseIcon />}
          trend={trendFor(revenueThisWeek, revenueLastWeek)}
        />
        <StatCard
          label="Growth"
          value={`${all.length ? Math.round((thisWeek.length / all.length) * 100) : 0}%`}
          icon={<CheckIcon />}
          trend={trendFor(thisWeek.length, lastWeek.length)}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: 16,
          marginBottom: 28,
          alignItems: 'stretch',
        }}
      >
        <Card style={{ padding: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 12px' }}>Order volume</h2>
          <BarChart data={monthlyOrders(all)} />
        </Card>
        <Card style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 12px' }}>Orders by status</h2>
          <DonutChart data={statusBreakdown(all)} />
        </Card>
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 12px' }}>Transaction history</h2>
      <Table columns={['Order', 'Status', 'Amount', 'Created']}>
        {all.map((o) => (
          <tr key={o.id}>
            <Td>{o.title || '—'}</Td>
            <Td>
              <StatusBadge status={o.status} />
            </Td>
            <Td>{currency(Number(o.amount) || 0)}</Td>
            <Td>{o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}</Td>
          </tr>
        ))}
        {!all.length && (
          <tr>
            <Td>No orders yet.</Td>
            <Td></Td>
            <Td></Td>
            <Td></Td>
          </tr>
        )}
      </Table>
    </AppShell>
  )
}
