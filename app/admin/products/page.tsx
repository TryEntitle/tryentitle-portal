import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import Table, { Td } from '@/components/Table'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import ProductFormModal from '@/components/ProductFormModal'
import { TextInput } from '@/components/Input'
import { PackageIcon } from '@/components/icons'
import { ADMIN_NAV } from '@/lib/nav'
import { currency } from '@/lib/analytics'

export default async function AdminProducts({ searchParams }: { searchParams: { q?: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const q = searchParams.q?.trim() ?? ''
  let query = supabase.from('products').select('*').order('created_at', { ascending: false })
  if (q) query = query.ilike('name', `%${q}%`)
  const { data: products } = await query
  const { count: totalCount } = await supabase.from('products').select('id', { count: 'exact', head: true })

  return (
    <AppShell title="Products" subtitle="Everything you sell." userEmail={user?.email} nav={ADMIN_NAV}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <form action="/admin/products" style={{ maxWidth: 280, width: '100%' }}>
            <TextInput name="q" defaultValue={q} placeholder="Search products" />
          </form>
          <ProductFormModal triggerLabel="Add product" />
        </div>

        {!totalCount ? (
          <EmptyState
            icon={<PackageIcon size={22} />}
            title="Add your first product"
            text="Products are the services customers can order. Add one with a name, price and short description."
          />
        ) : (
          <Table columns={['Product', 'SKU', 'Price', 'Status']}>
            {(products ?? []).map((p) => (
              <tr key={p.id}>
                <Td>
                  <Link href={`/admin/products/${p.id}`} style={{ fontWeight: 500, color: 'inherit', textDecoration: 'none' }}>
                    {p.name}
                  </Link>
                </Td>
                <Td style={{ color: '#8a8a87', fontFamily: 'ui-monospace, monospace', fontSize: 12.5 }}>{p.sku || '—'}</Td>
                <Td>{currency(Number(p.price) || 0)}</Td>
                <Td>
                  <StatusBadge status={p.status} />
                </Td>
              </tr>
            ))}
            {(products ?? []).length === 0 && (
              <tr>
                <Td>No products match.</Td>
                <Td></Td>
                <Td></Td>
                <Td></Td>
              </tr>
            )}
          </Table>
        )}
      </div>
    </AppShell>
  )
}
