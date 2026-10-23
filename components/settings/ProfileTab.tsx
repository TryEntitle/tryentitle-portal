'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { TextInput, labelStyle } from '@/components/Input'

type Profile = { id: string; full_name: string | null; email: string | null; company: string | null; phone: string | null }

export default function ProfileTab({ profile }: { profile: Profile }) {
  const router = useRouter()
  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [company, setCompany] = useState(profile.company ?? '')
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    setSaved(false)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() || null, company: company.trim() || null, phone: phone.trim() || null })
      .eq('id', profile.id)
    setSaving(false)
    if (!error) {
      setSaved(true)
      router.refresh()
    }
  }

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <label style={labelStyle}>
          Full name
          <TextInput value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </label>
        <label style={labelStyle}>
          Email
          <TextInput value={profile.email ?? ''} disabled style={{ opacity: 0.6 }} />
        </label>
        <label style={labelStyle}>
          Company
          <TextInput value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Optional" />
        </label>
        <label style={labelStyle}>
          Phone
          <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
        </label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save changes'}
        </Button>
        {saved && <span style={{ fontSize: 13, color: '#2f6b45' }}>Saved.</span>}
      </div>
    </Card>
  )
}
