import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import { ADMIN_NAV } from '@/lib/nav'

export default async function AdminPromote() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <AppShell
      title="Promote"
      subtitle="Bring new customers into your portal."
      userEmail={user?.email}
      nav={ADMIN_NAV}
    >
      <div
        style={{
          border: '1px solid #ececea',
          background: '#fff',
          borderRadius: 16,
          padding: 28,
          maxWidth: 520,
          boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 8px 24px rgba(0,0,0,0.04)',
        }}
      >
        <h2 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600 }}>Invite a customer</h2>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: '#8a8a87', lineHeight: 1.6 }}>
          Public sign-up is turned off, so new customers are added from Supabase:
          <strong> Authentication → Users → Invite user</strong>. Once invited, they'll land on their
          own dashboard — they never see other customers' data.
        </p>
        <a
          href="mailto:?subject=Join%20TryEntitle&body=You've%20been%20invited%20to%20the%20TryEntitle%20portal."
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
          Share an invite
        </a>
      </div>
    </AppShell>
  )
}
