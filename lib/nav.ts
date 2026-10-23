export type IconKey =
  | 'dashboard'
  | 'users'
  | 'megaphone'
  | 'help'
  | 'orders'
  | 'products'
  | 'messages'
  | 'payouts'
  | 'settings'

export type NavLink = { label: string; href: string; icon: IconKey }
export type NavGroup = { label: string; icon: IconKey; children: NavLink[] }
export type NavEntry = NavLink | NavGroup

export const ADMIN_NAV: NavEntry[] = [
  { label: 'Analytics', href: '/admin', icon: 'dashboard' },
  { label: 'Orders', href: '/admin/orders', icon: 'orders' },
  { label: 'Products', href: '/admin/products', icon: 'products' },
  { label: 'Messages', href: '/admin/messages', icon: 'messages' },
  { label: 'Customers', href: '/admin/customers', icon: 'users' },
  { label: 'Payouts', href: '/admin/payouts', icon: 'payouts' },
  { label: 'Settings', href: '/admin/settings', icon: 'settings' },
  { label: 'Promote', href: '/admin/promote', icon: 'megaphone' },
  { label: 'Help', href: '/admin/help', icon: 'help' },
]

export const CUSTOMER_NAV: NavEntry[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { label: 'Orders', href: '/dashboard/orders', icon: 'orders' },
  { label: 'Help', href: '/dashboard/help', icon: 'help' },
]
