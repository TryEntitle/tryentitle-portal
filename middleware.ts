// On Next.js 16, rename this file to proxy.ts and rename the export to `proxy`.
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/signup', '/reset-password', '/update-password', '/auth/callback']

function isPublicPath(path: string) {
  return PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`))
}

function needsOnboarding(profile: { onboarding_completed_at: string | null; company: string | null } | null) {
  if (!profile) return true
  if (profile.onboarding_completed_at) return false
  // Pre-migration / legacy accounts that already filled company count as done.
  if (profile.company) return false
  return true
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname
  const go = (to: string) => {
    const url = request.nextUrl.clone()
    url.pathname = to
    url.search = ''
    return NextResponse.redirect(url)
  }

  if (!user) {
    if (isPublicPath(path)) return response
    return go('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, company, onboarding_completed_at')
    .eq('id', user.id)
    .single()
  const isAdmin = profile?.role === 'admin'
  const home = isAdmin ? '/admin' : '/dashboard'
  const onboarding = needsOnboarding(profile)

  // Authenticated users leave the auth entry screens (except update-password,
  // which needs a session after the email recovery link).
  if (path === '/login' || path === '/signup' || path === '/reset-password') {
    return go(onboarding ? '/onboarding' : home)
  }

  if (onboarding && path !== '/onboarding' && path !== '/update-password' && !path.startsWith('/auth/')) {
    return go('/onboarding')
  }

  if (!onboarding && path === '/onboarding') return go(home)

  if (path.startsWith('/admin') && !isAdmin) return go('/dashboard')

  return response
}

export const config = {
  matcher: [
    '/login',
    '/signup',
    '/reset-password',
    '/update-password',
    '/onboarding',
    '/auth/callback',
    '/admin/:path*',
    '/dashboard/:path*',
  ],
}
