import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import Card from '@/components/Card'
import Table, { Td } from '@/components/Table'
import StatusBadge from '@/components/StatusBadge'
import Button from '@/components/Button'
import { CreditCardIcon } from '@/components/icons'
import { ADMIN_NAV } from '@/lib/nav'
import { currency } from '@/lib/analytics'
import { colors } from '@/lib/theme'

// Payouts has no real bank-transfer integration yet, so the money-moving
// actions are rendered disabled rather than faking success. "Available
// balance" is still real: completed-order revenue minus whatever's already
// in the payouts table (always $0 paid out today, but the formula holds
// once a real payout run starts writing rows there). Layout matches the
// design deck: balance, payout account, weekly Friday note, history table.
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
  const hasHistory = (payouts ?? []).length > 0

  return (
    <AppShell title="Payouts" subtitle="Money from your sales and where it goes." userEmail={user?.email} nav={ADMIN_NAV}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 18 }}>
          <Card
            style={{
              background: colors.content.primary,
              color: colors.layout.surface,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 12.5, color: colors.default[400], letterSpacing: 0.4, textTransform: 'uppercase' }}>
              Available balance
            </span>
            <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.6 }}>{currency(available)}</span>
            <span style={{ fontSize: 13, color: colors.default[400], lineHeight: 1.45 }}>
              Payouts run weekly, every Friday.
            </span>
            <span style={{ fontSize: 12.5, color: colors.default[500], lineHeight: 1.45 }}>
              Completed order revenue minus paid-out rows. Transfers stay disabled until a payout
              processor is connected.
            </span>
            <div style={{ marginTop: 10 }}>
              <Button variant="secondary" disabled title="Coming soon — connect a payout processor">
                Pay out now
              </Button>
            </div>
          </Card>

          <Card style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Payout account</h2>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  letterSpacing: 0.3,
                  textTransform: 'uppercase',
                  color: colors.content.muted,
                  background: colors.default[100],
                  padding: '4px 8px',
                  borderRadius: 999,
                }}
              >
                Not connected
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                padding: 14,
                borderRadius: 12,
                border: `1px dashed ${colors.default[200]}`,
                background: colors.default[50],
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  borderRadius: 10,
                  background: colors.layout.surface,
                  border: `1px solid ${colors.layout.divider}`,
                  color: colors.content.muted,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <CreditCardIcon size={18} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: colors.content.primary }}>No bank on file</span>
                <span style={{ fontSize: 13, color: colors.content.muted, lineHeight: 1.5 }}>
                  Connect a payout processor before adding an account. Nothing is invented here —
                  Connect bank stays disabled.
                </span>
              </div>
            </div>
            <div>
              <Button variant="outline" disabled title="Coming soon — connect a payout processor">
                Connect bank account
              </Button>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Payout history</h2>
            <span style={{ fontSize: 12.5, color: colors.content.muted }}>Payouts run weekly, every Friday.</span>
          </div>
          <Table columns={['Date', 'Amount', 'Destination', 'Status']}>
            {hasHistory ? (
              (payouts ?? []).map((p) => (
                <tr key={p.id}>
                  <Td>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</Td>
                  <Td>{currency(Number(p.amount) || 0)}</Td>
                  <Td style={{ color: colors.content.muted }}>{p.account_label ?? 'Bank account'}</Td>
                  <Td>
                    <StatusBadge status={p.status} />
                  </Td>
                </tr>
              ))
            ) : (
              <tr>
                <Td colSpan={4} style={{ color: colors.content.muted }}>
                  <div style={{ padding: '10px 0', lineHeight: 1.5 }}>
                    No payouts yet. When a processor is connected, weekly Friday transfers will show
                    up here with amount and status.
                  </div>
                </Td>
              </tr>
            )}
          </Table>
        </div>
      </div>
    </AppShell>
  )
}
