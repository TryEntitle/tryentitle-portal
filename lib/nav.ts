import { DashboardIcon, UsersIcon, MegaphoneIcon, HelpIcon, OrdersIcon } from '@/components/icons'

export const ADMIN_NAV = [
  { label: 'Dashboard', href: '/admin', icon: DashboardIcon },
  { label: 'Customers', href: '/admin/customers', icon: UsersIcon },
  { label: 'Promote', href: '/admin/promote', icon: MegaphoneIcon },
  { label: 'Help', href: '/admin/help', icon: HelpIcon },
]

export const CUSTOMER_NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
  { label: 'Orders', href: '/dashboard/orders', icon: OrdersIcon },
  { label: 'Help', href: '/dashboard/help', icon: HelpIcon },
]
