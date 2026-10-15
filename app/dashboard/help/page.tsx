import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import { CUSTOMER_NAV } from '@/lib/nav'

export default async function DashboardHelp() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <AppShell title="Help" subtitle="Questions about your account." userEmail={user?.email} nav={CUSTOMER_NAV}>
      <div
        style={{
          border: '1px solid #ececea',
          background: '#fff',
          borderRadius: 16,
          padding: 28,
          maxWidth: 480,
          boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 8px 24px rgba(0,0,0,0.04)',
        }}
      >
        <h2 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600 }}>Need a hand?</h2>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: '#8a8a87', lineHeight: 1.6 }}>
          Reach out and we'll get back to you.
        </p>
        <a
          href="mailto:hello@tryentitle.tech"
          style={{
            display: 'inline-block',
            padding: '12px 20px',
            borderRadius: 999,
            background: '#292928',
            color: '#fff',
            fontSize: 14,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Contact support
        </a>
      </div>
    </AppShell>
  )
}
