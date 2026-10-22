'use client'
import { useMemo, useState } from 'react'
import Card from '@/components/Card'
import StatCard from '@/components/StatCard'
import BarChart from '@/components/BarChart'
import LineChart from '@/components/LineChart'
import DonutChart from '@/components/DonutChart'
import Pill from '@/components/Pill'
import { TextInput } from '@/components/Input'
import { OrdersIcon, CheckIcon, DollarIcon, PulseIcon } from '@/components/icons'
import { colors } from '@/lib/theme'
import {
  type Range,
  buildSeries,
  currency,
  previousWindow,
  resolveWindow,
  sumInWindow,
  trendFor,
} from '@/lib/analytics'

type OrderRow = { id: number; amount: number | string | null; status: string | null; created_at: string | null; customer_id: string }
type CustomerRow = { id: string; company: string | null }

const RANGES: { key: Range; label: string }[] = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '12m', label: '12 months' },
  { key: 'custom', label: 'Custom' },
]

function isoDaysAgo(n: number) {
  return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10)
}

export default function AnalyticsView({ orders, customers }: { orders: OrderRow[]; customers: CustomerRow[] }) {
  const [range, setRange] = useState<Range>('30d')
  const [from, setFrom] = useState(isoDaysAgo(29))
  const [to, setTo] = useState(isoDaysAgo(0))

  const { start, end } = useMemo(() => resolveWindow(range, from, to), [range, from, to])
  const prev = useMemo(() => previousWindow(start, end), [start, end])
  const series = useMemo(() => buildSeries(range, start, end, orders), [range, start, end, orders])

  const curOrders = sumInWindow(orders, start, end)
  const prevOrders = sumInWindow(orders, prev.start, prev.end)
  const curApproved = sumInWindow(orders, start, end, (r) => r.status === 'completed')
  const prevApproved = sumInWindow(orders, prev.start, prev.end, (r) => r.status === 'completed')
  const curSales = sumInWindow(orders, start, end, (r) => r.status !== 'cancelled')
  const prevSales = sumInWindow(orders, prev.start, prev.end, (r) => r.status !== 'cancelled')
  const curRevenue = sumInWindow(orders, start, end, (r) => r.status === 'completed')
  const prevRevenue = sumInWindow(orders, prev.start, prev.end, (r) => r.status === 'completed')

  const statusBreakdown = useMemo(() => {
    const endExclusive = new Date(end.getTime() + 86400000)
    const counts: Record<string, number> = {}
    for (const o of orders) {
      if (!o.created_at) continue
      const d = new Date(o.created_at)
      if (d < start || d >= endExclusive) continue
      const key = (o.status || 'new').toLowerCase()
      counts[key] = (counts[key] || 0) + 1
    }
    return Object.entries(counts).map(([label, value]) => ({ label, value }))
  }, [orders, start, end])

  const topCustomers = useMemo(() => {
    const endExclusive = new Date(end.getTime() + 86400000)
    const byCustomer = new Map<string, number>()
    for (const o of orders) {
      if (!o.created_at || o.status === 'cancelled') continue
      const d = new Date(o.created_at)
      if (d < start || d >= endExclusive) continue
      byCustomer.set(o.customer_id, (byCustomer.get(o.customer_id) || 0) + (Number(o.amount) || 0))
    }
    const companyById = new Map(customers.map((c) => [c.id, c.company]))
    return [...byCustomer.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, amount]) => ({ id, label: companyById.get(id) || id.slice(0, 8), amount }))
  }, [orders, customers, start, end])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {RANGES.map((r) => (
            <Pill key={r.key} active={range === r.key} onClick={() => setRange(r.key)}>
              {r.label}
            </Pill>
          ))}
        </div>
        {range === 'custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: colors.content.secondary }}>
            <TextInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ width: 150 }} />
            to
            <TextInput type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ width: 150 }} />
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        <StatCard label="Orders" value={curOrders.count} icon={<OrdersIcon />} trend={trendFor(curOrders.count, prevOrders.count)} />
        <StatCard label="Approved" value={curApproved.count} icon={<CheckIcon />} trend={trendFor(curApproved.count, prevApproved.count)} />
        <StatCard label="Sales" value={currency(curSales.amount)} icon={<DollarIcon />} trend={trendFor(curSales.amount, prevSales.amount)} />
        <StatCard label="Revenue" value={currency(curRevenue.amount)} icon={<PulseIcon />} trend={trendFor(curRevenue.amount, prevRevenue.amount)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', gap: 18, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Sales</h2>
              <span style={{ fontSize: 13, color: colors.content.muted }}>{currency(curSales.amount)}</span>
            </div>
            <BarChart data={series.map((s) => ({ label: s.label, value: s.sales }))} format={(v) => currency(v)} />
          </Card>
          <Card style={{ padding: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 12px' }}>Order volume</h2>
            <LineChart data={series.map((s) => ({ label: s.label, value: s.orders }))} format={(v) => `${v} orders`} />
          </Card>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card style={{ padding: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 12px' }}>Orders by status</h2>
            {statusBreakdown.length ? (
              <DonutChart data={statusBreakdown} />
            ) : (
              <div style={{ fontSize: 13, color: colors.content.muted }}>No orders in this period.</div>
            )}
          </Card>
          <Card style={{ padding: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 12px' }}>Top customers</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topCustomers.length ? (
                topCustomers.map((c) => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: colors.content.primary }}>{c.label}</span>
                    <span style={{ fontWeight: 600 }}>{currency(c.amount)}</span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 13, color: colors.content.muted }}>No sales in this period.</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
