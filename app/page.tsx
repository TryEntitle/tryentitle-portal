import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Root route: send people to the right place based on login state, role,
// and whether onboarding still needs to run.
export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, company, onboarding_completed_at')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed_at && !profile?.company) {
    redirect('/onboarding')
  }

  redirect(profile?.role === 'admin' ? '/admin' : '/dashboard')
}
