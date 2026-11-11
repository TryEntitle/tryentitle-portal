'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/Modal'
import Button from '@/components/Button'
import { TextInput } from '@/components/Input'
import { colors } from '@/lib/theme'

function dismissKey(userId: string) {
  return `te_biz_info_done:${userId}`
}

function wasDismissed(userId: string) {
  try {
    return localStorage.getItem(dismissKey(userId)) === '1'
  } catch {
    return false
  }
}

function markDismissed(userId: string) {
  try {
    localStorage.setItem(dismissKey(userId), '1')
  } catch {
    // private mode — ignore
  }
}

/**
 * Optional post-login prompt. Never blocks the app. Never shows raw DB errors.
 * Skip/Save always closes; we remember dismiss in localStorage even if the
 * profile write fails (e.g. missing migration or RLS).
 */
export default function BusinessInfoModal() {
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user || cancelled) return
        if (wasDismissed(user.id)) return

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('full_name, company, onboarding_completed_at')
          .eq('id', user.id)
          .maybeSingle()

        // Any read failure → stay quiet, no popup (don't expose backend errors).
        if (error || cancelled) return

        setUserId(user.id)
        setFullName(profile?.full_name ?? '')
        setCompany(profile?.company ?? '')

        // Already finished or has a company — don't ask again.
        if (profile?.onboarding_completed_at || profile?.company) {
          markDismissed(user.id)
          return
        }

        setOpen(true)
      } catch {
        // Missing env / network — never interrupt the dashboard.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function finish(fields?: { full_name?: string | null; company?: string | null }) {
    if (!userId) {
      setOpen(false)
      return
    }
    setSaving(true)
    // Close immediately from the user's POV; persist best-effort in the background.
    markDismissed(userId)
    setOpen(false)
    try {
      const supabase = createClient()
      await supabase
        .from('profiles')
        .update({
          ...(fields ?? {}),
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', userId)
      // Ignore write errors — dismiss already stored locally.
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <Modal
      open={open}
      onClose={() => {
        void finish()
      }}
      width={420}
    >
      <div style={{ fontSize: 17, fontWeight: 600, color: colors.content.primary }}>Business info</div>
      <div style={{ fontSize: 14, color: colors.content.secondary, lineHeight: 1.45 }}>
        Optional — tell us a bit about your business, or skip and continue.
      </div>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: colors.content.secondary }}>
        Full name
        <TextInput value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: colors.content.secondary }}>
        Company
        <TextInput value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Optional" />
      </label>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
        <Button type="button" variant="outline" onClick={() => void finish()} disabled={saving}>
          Skip for now
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            void finish({
              full_name: fullName.trim() || null,
              company: company.trim() || null,
            })
          }
          disabled={saving}
        >
          Save
        </Button>
      </div>
    </Modal>
  )
}
