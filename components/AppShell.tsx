'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import IconButton from '@/components/IconButton'
import {
  MailIcon,
  BellIcon,
  DashboardIcon,
  UsersIcon,
  MegaphoneIcon,
  HelpIcon,
  OrdersIcon,
  ChevronDownIcon,
  MenuIcon,
  XIcon,
  PackageIcon,
  MessageIcon,
  CreditCardIcon,
  SettingsIcon,
} from '@/components/icons'
import type { IconKey, NavEntry } from '@/lib/nav'
import { breakpoints, colors } from '@/lib/theme'

const ICONS: Record<IconKey, React.ComponentType<{ size?: number }>> = {
  dashboard: DashboardIcon,
  users: UsersIcon,
  megaphone: MegaphoneIcon,
  help: HelpIcon,
  orders: OrdersIcon,
  products: PackageIcon,
  messages: MessageIcon,
  payouts: CreditCardIcon,
  settings: SettingsIcon,
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoints.mobile)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

function NavLinkRow({ label, href, icon, active }: { label: string; href: string; icon?: IconKey; active: boolean }) {
  const Icon = icon ? ICONS[icon] : null
  return (
    <Link
      href={href}
      style={{
        padding: '10px 14px',
        borderRadius: 8,
        fontSize: 14,
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        color: active ? '#fff' : colors.default[400],
        background: active ? colors.secondary[800] : 'transparent',
        borderLeft: active ? `2px solid ${colors.secondary[500]}` : '2px solid transparent',
        fontWeight: active ? 600 : 400,
      }}
    >
      {Icon && <Icon size={16} />}
      {label}
    </Link>
  )
}

function NavGroupRow({ entry, pathname }: { entry: Extract<NavEntry, { children: unknown[] }>; pathname: string }) {
  // Start expanded if the current page is inside this group.
  const hasActiveChild = entry.children.some((c) => c.href === pathname)
  const [open, setOpen] = useState(hasActiveChild)
  const Icon = ICONS[entry.icon]

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: 8,
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: colors.default[400],
          background: 'transparent',
          border: 'none',
          borderLeft: '2px solid transparent',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <Icon size={16} />
        <span style={{ flex: 1 }}>{entry.label}</span>
        <span style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 120ms' }}>
          <ChevronDownIcon size={13} />
        </span>
      </button>
      {open && (
        <div style={{ display: 'grid', gap: 2, paddingLeft: 22, marginTop: 2 }}>
          {entry.children.map((child) => (
            <NavLinkRow key={child.href} {...child} active={pathname === child.href} />
          ))}
        </div>
      )}
    </div>
  )
}

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
  nav: NavEntry[]
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [openPanel, setOpenPanel] = useState<'mail' | 'bell' | null>(null)
  const isMobile = useIsMobile()
  const [navOpen, setNavOpen] = useState(false)

  // Closing the drawer on navigation needs the pathname itself, not a
  // click handler per link — Link's own navigation already happened by
  // the time a click handler would fire the state update.
  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: colors.layout.background }}>
      {isMobile && navOpen && (
        <div
          onClick={() => setNavOpen(false)}
          style={{ position: 'fixed', inset: 0, background: colors.layout.overlay, zIndex: 19 }}
        />
      )}
      <aside
        style={{
          width: 240,
          flexShrink: 0,
          background: colors.content.primary,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
          ...(isMobile
            ? {
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100vh',
                overflowY: 'auto',
                zIndex: 20,
                transform: navOpen ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.2s ease',
                boxSizing: 'border-box',
              }
            : { position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', boxSizing: 'border-box' }),
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Image src="/logo-wordmark.png" alt="TryEntitle" width={180} height={63} unoptimized />
          {isMobile && (
            <button
              aria-label="Close menu"
              onClick={() => setNavOpen(false)}
              style={{
                border: 'none',
                background: 'transparent',
                color: colors.default[300],
                cursor: 'pointer',
                padding: 4,
              }}
            >
              <XIcon size={18} />
            </button>
          )}
        </div>
        <nav style={{ display: 'grid', gap: 4 }}>
          {nav.map((entry) =>
            'children' in entry ? (
              <NavGroupRow key={entry.label} entry={entry} pathname={pathname} />
            ) : (
              <NavLinkRow key={entry.href} {...entry} active={pathname === entry.href} />
            )
          )}
        </nav>
        <div
          style={{
            marginTop: 'auto',
            background: colors.default[700],
            borderRadius: 14,
            padding: 16,
            display: 'grid',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 13, color: '#e8e8e6', fontWeight: 600 }}>Need help?</div>
          <div style={{ fontSize: 12, color: colors.default[400] }}>You can contact us.</div>
          <a
            href="mailto:hello@tryentitle.tech"
            style={{
              textAlign: 'center',
              padding: '9px 0',
              borderRadius: 999,
              background: colors.secondary[500],
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Get support
          </a>
        </div>
        <div style={{ display: 'grid', gap: 10, borderTop: `1px solid ${colors.default[700]}`, paddingTop: 16 }}>
          {userEmail && (
            <span style={{ fontSize: 12, color: colors.default[400], wordBreak: 'break-all' }}>{userEmail}</span>
          )}
          <LogoutButton />
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: isMobile ? '20px 16px' : 32, maxWidth: 1200, boxSizing: 'border-box' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', minWidth: 0 }}>
            {isMobile && (
              <IconButton aria-label="Menu" onClick={() => setNavOpen(true)} style={{ marginTop: 2 }}>
                <MenuIcon size={16} />
              </IconButton>
            )}
            <div style={{ minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: isMobile ? 24 : 28, fontWeight: 700, color: colors.content.primary }}>
                {title}
              </h1>
              {subtitle && <p style={{ margin: '6px 0 0', color: colors.content.muted, fontSize: 14 }}>{subtitle}</p>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, position: 'relative' }}>
            <IconButton
              title="Messages"
              active={openPanel === 'mail'}
              onClick={() => setOpenPanel(openPanel === 'mail' ? null : 'mail')}
            >
              <MailIcon size={18} />
            </IconButton>
            <IconButton
              title="Notifications"
              active={openPanel === 'bell'}
              onClick={() => setOpenPanel(openPanel === 'bell' ? null : 'bell')}
              style={{ position: 'relative' }}
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
                  background: colors.secondary[500],
                  border: '1.5px solid #fff',
                }}
              />
            </IconButton>

            {openPanel && (
              <div
                style={{
                  position: 'absolute',
                  top: 48,
                  right: openPanel === 'mail' ? 50 : 0,
                  width: 240,
                  background: colors.layout.surface,
                  border: `1px solid ${colors.layout.divider}`,
                  borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  padding: 16,
                  zIndex: 10,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  {openPanel === 'mail' ? 'Messages' : 'Notifications'}
                </div>
                <div style={{ fontSize: 13, color: colors.content.muted }}>
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
