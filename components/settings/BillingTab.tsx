import Card from '@/components/Card'
import Button from '@/components/Button'
import EmptyState from '@/components/EmptyState'
import { CreditCardIcon } from '@/components/icons'
import { colors } from '@/lib/theme'

// No subscription/billing provider is connected for TryEntitle's own plan
// yet, so this renders the real (empty) state instead of a fabricated
// "Pro · $49/month" plan or fake payment methods.
export default function BillingTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Card style={{ background: colors.content.primary, color: colors.layout.surface, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12.5, color: colors.default[400], letterSpacing: 0.4, textTransform: 'uppercase' }}>Current plan</span>
          <span style={{ fontSize: 20, fontWeight: 700 }}>No billing connected</span>
          <span style={{ fontSize: 13, color: colors.default[400] }}>Plans and billing aren&apos;t wired up to a payment provider yet.</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="outline" disabled style={{ background: 'transparent', color: colors.layout.surface, border: `1px solid ${colors.default[600]}` }}>
            Cancel plan
          </Button>
          <Button variant="secondary" disabled>
            Change plan
          </Button>
        </div>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Invoices</h2>
        <EmptyState
          icon={<CreditCardIcon size={22} />}
          title="No invoices yet"
          text="Once billing is connected, invoices for your TryEntitle plan will show up here."
        />
      </div>
    </div>
  )
}
