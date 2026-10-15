'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  async function logout() {
    await createClient().auth.signOut()
    router.push('/login')
    router.refresh()
  }
  return (
    <button
      onClick={logout}
      style={{
        padding: '8px 14px',
        borderRadius: 999,
        border: '1px solid #4a4a47',
        background: 'transparent',
        color: '#d4d4d1',
        fontSize: 13,
        cursor: 'pointer',
      }}
    >
      Log out
    </button>
  )
}
