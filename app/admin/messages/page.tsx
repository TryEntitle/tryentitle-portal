import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import MessagesView, { type ThreadSummary } from '@/components/MessagesView'
import { ADMIN_NAV } from '@/lib/nav'
import { initialsFor, labelFor } from '@/lib/customers'

export default async function AdminMessages({ searchParams }: { searchParams: { customer?: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: customers } = await supabase.from('profiles').select('id, company, email')
  const { data: allMessages } = await supabase
    .from('messages')
    .select('id, customer_id, sender_id, body, created_at')
    .order('created_at', { ascending: true })

  const byCompany = new Map((customers ?? []).map((c) => [c.id, c]))
  const byCustomer = new Map<string, typeof allMessages>()
  for (const m of allMessages ?? []) {
    const list = byCustomer.get(m.customer_id) ?? []
    list.push(m)
    byCustomer.set(m.customer_id, list as NonNullable<typeof allMessages>)
  }

  const threads: ThreadSummary[] = [...byCustomer.entries()]
    .map(([customerId, msgs]) => {
      const last = msgs![msgs!.length - 1]
      const c = byCompany.get(customerId)
      return {
        customerId,
        label: labelFor(c?.company ?? null, c?.email ?? null),
        initials: initialsFor(c?.company ?? null, c?.email ?? null),
        preview: last.body,
        time: new Date(last.created_at).toLocaleDateString(),
      }
    })
    .sort((a, b) => (a.time < b.time ? 1 : -1))

  const selected = searchParams.customer && byCustomer.has(searchParams.customer) ? searchParams.customer : threads[0]?.customerId ?? null
  const initialMessages = (selected ? byCustomer.get(selected) : []) ?? []

  return (
    <AppShell title="Messages" subtitle="Conversations with your customers." userEmail={user?.email} nav={ADMIN_NAV}>
      <MessagesView threads={threads} selectedCustomerId={selected} initialMessages={initialMessages} currentUserId={user?.id ?? ''} />
    </AppShell>
  )
}
