'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { colors } from '@/lib/theme'
import { useIsMobile } from '@/lib/useIsMobile'
import { authButtonStyle, authInputStyle } from '@/components/AuthShell'

const STEPS = [
  { key: 'business', title: 'Business info', blurb: 'Tell us who you are so we can personalize the portal.' },
  { key: 'product', title: 'First product', blurb: 'Optionally add a catalog item. You can always do this later.' },
  { key: 'payout', title: 'Payout account', blurb: 'Connect where you get paid — when payouts are available.' },
] as const

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [productName, setProductName] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const isMobile = useIsMobile()

  async function finish() {
    setSaving(true)
    setError('')
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      router.push('/login')
      return
    }
    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_completed_at: new Date().toISOString() })
      .eq('id', user.id)
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    router.push('/')
    router.refresh()
  }

  async function saveBusiness() {
    setSaving(true)
    setError('')
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      router.push('/login')
      return
    }
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim() || null,
        company: company.trim() || null,
      })
      .eq('id', user.id)
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setStep(1)
  }

  async function saveProduct() {
    setError('')
    const name = productName.trim()
    if (!name) {
      setStep(2)
      return
    }
    const priceNum = parseFloat(productPrice)
    if (!(priceNum > 0)) {
      setError('Enter a price above $0, or clear the name to skip.')
      return
    }
    setSaving(true)
    const supabase = createClient()
    const { data: profile } = await supabase.from('profiles').select('role').single()
    if (profile?.role !== 'admin') {
      setSaving(false)
      setError(
        'Product catalog writes need a merchant admin role. Skip for now — an admin can add products after signup.'
      )
      return
    }
    const { error } = await supabase.from('products').insert({
      name,
      price: priceNum,
      status: 'draft',
    })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setStep(2)
  }

  function skip() {
    setError('')
    if (step < STEPS.length - 1) setStep(step + 1)
    else finish()
  }

  const current = STEPS[step]

  return (
    <div style={{ minHeight: '100vh', background: colors.layout.background, padding: isMobile ? 16 : 24, boxSizing: 'border-box' }}>
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          background: colors.layout.surface,
          borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          padding: isMobile ? '28px 22px 32px' : '40px 48px 44px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 28 }}>
          <Image src="/logo.png" alt="TryEntitle" width={40} height={40} unoptimized />
          <span style={{ fontSize: 13, color: colors.content.muted }}>
            Step {step + 1} of {STEPS.length}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {STEPS.map((s, i) => (
            <div
              key={s.key}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 999,
                background: i <= step ? colors.secondary[500] : colors.default[200],
              }}
            />
          ))}
        </div>

        <h1 style={{ margin: '0 0 8px', fontSize: isMobile ? 22 : 26, fontWeight: 600 }}>{current.title}</h1>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: colors.content.muted, lineHeight: 1.5 }}>{current.blurb}</p>

        {step === 0 && (
          <div style={{ display: 'grid', gap: 14 }}>
            <input
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              style={authInputStyle}
            />
            <input
              placeholder="Company name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              autoComplete="organization"
              style={authInputStyle}
            />
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'grid', gap: 14 }}>
            <input
              placeholder="Product name (optional)"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              style={authInputStyle}
            />
            <input
              type="number"
              placeholder="Price USD (optional)"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              min={0}
              step="0.01"
              style={authInputStyle}
            />
            <p style={{ margin: 0, fontSize: 13, color: colors.content.muted, lineHeight: 1.45 }}>
              Catalog products can only be created by merchant admins. If you just signed up as a customer,
              skip this step.
            </p>
          </div>
        )}

        {step === 2 && (
          <div
            style={{
              padding: 20,
              borderRadius: 14,
              border: `1px dashed ${colors.default[200]}`,
              background: colors.default[50],
              display: 'grid',
              gap: 12,
            }}
          >
            <p style={{ margin: 0, fontSize: 14, color: colors.content.secondary, lineHeight: 1.5 }}>
              No payout processor is connected yet. Bank account linking will live here when a real
              payout integration is wired up — nothing fake is stored.
            </p>
            <button
              type="button"
              disabled
              title="Payouts are not available yet"
              style={{ ...authButtonStyle, opacity: 0.45, cursor: 'default', maxWidth: 220 }}
            >
              Connect payout account
            </button>
          </div>
        )}

        {error && <p style={{ color: colors.danger[600], fontSize: 14, margin: '16px 0 0' }}>{error}</p>}

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            marginTop: 28,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            type="button"
            onClick={skip}
            disabled={saving}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.content.muted,
              fontSize: 14,
              cursor: saving ? 'default' : 'pointer',
              padding: '8px 4px',
            }}
          >
            {step === STEPS.length - 1 ? 'Skip and finish' : 'Skip'}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              if (step === 0) return saveBusiness()
              if (step === 1) return saveProduct()
              return finish()
            }}
            style={{ ...authButtonStyle, opacity: saving ? 0.7 : 1, minWidth: 140 }}
          >
            {saving ? 'Saving...' : step === STEPS.length - 1 ? 'Finish' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
