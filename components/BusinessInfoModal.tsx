'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/Modal'
import Button from '@/components/Button'
import { TextInput } from '@/components/Input'
import { colors } from '@/lib/theme'

/** After login, ask for business info once — never blocks reaching the app. */
export default function BusinessInfoModal() {
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user || cancelled) {
          if (!cancelled) setChecked(true)
          return
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, company, onboarding_completed_at')
          .eq('id', user.id)
          .single()
        if (cancelled) return
        setUserId(user.id)
        setFullName(profile?.full_name ?? '')
        setCompany(profile?.company ?? '')
        const needsAsk = !profile?.onboarding_completed_at && !profile?.company
        setOpen(needsAsk)
      } catch {
        // Missing env or network — skip the prompt rather than break the shell.
      } finally {
        if (!cancelled) setChecked(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function markDone(fields?: { full_name?: string | null; company?: string | null }) {
    if (!userId) return
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({
        ...(fields ?? {}),
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq('id', userId)
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setOpen(false)
  }

  async function onSave() {
    await markDone({
      full_name: fullName.trim() || null,
      company: company.trim() || null,
    })
  }

  async function onSkip() {
    await markDone()
  }

  if (!checked || !open) return null

  return (
    <Modal open={open} onClose={onSkip} width={420}>
      <div style={{ fontSize: 17, fontWeight: 600, color: colors.content.primary }}>Business info</div>
      <div style={{ fontSize: 14, color: colors.content.secondary, lineHeight: 1.45 }}>
        Tell us a bit about your business. You can skip and fill this in later under Settings.
      </div>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: colors.content.secondary }}>
        Full name
        <TextInput value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: colors.content.secondary }}>
        Company
        <TextInput value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Optional" />
      </label>
      {error && <p style={{ margin: 0, fontSize: 13, color: colors.danger[600] }}>{error}</p>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
        <Button type="button" variant="outline" onClick={onSkip} disabled={saving}>
          Skip for now
        </Button>
        <Button type="button" variant="secondary" onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </Modal>
  )
}
