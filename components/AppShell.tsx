'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'

const BRAND_DARK = '#292928'
const BRAND_ACCENT = '#e16e38'

export type NavItem = { label: string; href: string }

export default function AppShell({
  title,
  userEmail,
  nav,
  children,
}: {
  title: string
  userEmail?: string
  nav: NavItem[]
  children: React.ReactNode
}) {
  const pathname = usePathname()

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
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 14,
                  textDecoration: 'none',
                  color: active ? '#fff' : '#9a9a97',
                  background: active ? 'rgba(225,110,56,0.16)' : 'transparent',
                  borderLeft: active ? `2px solid ${BRAND_ACCENT}` : '2px solid transparent',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div style={{ marginTop: 'auto', display: 'grid', gap: 10, borderTop: '1px solid #3d3d3b', paddingTop: 16 }}>
          {userEmail && (
            <span style={{ fontSize: 12, color: '#9a9a97', wordBreak: 'break-all' }}>{userEmail}</span>
          )}
          <LogoutButton />
        </div>
      </aside>

      <main style={{ flex: 1, padding: 32, maxWidth: 1100 }}>
        <h1 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 600, color: BRAND_DARK }}>{title}</h1>
        {children}
      </main>
    </div>
  )
}
