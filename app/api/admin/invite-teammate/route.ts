import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

async function findAuthUserIdByEmail(
  admin: ReturnType<typeof createAdminClient>,
  email: string
): Promise<{ id: string } | { error: string } | null> {
  let page = 1
  const perPage = 200
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) return { error: error.message }
    const hit = data.users.find((u) => (u.email || '').toLowerCase() === email)
    if (hit) return { id: hit.id }
    if (data.users.length < perPage) return null
    page += 1
    if (page > 50) return { error: 'Too many users to search.' }
  }
}

// Grants admin access to a teammate by email. Only Admin/Owner exists as a
// real, RLS-enforced role today — Editor/Viewer aren't offered here
// because nothing in the schema actually restricts what they could do,
// and shipping those options without real enforcement would be a lie
// about what the invited person can access.
//
// Identity for elevation MUST come from auth.users (Auth Admin API), never
// from the client-writable profiles.email mirror.
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })

  const { data: caller } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (caller?.role !== 'admin') return NextResponse.json({ error: 'Admins only.' }, { status: 403 })

  const { email } = await request.json().catch(() => ({ email: '' }))
  const trimmed = typeof email === 'string' ? email.trim().toLowerCase() : ''
  if (!EMAIL_RE.test(trimmed)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })

  const admin = createAdminClient()

  const existingAuth = await findAuthUserIdByEmail(admin, trimmed)
  if (existingAuth && 'error' in existingAuth) {
    return NextResponse.json({ error: existingAuth.error }, { status: 500 })
  }

  let targetId = existingAuth?.id
  if (targetId) {
    const { data: existing } = await admin.from('profiles').select('id, role').eq('id', targetId).maybeSingle()
    if (existing?.role === 'admin') {
      return NextResponse.json({ error: 'That person is already on your team.' }, { status: 409 })
    }
  } else {
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(trimmed)
    if (inviteError || !invited?.user) {
      return NextResponse.json({ error: inviteError?.message || 'Could not send the invite.' }, { status: 500 })
    }
    targetId = invited.user.id
  }

  const { error: roleError } = await admin.from('profiles').update({ role: 'admin' }).eq('id', targetId)
  if (roleError) return NextResponse.json({ error: roleError.message }, { status: 500 })

  // Keep the email mirror aligned with Auth after elevation (service_role).
  await admin.from('profiles').update({ email: trimmed }).eq('id', targetId)

  return NextResponse.json({ ok: true })
}
