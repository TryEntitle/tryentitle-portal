'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/Modal'
import Button from '@/components/Button'
import Pill from '@/components/Pill'
import { TextInput, TextArea, labelStyle } from '@/components/Input'

type Product = { id: number; name: string; sku: string | null; price: number; status: string; description: string | null }

export default function ProductFormModal({
  product,
  triggerLabel,
  triggerVariant = 'primary',
}: {
  product?: Product
  triggerLabel: string
  triggerVariant?: 'primary' | 'outline'
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(product?.name ?? '')
  const [sku, setSku] = useState(product?.sku ?? '')
  const [price, setPrice] = useState(product ? String(product.price) : '')
  const [status, setStatus] = useState(product?.status ?? 'draft')
  const [description, setDescription] = useState(product?.description ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function openModal() {
    setName(product?.name ?? '')
    setSku(product?.sku ?? '')
    setPrice(product ? String(product.price) : '')
    setStatus(product?.status ?? 'draft')
    setDescription(product?.description ?? '')
    setError('')
    setOpen(true)
  }

  async function save() {
    const trimmedName = name.trim()
    const priceNum = parseFloat(price)
    if (!trimmedName) return setError('Add a product name.')
    if (!(priceNum > 0)) return setError('Enter a price above $0.')

    setSaving(true)
    setError('')
    const supabase = createClient()
    const { data: dupes } = await supabase.from('products').select('id').ilike('name', trimmedName)
    if ((dupes ?? []).some((d) => d.id !== product?.id)) {
      setSaving(false)
      return setError('A product with this name already exists.')
    }

    const row = { name: trimmedName, sku: sku.trim() || null, price: priceNum, status, description: description.trim() || null }
    const { error: dbError } = product
      ? await supabase.from('products').update(row).eq('id', product.id)
      : await supabase.from('products').insert(row)
    setSaving(false)
    if (dbError) return setError(dbError.message)
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button variant={triggerVariant} onClick={openModal}>
        {triggerLabel}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} width={500}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{product ? 'Edit product' : 'Add product'}</h2>
        <label style={labelStyle}>
          Name
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Title search" />
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
          <label style={labelStyle}>
            SKU
            <TextInput value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Optional" />
          </label>
          <label style={labelStyle}>
            Price (USD)
            <TextInput type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
          </label>
        </div>
        <div style={labelStyle}>
          Status
          <div style={{ display: 'flex', gap: 8 }}>
            <Pill active={status === 'live'} onClick={() => setStatus('live')}>
              Live
            </Pill>
            <Pill active={status === 'draft'} onClick={() => setStatus('draft')}>
              Draft
            </Pill>
          </div>
        </div>
        <label style={labelStyle}>
          Description
          <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What the customer gets" rows={4} />
        </label>
        {error && (
          <div style={{ fontSize: 13, color: '#a3321f', background: '#fbe7e4', borderRadius: 8, padding: '10px 12px' }}>{error}</div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? 'Saving...' : product ? 'Save changes' : 'Add product'}
          </Button>
        </div>
      </Modal>
    </>
  )
}
