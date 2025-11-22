import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')
  redirectTo.searchParams.delete('code')

  const supabase = createClient()

  // Handle OAuth callback (Google, etc.)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('OAuth exchange error:', error);
      redirectTo.pathname = '/error'
      return NextResponse.redirect(redirectTo)
    }
    
    if (data.user) {
      // Check if user is new (no role set yet)
      const hasRole = data.user.user_metadata?.role
      
      if (!hasRole) {
        // New user - redirect to role selection
        console.log('New user detected, redirecting to role selection');
        redirectTo.pathname = '/signup/select-role'
        redirectTo.searchParams.delete('next')
        return NextResponse.redirect(redirectTo)
      }
      
      // Check if profile is completed
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_completed')
        .eq('id', data.user.id)
        .single()
      
      if (!profile?.profile_completed) {
        // Profile not completed - redirect to complete profile
        console.log('Profile incomplete, redirecting to complete profile');
        redirectTo.pathname = '/signup/complete-profile'
        redirectTo.searchParams.delete('next')
        return NextResponse.redirect(redirectTo)
      }
      
      // Existing user with completed profile - proceed to home
      console.log('Existing user with role:', data.user.user_metadata.role);
      redirectTo.searchParams.delete('next')
      return NextResponse.redirect(redirectTo)
    }
  }

  // Handle Email OTP verification (email confirmation)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if profile is completed
        const { data: profile } = await supabase
          .from('profiles')
          .select('profile_completed')
          .eq('id', user.id)
          .single()
        
        if (!profile?.profile_completed) {
          // Profile not completed - redirect to complete profile
          console.log('Email verified, redirecting to complete profile');
          redirectTo.pathname = '/signup/complete-profile'
          redirectTo.searchParams.delete('next')
          return NextResponse.redirect(redirectTo)
        }
        
        // Profile already completed - redirect to home
        console.log('Email verified, profile complete, redirecting home');
        redirectTo.searchParams.delete('next')
        return NextResponse.redirect(redirectTo)
      }
    }
    
    console.log('OTP error:', error);
  }
  
  // return the user to an error page with some instructions
  redirectTo.pathname = '/error'
  return NextResponse.redirect(redirectTo)
}