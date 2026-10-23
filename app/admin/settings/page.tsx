import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import SettingsView from '@/components/SettingsView'
import { ADMIN_NAV } from '@/lib/nav'

export default async function AdminSettings() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
  const { data: teammates } = await supabase.from('profiles').select('id, email, full_name, company, created_at').eq('role', 'admin')
  const { data: prefs } = await supabase.from('notification_prefs').select('*').eq('user_id', user!.id).maybeSingle()

  return (
    <AppShell title="Settings" subtitle="Your profile, team, notifications and billing." userEmail={user?.email} nav={ADMIN_NAV}>
      <SettingsView
        profile={profile}
        teammates={teammates ?? []}
        prefs={{
          order_updates: prefs?.order_updates ?? true,
          new_messages: prefs?.new_messages ?? true,
          weekly_summary: prefs?.weekly_summary ?? false,
        }}
      />
    </AppShell>
  )
}
