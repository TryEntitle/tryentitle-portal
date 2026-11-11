'use client'
import { useMemo, useState } from 'react'
import Card from '@/components/Card'
import StatCard from '@/components/StatCard'
import BarChart from '@/components/BarChart'
import LineChart from '@/components/LineChart'
import DonutChart from '@/components/DonutChart'
import RingStat from '@/components/RingStat'
import Pill from '@/components/Pill'
import { TextInput } from '@/components/Input'
import { OrdersIcon, CheckIcon, DollarIcon, CreditCardIcon } from '@/components/icons'
import { colors } from '@/lib/theme'
import {
  type Range,
  RANGE_LABELS,
  buildSeries,
  currency,
  pctOf,
  previousWindow,
  resolveWindow,
  subscriptionSegments,
  sumInWindow,
  sumPayoutsInWindow,
  trendFor,
  userSegments,
} from '@/lib/analytics'

type OrderRow = {
  id: number
  amount: number | string | null
  status: string | null
  created_at: string | null
  customer_id: string
}
type CustomerRow = { id: string; company: string | null; role?: string | null }
type PayoutRow = { amount: number | string | null; status: string | null; created_at: string | null }

const RANGES: { key: Range; label: string }[] = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '12m', label: '12 months' },
  { key: 'custom', label: 'Custom' },
]

const USER_COLORS = [colors.secondary[500], colors.secondary[300], colors.secondary[200]]
const SUB_COLORS = [colors.primary[400], colors.primary[200]]

function isoDaysAgo(n: number) {
  return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10)
}

function formatInt(n: number) {
  return new Intl.NumberFormat('en-US').format(n)
}

export default function AnalyticsView({
  orders,
  customers,
  payouts = [],
}: {
  orders: OrderRow[]
  customers: CustomerRow[]
  payouts?: PayoutRow[]
}) {
  const [range, setRange] = useState<Range>('30d')
  const [from, setFrom] = useState(isoDaysAgo(29))
  const [to, setTo] = useState(isoDaysAgo(0))

  const { start, end } = useMemo(() => resolveWindow(range, from, to), [range, from, to])
  const prev = useMemo(() => previousWindow(start, end), [start, end])
  const series = useMemo(() => buildSeries(range, start, end, orders), [range, start, end, orders])
  const rangeLabel = range === 'custom' ? `${from} – ${to}` : RANGE_LABELS[range]

  const curOrders = sumInWindow(orders, start, end)
  const prevOrders = sumInWindow(orders, prev.start, prev.end)
  const curApproved = sumInWindow(orders, start, end, (r) => r.status === 'completed')
  const prevApproved = sumInWindow(orders, prev.start, prev.end, (r) => r.status === 'completed')
  const curSales = sumInWindow(orders, start, end, (r) => r.status !== 'cancelled')
  const prevSales = sumInWindow(orders, prev.start, prev.end, (r) => r.status !== 'cancelled')
  const curRevenue = sumInWindow(orders, start, end, (r) => r.status === 'completed')
  const prevRevenue = sumInWindow(orders, prev.start, prev.end, (r) => r.status === 'completed')

  const users = useMemo(() => userSegments(customers), [customers])
  const newUsersThisPeriod = useMemo(() => {
    const endExclusive = new Date(end.getTime() + 86400000)
    const firstOrder = new Map<string, Date>()
    for (const o of orders) {
      if (!o.created_at) continue
      const d = new Date(o.created_at)
      const existing = firstOrder.get(o.customer_id)
      if (!existing || d < existing) firstOrder.set(o.customer_id, d)
    }
    let n = 0
    for (const d of firstOrder.values()) {
      if (d >= start && d < endExclusive) n += 1
    }
    return n
  }, [orders, start, end])

  const subs = useMemo(
    () => subscriptionSegments(customers, orders, start, end),
    [customers, orders, start, end],
  )

  const paidInvoices = curRevenue
  const funds = sumPayoutsInWindow(payouts, start, end, (r) => r.status === 'paid')
  const paidPct = pctOf(curApproved.count, curOrders.count)
  const fundsPct = pctOf(funds.amount, paidInvoices.amount || 1)
  const expense = funds.amount
  const net = curRevenue.amount - expense
  const maxPnL = Math.max(curRevenue.amount, expense, 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {RANGES.map((r) => (
            <Pill key={r.key} active={range === r.key} onClick={() => setRange(r.key)}>
              {r.label}
            </Pill>
          ))}
        </div>
        <span style={{ fontSize: 13, color: colors.content.muted }}>{rangeLabel}</span>
        {range === 'custom' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: colors.content.secondary,
              width: '100%',
            }}
          >
            <TextInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ width: 150 }} />
            to
            <TextInput type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ width: 150 }} />
          </div>
        )}
      </div>

      {/* Deck layout: left column (KPIs + Sales + Activity), right column (Users/Subs + finance). */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
          gap: 18,
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
            <StatCard
              label="Orders"
              value={curOrders.count}
              icon={<OrdersIcon />}
              trend={trendFor(curOrders.count, prevOrders.count)}
            />
            <StatCard
              label="Approved"
              value={curApproved.count}
              icon={<CheckIcon />}
              trend={trendFor(curApproved.count, prevApproved.count)}
            />
            <StatCard
              label="Sales"
              value={currency(curSales.amount)}
              icon={<DollarIcon />}
              trend={trendFor(curSales.amount, prevSales.amount)}
            />
            <StatCard
              label="Revenue"
              value={currency(curRevenue.amount)}
              icon={<CreditCardIcon />}
              trend={trendFor(curRevenue.amount, prevRevenue.amount)}
            />
          </div>

          <Card style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Sales</h2>
              <span style={{ fontSize: 13, color: colors.content.muted }}>{currency(curSales.amount)}</span>
            </div>
            <BarChart data={series.map((s) => ({ label: s.label, value: s.sales }))} format={(v) => currency(v)} />
          </Card>

          <Card style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Overall user activity</h2>
              <span style={{ fontSize: 13, color: colors.content.muted }}>{rangeLabel}</span>
            </div>
            <LineChart data={series.map((s) => ({ label: s.label, value: s.orders }))} format={(v) => `${v} orders`} />
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
            <Card style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 13.5, color: colors.content.secondary }}>Users</div>
                <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>{formatInt(users.total)}</div>
                <div style={{ fontSize: 12.5, color: colors.success[600], fontWeight: 500 }}>
                  {newUsersThisPeriod > 0
                    ? `+${formatInt(newUsersThisPeriod)} this period`
                    : 'No new users this period'}
                </div>
              </div>
              {users.segments.length ? (
                <DonutChart
                  data={users.segments.map((s) => ({ label: s.label, value: s.value }))}
                  colors={USER_COLORS}
                  legendAsPercent
                  centerValue=""
                  centerLabel=""
                  size={96}
                />
              ) : (
                <div style={{ fontSize: 13, color: colors.content.muted }}>No customers yet.</div>
              )}
            </Card>

            <Card style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 13.5, color: colors.content.secondary }}>Subscriptions</div>
                <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>{formatInt(subs.total)}</div>
                <div style={{ fontSize: 12.5, color: colors.content.secondary }}>
                  {subs.ofUsers > 0 ? `${pctOf(subs.total, subs.ofUsers)}% of users` : 'No customers yet'}
                </div>
              </div>
              {subs.segments.length ? (
                <DonutChart
                  data={subs.segments.map((s) => ({ label: s.label, value: s.value }))}
                  colors={SUB_COLORS}
                  legendAsPercent
                  centerValue=""
                  centerLabel=""
                  size={96}
                />
              ) : (
                <div style={{ fontSize: 13, color: colors.content.muted }}>No activity in this period.</div>
              )}
            </Card>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
            <Card
              style={{
                padding: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 13.5, color: colors.content.secondary }}>Paid invoices</div>
                <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>
                  {currency(paidInvoices.amount)}
                </div>
                <div style={{ fontSize: 12.5, color: colors.content.secondary }}>Current financial state</div>
              </div>
              <RingStat pct={paidPct} color={colors.secondary[500]} />
            </Card>

            <Card
              style={{
                padding: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 13.5, color: colors.content.secondary }}>Funds received</div>
                <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>{currency(funds.amount)}</div>
                <div style={{ fontSize: 12.5, color: colors.content.secondary }}>Current financial state</div>
              </div>
              <RingStat pct={Math.min(100, fundsPct)} color={colors.primary[400]} />
            </Card>
          </div>

          <Card style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Profit &amp; loss</h2>
              <span style={{ fontSize: 13, color: colors.content.muted }}>{rangeLabel}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: colors.content.secondary }}>Revenue</span>
                <span style={{ fontWeight: 600 }}>{currency(curRevenue.amount)}</span>
              </div>
              <div style={{ height: 26, borderRadius: 6, background: colors.default[50], overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(curRevenue.amount / maxPnL) * 100}%`,
                    background: colors.primary[400],
                    borderRadius: 6,
                    minWidth: curRevenue.amount > 0 ? 8 : 0,
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: colors.content.secondary }}>Expense</span>
                <span style={{ fontWeight: 600 }}>{currency(expense)}</span>
              </div>
              <div style={{ height: 26, borderRadius: 6, background: colors.default[50], overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(expense / maxPnL) * 100}%`,
                    background: colors.secondary[500],
                    borderRadius: 6,
                    minWidth: expense > 0 ? 8 : 0,
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 14,
                borderTop: `1px solid ${colors.layout.divider}`,
                fontSize: 13.5,
              }}
            >
              <span style={{ color: colors.content.secondary }}>Net profit</span>
              <span style={{ fontWeight: 700, color: net >= 0 ? colors.success[600] : colors.danger[600] }}>
                {currency(net)}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
