import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import Card from '@/components/Card'
import { ADMIN_NAV } from '@/lib/nav'
import { colors } from '@/lib/theme'

const FAQS = [
  {
    q: 'How do I add a new customer?',
    a: 'Supabase → Authentication → Users → Invite user. They land on their own dashboard automatically.',
  },
  {
    q: 'How do I make someone an admin?',
    a: "Run: update public.profiles set role = 'admin' where id = (select id from auth.users where email = '...') in the SQL Editor.",
  },
  {
    q: 'Can customers see each other’s data?',
    a: 'No — row-level security on the orders and profiles tables restricts every customer to their own rows.',
  },
]

export default async function AdminHelp() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <AppShell title="Help" subtitle="Answers and support." userEmail={user?.email} nav={ADMIN_NAV}>
      <div style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
        {FAQS.map((f) => (
          <Card key={f.q} style={{ padding: '18px 20px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{f.q}</div>
            <div style={{ fontSize: 14, color: colors.content.muted, lineHeight: 1.6 }}>{f.a}</div>
          </Card>
        ))}
        <div style={{ fontSize: 14, color: colors.content.muted, marginTop: 8 }}>
          Still stuck?{' '}
          <a href="mailto:hello@tryentitle.tech" style={{ color: colors.secondary[500] }}>
            hello@tryentitle.tech
          </a>
        </div>
      </div>
    </AppShell>
  )
}
