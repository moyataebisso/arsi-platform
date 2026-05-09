import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // If Supabase env vars are missing, redirect to setup page
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // Allow static assets, setup page, and API routes
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/images') ||
      pathname === '/favicon.ico' ||
      pathname === '/setup'
    ) {
      return NextResponse.next()
    }

    // Redirect everything else to setup
    const url = request.nextUrl.clone()
    url.pathname = '/setup'
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as never)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Allow cron API routes (verified by CRON_SECRET)
  if (pathname.startsWith('/api/cron')) {
    return supabaseResponse
  }

  // Allow auth callback
  if (pathname.startsWith('/auth/callback')) {
    return supabaseResponse
  }

  // Allow invite-link password setup. The Supabase invite token arrives in the
  // URL hash (client-only), so the server has no session yet — must skip the
  // admin gate or the user would be redirected to /login before they can set
  // a password.
  if (pathname === '/admin/set-password') {
    return supabaseResponse
  }

  // Allow setup page (already configured, just let it through)
  if (pathname === '/setup') {
    return supabaseResponse
  }

  // Allow all public routes
  if (
    pathname === '/' ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/services') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/shop') ||
    pathname.startsWith('/book') ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/events') ||
    pathname.startsWith('/reviews') ||
    pathname.startsWith('/gallery') ||
    pathname.startsWith('/faq') ||
    pathname.startsWith('/cart') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/api/contact') ||
    pathname.startsWith('/api/booking') ||
    pathname.startsWith('/api/orders') ||
    pathname.startsWith('/api/reviews') ||
    pathname.startsWith('/api/email') ||
    pathname.startsWith('/api/events') ||
    pathname.startsWith('/api/stripe') ||
    pathname.startsWith('/theme-preview')
  ) {
    return supabaseResponse
  }

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Admin routes require admin/manager role (checked from auth metadata)
    if (pathname.startsWith('/admin')) {
      const role = user.user_metadata?.role || user.app_metadata?.role
      if (!role || !['admin', 'manager'].includes(role)) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    }
  }

  // Redirect authenticated users away from login/register
  if (user && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Redirect unauthenticated users trying to access protected routes
  if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/profile'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/).*)'],
}
