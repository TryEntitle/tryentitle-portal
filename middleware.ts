// On Next.js 16, rename this file to proxy.ts and rename the export to `proxy`.
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { reportSupabaseConfigOutage, supabaseConfigOutageResponse } from './lib/supabase/outage'
import { readSupabaseServerEnv } from './lib/supabase/server-env'

const PUBLIC_PATHS = ['/login', '/signup', '/reset-password', '/update-password', '/auth/callback']

function isPublicPath(path: string) {
  return PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`))
}

// Same routes the previous matcher covered. Other paths pass through when
// Supabase env is present, so API auth and unknown URLs keep their own behavior.
function isAuthPath(path: string) {
  if (
    path === '/login' ||
    path === '/signup' ||
    path === '/reset-password' ||
    path === '/update-password' ||
    path === '/onboarding'
  ) {
    return true
  }
  if (path === '/auth/callback' || path.startsWith('/auth/callback/')) return true
  if (path === '/admin' || path.startsWith('/admin/')) return true
  if (path === '/dashboard' || path.startsWith('/dashboard/')) return true
  return false
}

export async function middleware(request: NextRequest) {
  const go = (to: string) => {
    const url = request.nextUrl.clone()
    url.pathname = to
    url.search = ''
    return NextResponse.redirect(url)
  }

  const env = readSupabaseServerEnv()
  if (!env.ok) {
    // createServerClient throws when URL or key is missing. Every route,
    // including login, gets the outage page instead of a 404 or a stack.
    await reportSupabaseConfigOutage(env.missing)
    return supabaseConfigOutageResponse()
  }

  if (!isAuthPath(request.nextUrl.pathname)) return NextResponse.next()

  let response = NextResponse.next({ request })

  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Unauthenticated: login (and other auth screens) first — never force a
  // business-info wizard before they can sign in.
  if (!user) {
    if (isPublicPath(path)) return response
    return go('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'
  const home = isAdmin ? '/admin' : '/dashboard'

  // Authenticated users leave the auth entry screens (except update-password,
  // which needs a session after the email recovery link).
  if (path === '/login' || path === '/signup' || path === '/reset-password') {
    return go(home)
  }

  // Legacy /onboarding route → home; business info is a post-login popup.
  if (path === '/onboarding') return go(home)

  if (path.startsWith('/admin') && !isAdmin) return go('/dashboard')

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)'],
}
