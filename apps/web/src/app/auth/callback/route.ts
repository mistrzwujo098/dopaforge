// path: apps/web/src/app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@dopaforge/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const error = requestUrl.searchParams.get('error');
    const errorDescription = requestUrl.searchParams.get('error_description');
    const next = requestUrl.searchParams.get('next') ?? '/dashboard';

    // Handle OAuth errors
    if (error) {
      console.error('Auth callback error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/auth?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
      );
    }

    if (code) {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient<Database>({ 
        cookies: () => cookieStore 
      });
      
      // Exchange code for session
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (sessionError) {
        console.error('Session exchange error:', sessionError);
        return NextResponse.redirect(
          new URL(`/auth?error=${encodeURIComponent(sessionError.message)}`, requestUrl.origin)
        );
      }

      // Get the user to verify session was created
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Failed to get user after session exchange:', userError);
        return NextResponse.redirect(
          new URL('/auth?error=Failed to establish session', requestUrl.origin)
        );
      }

      console.log('User authenticated successfully:', user.id);
      
      // Create response with redirect
      const redirectUrl = new URL(next, requestUrl.origin);
      return NextResponse.redirect(redirectUrl);
    }

    // If no code or error, just redirect to auth
    return NextResponse.redirect(new URL('/auth', requestUrl.origin));
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(
      new URL('/auth?error=Authentication failed', request.url)
    );
  }
}