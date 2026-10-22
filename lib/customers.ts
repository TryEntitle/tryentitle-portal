// Shared helpers for rendering a customer profile row — no stored "status"
// field exists, so it's derived from real signals (order count + how
// recently they joined) rather than fabricated.

export function labelFor(company: string | null, email: string | null) {
  return company || email || 'Unknown customer'
}

export function initialsFor(company: string | null, email: string | null) {
  const source = company || email || '?'
  const parts = source.split(/[\s.@]+/).filter(Boolean)
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '?'
}

const NEW_WINDOW_MS = 14 * 24 * 60 * 60 * 1000

export function customerStatus(orderCount: number, createdAt: string | null): 'new' | 'active' | 'inactive' {
  if (orderCount === 0) return 'inactive'
  if (createdAt && Date.now() - new Date(createdAt).getTime() < NEW_WINDOW_MS) return 'new'
  return 'active'
}
