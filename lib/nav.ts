export type IconKey = 'dashboard' | 'users' | 'megaphone' | 'help' | 'orders'

export type NavLink = { label: string; href: string; icon: IconKey }
export type NavGroup = { label: string; icon: IconKey; children: NavLink[] }
export type NavEntry = NavLink | NavGroup

export const ADMIN_NAV: NavEntry[] = [
  { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
  {
    label: 'Manage',
    icon: 'users',
    children: [
      { label: 'Customers', href: '/admin/customers', icon: 'users' },
      { label: 'Promote', href: '/admin/promote', icon: 'megaphone' },
    ],
  },
  { label: 'Help', href: '/admin/help', icon: 'help' },
]

export const CUSTOMER_NAV: NavEntry[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { label: 'Orders', href: '/dashboard/orders', icon: 'orders' },
  { label: 'Help', href: '/dashboard/help', icon: 'help' },
]
