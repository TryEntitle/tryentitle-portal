import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Root route: login first when signed out; otherwise role home.
// Business info is a popup after login (see BusinessInfoModal), not a gate.
export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  redirect(profile?.role === 'admin' ? '/admin' : '/dashboard')
}
