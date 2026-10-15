'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import { MailIcon, BellIcon, DashboardIcon, UsersIcon, MegaphoneIcon, HelpIcon, OrdersIcon } from '@/components/icons'
import type { IconKey } from '@/lib/nav'

const BRAND_DARK = '#292928'
const BRAND_ACCENT = '#e16e38'

const ICONS: Record<IconKey, React.ComponentType<{ size?: number }>> = {
  dashboard: DashboardIcon,
  users: UsersIcon,
  megaphone: MegaphoneIcon,
  help: HelpIcon,
  orders: OrdersIcon,
}

export type NavItem = { label: string; href: string; icon?: IconKey }

export default function AppShell({
  title,
  subtitle,
  userEmail,
  nav,
  children,
}: {
  title: string
  subtitle?: string
  userEmail?: string
  nav: NavItem[]
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [openPanel, setOpenPanel] = useState<'mail' | 'bell' | null>(null)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f6f5f3' }}>
      <aside
        style={{
          width: 240,
          flexShrink: 0,
          background: BRAND_DARK,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
        }}
      >
        <Image src="/demo/logo-wordmark.png" alt="TryEntitle" width={180} height={63} unoptimized />
        <nav style={{ display: 'grid', gap: 4 }}>
          {nav.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon ? ICONS[item.icon] : null
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 14,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: active ? '#fff' : '#9a9a97',
                  background: active ? 'rgba(225,110,56,0.16)' : 'transparent',
                  borderLeft: active ? `2px solid ${BRAND_ACCENT}` : '2px solid transparent',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {Icon && <Icon size={16} />}
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div
          style={{
            marginTop: 'auto',
            background: '#343432',
            borderRadius: 14,
            padding: 16,
            display: 'grid',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 13, color: '#e8e8e6', fontWeight: 600 }}>Need help?</div>
          <div style={{ fontSize: 12, color: '#9a9a97' }}>You can contact us.</div>
          <a
            href="mailto:hello@tryentitle.tech"
            style={{
              textAlign: 'center',
              padding: '9px 0',
              borderRadius: 999,
              background: BRAND_ACCENT,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Get support
          </a>
        </div>
        <div style={{ display: 'grid', gap: 10, borderTop: '1px solid #3d3d3b', paddingTop: 16 }}>
          {userEmail && (
            <span style={{ fontSize: 12, color: '#9a9a97', wordBreak: 'break-all' }}>{userEmail}</span>
          )}
          <LogoutButton />
        </div>
      </aside>

      <main style={{ flex: 1, padding: 32, maxWidth: 1200 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 28,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: BRAND_DARK }}>{title}</h1>
            {subtitle && <p style={{ margin: '6px 0 0', color: '#8a8a87', fontSize: 14 }}>{subtitle}</p>}
          </div>
          <div style={{ display: 'flex', gap: 10, position: 'relative' }}>
            <button
              title="Messages"
              onClick={() => setOpenPanel(openPanel === 'mail' ? null : 'mail')}
              style={iconButtonStyle}
            >
              <MailIcon size={18} />
            </button>
            <button
              title="Notifications"
              onClick={() => setOpenPanel(openPanel === 'bell' ? null : 'bell')}
              style={{ ...iconButtonStyle, position: 'relative' }}
            >
              <BellIcon size={18} />
              <span
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: BRAND_ACCENT,
                  border: '1.5px solid #fff',
                }}
              />
            </button>

            {openPanel && (
              <div
                style={{
                  position: 'absolute',
                  top: 48,
                  right: openPanel === 'mail' ? 50 : 0,
                  width: 240,
                  background: '#fff',
                  border: '1px solid #ececea',
                  borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  padding: 16,
                  zIndex: 10,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  {openPanel === 'mail' ? 'Messages' : 'Notifications'}
                </div>
                <div style={{ fontSize: 13, color: '#8a8a87' }}>
                  {openPanel === 'mail' ? 'No new messages.' : 'No new notifications.'}
                </div>
              </div>
            )}
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}

const iconButtonStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 10,
  border: '1px solid #ececea',
  background: '#fff',
  color: '#6a6a67',
  display: 'grid',
  placeItems: 'center',
  cursor: 'pointer',
}
