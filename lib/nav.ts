export type IconKey = 'dashboard' | 'users' | 'megaphone' | 'help' | 'orders'

export const ADMIN_NAV: { label: string; href: string; icon: IconKey }[] = [
  { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
  { label: 'Customers', href: '/admin/customers', icon: 'users' },
  { label: 'Promote', href: '/admin/promote', icon: 'megaphone' },
  { label: 'Help', href: '/admin/help', icon: 'help' },
]

export const CUSTOMER_NAV: { label: string; href: string; icon: IconKey }[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { label: 'Orders', href: '/dashboard/orders', icon: 'orders' },
  { label: 'Help', href: '/dashboard/help', icon: 'help' },
]
