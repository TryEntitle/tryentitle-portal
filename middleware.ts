// On Next.js 16, rename this file to proxy.ts and rename the export to `proxy`.
// The app runs under basePath '/demo' (see next.config.example.mjs), so paths seen
// here have NO /demo prefix, and redirects must go through nextUrl.clone() to keep it.
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
    const url = request.nextUrl.clone() // keeps basePath (/demo)
    url.pathname = to
    url.search = ''
    return NextResponse.redirect(url)
  }

  if (!user) return path === '/login' ? response : go('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  const isAdmin = profile?.role === 'admin'

  if (path === '/login') return go(isAdmin ? '/admin' : '/dashboard')
  if (path.startsWith('/admin') && !isAdmin) return go('/dashboard')

  return response
}

export const config = {
  matcher: ['/login', '/admin/:path*', '/dashboard/:path*'],
}
