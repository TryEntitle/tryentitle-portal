import Card from '@/components/Card'
import Button from '@/components/Button'
import Table, { Td } from '@/components/Table'
import { CreditCardIcon, DownloadIcon, PlusIcon } from '@/components/icons'
import { colors } from '@/lib/theme'

// No subscription/billing provider is connected yet. Layout mirrors the
// design deck (Current plan → Payment methods → Invoices with Download)
// while staying honest: no fabricated Visa ****4242, Pro plan, or live
// invoice rows. Actions stay disabled with clear connect-provider copy.
export default function BillingTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Card
        style={{
          background: colors.content.primary,
          color: colors.layout.surface,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12.5, color: colors.default[400], letterSpacing: 0.4, textTransform: 'uppercase' }}>
            Current plan
          </span>
          <span style={{ fontSize: 20, fontWeight: 700 }}>No plan selected</span>
          <span style={{ fontSize: 13, color: colors.default[400], maxWidth: 420, lineHeight: 1.45 }}>
            Billing isn&apos;t connected to a payment provider yet. Plan changes will unlock once a
            processor is wired up.
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Button
            variant="outline"
            disabled
            title="Coming soon — connect a billing provider"
            style={{ background: 'transparent', color: colors.layout.surface, border: `1px solid ${colors.default[600]}` }}
          >
            Cancel plan
          </Button>
          <Button variant="secondary" disabled title="Coming soon — connect a billing provider">
            Change plan
          </Button>
        </div>
      </Card>

      <Card style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            padding: '18px 20px 0',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Payment methods</h2>
            <span style={{ fontSize: 13, color: colors.content.muted }}>
              Cards and bank accounts for TryEntitle plan charges.
            </span>
          </div>
          <Button variant="outline" disabled title="Coming soon — connect a billing provider">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <PlusIcon size={14} />
              Add payment method
            </span>
          </Button>
        </div>

        <div
          style={{
            margin: '0 20px 20px',
            border: `1px dashed ${colors.default[200]}`,
            borderRadius: 12,
            padding: '28px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 8,
            background: colors.default[50],
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: colors.layout.surface,
              color: colors.content.muted,
              display: 'grid',
              placeItems: 'center',
              border: `1px solid ${colors.layout.divider}`,
              marginBottom: 4,
            }}
          >
            <CreditCardIcon size={20} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: colors.content.primary }}>No payment methods on file</div>
          <div style={{ fontSize: 13, color: colors.content.muted, maxWidth: 360, lineHeight: 1.5 }}>
            Empty on purpose — there is no live card data until a billing provider is connected.
            Layout preview only; Add stays disabled.
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Invoices</h2>
          <span style={{ fontSize: 12.5, color: colors.content.muted }}>
            Download unlocks when billing is connected
          </span>
        </div>
        <Table columns={['Date', 'Invoice', 'Amount', 'Status', 'Download']}>
          <tr>
            <Td style={{ color: colors.content.muted }}>—</Td>
            <Td style={{ color: colors.content.muted }}>
              No invoices yet — billing isn&apos;t connected. Layout preview only.
            </Td>
            <Td style={{ color: colors.content.muted }}>—</Td>
            <Td style={{ color: colors.content.muted }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: colors.default[100],
                  color: colors.content.muted,
                }}
              >
                Preview
              </span>
            </Td>
            <Td>
              <Button
                variant="outline"
                disabled
                title="Coming soon — no invoices to download"
                style={{ height: 34, padding: '0 12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <DownloadIcon size={14} />
                Download
              </Button>
            </Td>
          </tr>
        </Table>
      </div>
    </div>
  )
}
