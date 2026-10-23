// Pure date-bucketing + trend math for the Analytics screen. No Supabase
// calls here — callers fetch rows, these functions turn them into series.

export type Range = '7d' | '30d' | '12m' | 'custom'

export type OrderRow = { amount: number | string | null; status: string | null; created_at: string | null }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const DAY_MS = 24 * 60 * 60 * 1000

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function fmtDay(d: Date) {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

// The [start, end] window (inclusive, start-of-day to end-of-day) a range
// resolves to "today". For 'custom', falls back to the last 30 days if the
// given strings don't parse into a valid, non-inverted range.
export function resolveWindow(range: Range, from?: string, to?: string): { start: Date; end: Date } {
  const today = startOfDay(new Date())
  if (range === '12m') {
    return { start: new Date(today.getFullYear(), today.getMonth() - 11, 1), end: today }
  }
  if (range === '7d') return { start: new Date(today.getTime() - 6 * DAY_MS), end: today }
  if (range === '30d') return { start: new Date(today.getTime() - 29 * DAY_MS), end: today }
  // custom
  const start = from ? startOfDay(new Date(`${from}T00:00`)) : null
  const end = to ? startOfDay(new Date(`${to}T00:00`)) : null
  if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return { start: new Date(today.getTime() - 29 * DAY_MS), end: today }
  }
  return { start, end }
}

export type Bucket = { label: string; start: Date; end: Date; sales: number; orders: number }

// Builds empty buckets spanning the window, then aggregates `rows` into
// them. 12m -> 12 calendar-month buckets. Otherwise daily buckets for
// windows up to 31 days, else up to 12 roughly-equal week-ish buckets (so a
// year-long custom range still renders a readable chart).
export function buildSeries(range: Range, start: Date, end: Date, rows: OrderRow[]): Bucket[] {
  const buckets: Bucket[] = []
  if (range === '12m') {
    for (let i = 0; i < 12; i++) {
      const bStart = new Date(start.getFullYear(), start.getMonth() + i, 1)
      const bEnd = new Date(start.getFullYear(), start.getMonth() + i + 1, 1)
      buckets.push({ label: MONTHS[bStart.getMonth()], start: bStart, end: bEnd, sales: 0, orders: 0 })
    }
  } else {
    const days = Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1
    if (days <= 31) {
      for (let i = 0; i < days; i++) {
        const bStart = new Date(start.getTime() + i * DAY_MS)
        buckets.push({ label: fmtDay(bStart), start: bStart, end: new Date(bStart.getTime() + DAY_MS), sales: 0, orders: 0 })
      }
    } else {
      const n = Math.min(12, Math.ceil(days / 7))
      const size = days / n
      for (let i = 0; i < n; i++) {
        const bStart = new Date(start.getTime() + Math.floor(i * size) * DAY_MS)
        const bEnd = new Date(start.getTime() + Math.floor((i + 1) * size) * DAY_MS)
        buckets.push({ label: fmtDay(bStart), start: bStart, end: bEnd, sales: 0, orders: 0 })
      }
    }
  }
  const endExclusive = new Date(end.getTime() + DAY_MS)
  for (const row of rows) {
    if (!row.created_at) continue
    const d = new Date(row.created_at)
    if (d < start || d >= endExclusive) continue
    const bucket = buckets.find((b) => d >= b.start && d < b.end)
    if (!bucket) continue
    bucket.orders += 1
    if (row.status !== 'cancelled') bucket.sales += Number(row.amount) || 0
  }
  return buckets
}

// The immediately-preceding window of the same length, for "+12% vs
// previous period" style deltas.
export function previousWindow(start: Date, end: Date): { start: Date; end: Date } {
  const span = end.getTime() - start.getTime()
  return { start: new Date(start.getTime() - span - DAY_MS), end: new Date(start.getTime() - DAY_MS) }
}

export function sumInWindow(rows: OrderRow[], start: Date, end: Date, predicate?: (r: OrderRow) => boolean) {
  const endExclusive = new Date(end.getTime() + DAY_MS)
  const inWindow = rows.filter((r) => {
    if (!r.created_at) return false
    const d = new Date(r.created_at)
    return d >= start && d < endExclusive && (!predicate || predicate(r))
  })
  return {
    count: inWindow.length,
    amount: inWindow.reduce((sum, r) => sum + (Number(r.amount) || 0), 0),
  }
}

export function trendFor(current: number, previous: number): { direction: 'up' | 'down'; label: string } {
  if (previous === 0) {
    return current > 0 ? { direction: 'up', label: 'New vs previous period' } : { direction: 'up', label: 'No change' }
  }
  const pct = ((current - previous) / previous) * 100
  return {
    direction: pct >= 0 ? 'up' : 'down',
    label: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% vs previous period`,
  }
}

export const currency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
