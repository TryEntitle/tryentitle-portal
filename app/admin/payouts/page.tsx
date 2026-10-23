import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import Card from '@/components/Card'
import Table, { Td } from '@/components/Table'
import StatusBadge from '@/components/StatusBadge'
import Button from '@/components/Button'
import EmptyState from '@/components/EmptyState'
import { CreditCardIcon } from '@/components/icons'
import { ADMIN_NAV } from '@/lib/nav'
import { currency } from '@/lib/analytics'
import { colors } from '@/lib/theme'

// Payouts has no real bank-transfer integration yet, so the money-moving
// actions are rendered disabled rather than faking success. "Available
// balance" is still real: completed-order revenue minus whatever's already
// in the payouts table (always $0 paid out today, but the formula holds
// once a real payout run starts writing rows there).
export default async function AdminPayouts() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: orders } = await supabase.from('orders').select('amount, status')
  const { data: payouts } = await supabase.from('payouts').select('*').order('created_at', { ascending: false })

  const completedRevenue = (orders ?? [])
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + (Number(o.amount) || 0), 0)
  const alreadyPaidOut = (payouts ?? []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  const available = Math.max(0, completedRevenue - alreadyPaidOut)

  return (
    <AppShell title="Payouts" subtitle="Money from your sales and where it goes." userEmail={user?.email} nav={ADMIN_NAV}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 18 }}>
          <Card style={{ background: colors.content.primary, color: colors.layout.surface, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 12.5, color: colors.default[400], letterSpacing: 0.4, textTransform: 'uppercase' }}>Available balance</span>
            <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.6 }}>{currency(available)}</span>
            <span style={{ fontSize: 13, color: colors.default[400] }}>Payouts aren&apos;t connected yet — nothing can be transferred out.</span>
            <div style={{ marginTop: 10 }}>
              <Button variant="secondary" disabled title="Connect a payout processor to enable this">
                Pay out now
              </Button>
            </div>
          </Card>
          <Card style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Payout account</h2>
            </div>
            <div style={{ fontSize: 13.5, color: colors.content.muted, lineHeight: 1.5 }}>
              No bank account is connected. Payouts need a connected processor before an account can be added.
            </div>
            <div>
              <Button variant="outline" disabled>
                Connect bank account
              </Button>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Payout history</h2>
          {(payouts ?? []).length === 0 ? (
            <EmptyState
              icon={<CreditCardIcon size={22} />}
              title="No payouts yet"
              text="Once a payout processor is connected, money paid out to your bank account will show up here."
            />
          ) : (
            <Table columns={['Date', 'Amount', 'Status']}>
              {(payouts ?? []).map((p) => (
                <tr key={p.id}>
                  <Td>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</Td>
                  <Td>{currency(Number(p.amount) || 0)}</Td>
                  <Td>
                    <StatusBadge status={p.status} />
                  </Td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </div>
    </AppShell>
  )
}
