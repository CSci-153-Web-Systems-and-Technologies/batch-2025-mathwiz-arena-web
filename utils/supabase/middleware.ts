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
  const protectedRoutes = ['/mathlete', '/organizer']
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
    const { data: profile } = await supabase
      .from('profiles')
      .select('profile_completed, role')
      .eq('id', user.id)
      .single()

    // Redirect to complete profile if not completed
    if (!profile?.profile_completed) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/signup/complete-profile'
      return NextResponse.redirect(redirectUrl)
    }

    // Role-based access control
    const userRole = profile.role
    
    // Check if user is accessing the correct role route
    if (pathname.startsWith('/mathlete') && userRole !== 'mathlete') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = userRole === 'organizer' ? '/organizer' : '/error'
      redirectUrl.searchParams.set('message', 'You do not have access to this page.')
      return NextResponse.redirect(redirectUrl)
    }

    if (pathname.startsWith('/organizer') && userRole !== 'organizer') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = userRole === 'mathlete' ? '/mathlete' : '/error'
      redirectUrl.searchParams.set('message', 'You do not have access to this page.')
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}