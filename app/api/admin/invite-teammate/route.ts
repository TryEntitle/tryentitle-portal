import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

// Grants admin access to a teammate by email. Only Admin/Owner exists as a
// real, RLS-enforced role today — Editor/Viewer aren't offered here
// because nothing in the schema actually restricts what they could do,
// and shipping those options without real enforcement would be a lie
// about what the invited person can access.
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

  const { data: existing } = await admin.from('profiles').select('id, role').eq('email', trimmed).maybeSingle()
  if (existing?.role === 'admin') {
    return NextResponse.json({ error: 'That person is already on your team.' }, { status: 409 })
  }

  let targetId = existing?.id
  if (!targetId) {
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(trimmed)
    if (inviteError || !invited?.user) {
      return NextResponse.json({ error: inviteError?.message || 'Could not send the invite.' }, { status: 500 })
    }
    targetId = invited.user.id
  }

  const { error: roleError } = await admin.from('profiles').update({ role: 'admin' }).eq('id', targetId)
  if (roleError) return NextResponse.json({ error: roleError.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
