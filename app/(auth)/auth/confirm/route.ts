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
      redirectTo.searchParams.set('message', 'Failed to authenticate with Google. Please try again.')
      return NextResponse.redirect(redirectTo)
    }
    
    if (data.user) {
      console.log('=== OAuth Callback ===');
      console.log('User authenticated:', data.user.id);
      console.log('User email:', data.user.email);
      
      // Check if profile exists in database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('profile_completed, role')
        .eq('id', data.user.id)
        .maybeSingle()
      
      console.log('Profile query result:', profile);
      console.log('Profile error:', profileError);
      
      // If no profile exists, this is a brand new OAuth user - redirect to role selection
      if (!profile) {
        console.log('✅ New OAuth user (no profile), redirecting to role selection');
        redirectTo.pathname = '/signup/select-role'
        redirectTo.searchParams.delete('next')
        return NextResponse.redirect(redirectTo)
      }
      
      // If profile exists but has no role assigned, redirect to role selection
      // Note: We only check the database profile.role, not user metadata
      // This is because existing users should have their role in the database
      if (!profile.role) {
        console.log('Profile exists but no role in database, redirecting to role selection');
        redirectTo.pathname = '/signup/select-role'
        redirectTo.searchParams.delete('next')
        return NextResponse.redirect(redirectTo)
      }
      
      // If profile exists but not completed - redirect to complete profile
      if (!profile.profile_completed) {
        console.log('Profile incomplete, redirecting to complete profile');
        redirectTo.pathname = '/signup/complete-profile'
        redirectTo.searchParams.delete('next')
        return NextResponse.redirect(redirectTo)
      }
      
      // Existing user with completed profile - redirect to appropriate dashboard
      console.log('✅ Existing user with completed profile, role:', profile.role);
      const role = profile.role
      if (role === 'organizer') {
        redirectTo.pathname = '/organizer'
      } else if (role === 'mathlete') {
        redirectTo.pathname = '/mathlete'
      } else {
        // Fallback if role is somehow invalid
        console.log('⚠️ Invalid role, redirecting to home');
        redirectTo.pathname = '/'
      }
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
          .select('profile_completed, role')
          .eq('id', user.id)
          .single()
        
        if (!profile?.profile_completed) {
          // Email verified but profile not completed
          // Redirect to success page with instructions
          console.log('Email verified, profile incomplete - showing success page');
          redirectTo.pathname = '/signup/email-verified'
          redirectTo.searchParams.delete('next')
          return NextResponse.redirect(redirectTo)
        }
        
        // Profile already completed - redirect to appropriate dashboard
        console.log('Email verified, profile complete, redirecting to dashboard');
        const role = profile.role || user.user_metadata?.role
        if (role === 'organizer') {
          redirectTo.pathname = '/organizer'
        } else if (role === 'mathlete') {
          redirectTo.pathname = '/mathlete'
        } else {
          redirectTo.pathname = '/'
        }
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