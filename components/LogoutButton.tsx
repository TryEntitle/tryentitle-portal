'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { colors } from '@/lib/theme'

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
        border: `1px solid ${colors.default[600]}`,
        background: 'transparent',
        color: colors.default[200],
        fontSize: 13,
        cursor: 'pointer',
      }}
    >
      Log out
    </button>
  )
}
