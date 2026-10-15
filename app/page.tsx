import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Root route: send people to the right place based on login state and role.
export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  redirect(profile?.role === 'admin' ? '/admin' : '/dashboard')
}
