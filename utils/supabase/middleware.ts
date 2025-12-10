import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Define protected routes
  const protectedRoutes = ['/mathlete', '/organizer', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // If accessing a protected route
  if (isProtectedRoute) {
    // Redirect to login if not authenticated
    if (!user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check profile completion and role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('profile_completed, role')
      .eq('id', user.id)
      .maybeSingle()

    console.log(`[Middleware] Path: ${pathname}, User: ${user.id}, Profile:`, profile, 'Error:', profileError)

    // If no profile exists, redirect to role selection
    if (!profile) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/signup/select-role'
      return NextResponse.redirect(redirectUrl)
    }

    // If profile exists but no role selected, redirect to role selection
    if (!profile.role) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/signup/select-role'
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect to complete profile if not completed (after role is selected)
    if (!profile?.profile_completed) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/signup/complete-profile'
      return NextResponse.redirect(redirectUrl)
    }

    // Role-based access control
    const userRole = profile.role

    // Check if user is accessing the correct role route
    if (pathname.startsWith('/mathlete') && userRole !== 'mathlete') {
      console.log(`[Middleware] Access denied: User role '${userRole}' trying to access /mathlete`)
      const redirectUrl = request.nextUrl.clone()
      if (userRole === 'organizer') {
        redirectUrl.pathname = '/organizer'
      } else if (userRole === 'admin') {
        redirectUrl.pathname = '/admin'
      } else {
        redirectUrl.pathname = '/error'
      }
      redirectUrl.searchParams.set('message', 'You do not have access to this page.')
      return NextResponse.redirect(redirectUrl)
    }

    if (pathname.startsWith('/organizer') && userRole !== 'organizer') {
      console.log(`[Middleware] Access denied: User role '${userRole}' trying to access /organizer`)
      const redirectUrl = request.nextUrl.clone()
      if (userRole === 'mathlete') {
        redirectUrl.pathname = '/mathlete'
      } else if (userRole === 'admin') {
        redirectUrl.pathname = '/admin'
      } else {
        redirectUrl.pathname = '/error'
      }
      redirectUrl.searchParams.set('message', 'You do not have access to this page.')
      return NextResponse.redirect(redirectUrl)
    }

    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      console.log(`[Middleware] Access denied: User role '${userRole}' trying to access /admin`)
      const redirectUrl = request.nextUrl.clone()
      if (userRole === 'mathlete') {
        redirectUrl.pathname = '/mathlete'
      } else if (userRole === 'organizer') {
        redirectUrl.pathname = '/organizer'
      } else {
        redirectUrl.pathname = '/error'
      }
      redirectUrl.searchParams.set('message', 'You do not have access to this page.')
      return NextResponse.redirect(redirectUrl)
    }

    console.log(`[Middleware] Access granted: User role '${userRole}' accessing ${pathname}`)
  }

  return response
}