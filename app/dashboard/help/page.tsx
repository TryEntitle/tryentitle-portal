import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import Card from '@/components/Card'
import { CUSTOMER_NAV } from '@/lib/nav'
import { colors } from '@/lib/theme'

export default async function DashboardHelp() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <AppShell title="Help" subtitle="Questions about your account." userEmail={user?.email} nav={CUSTOMER_NAV}>
      <Card style={{ maxWidth: 480, padding: 28 }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600 }}>Need a hand?</h2>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: colors.content.muted, lineHeight: 1.6 }}>
          Reach out and we'll get back to you.
        </p>
        <a
          href="mailto:hello@tryentitle.tech"
          style={{
            display: 'inline-block',
            padding: '12px 20px',
            borderRadius: 999,
            background: colors.content.primary,
            color: colors.layout.surface,
            fontSize: 14,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Contact support
        </a>
      </Card>
    </AppShell>
  )
}
