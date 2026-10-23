import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import Card from '@/components/Card'
import StatCard from '@/components/StatCard'
import StatusBadge from '@/components/StatusBadge'
import ProductFormModal from '@/components/ProductFormModal'
import { ChevronLeftIcon, DollarIcon, PackageIcon } from '@/components/icons'
import { ADMIN_NAV } from '@/lib/nav'
import { currency } from '@/lib/analytics'
import { colors } from '@/lib/theme'

export default async function AdminProductDetail({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: product } = await supabase.from('products').select('*').eq('id', params.id).maybeSingle()
  if (!product) notFound()

  return (
    <AppShell title={product.name} subtitle={`${currency(Number(product.price) || 0)} · ${product.sku || 'No SKU'}`} userEmail={user?.email} nav={ADMIN_NAV}>
      <Link
        href="/admin/products"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: colors.secondary[600], textDecoration: 'none', marginBottom: 16 }}
      >
        <ChevronLeftIcon size={14} /> Products
      </Link>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          <StatCard label="Price" value={currency(Number(product.price) || 0)} icon={<DollarIcon />} />
          <StatCard label="Created" value={product.created_at ? new Date(product.created_at).toLocaleDateString() : '—'} icon={<PackageIcon />} />
        </div>

        <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>About this product</h2>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <ProductFormModal product={product} triggerLabel="Edit" triggerVariant="outline" />
              <StatusBadge status={product.status} />
            </div>
          </div>
          <p style={{ fontSize: 14, color: colors.content.primary, lineHeight: 1.55, maxWidth: 640, margin: 0 }}>
            {product.description || <span style={{ color: colors.content.muted }}>No description yet.</span>}
          </p>
          <div style={{ fontSize: 12.5, color: colors.content.muted, fontFamily: 'ui-monospace, monospace' }}>{product.sku || '—'}</div>
        </Card>
      </div>
    </AppShell>
  )
}
