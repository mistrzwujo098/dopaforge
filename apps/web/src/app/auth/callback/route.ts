import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { validateCSRFToken } from '../../../lib/csrf';

export const dynamic = 'force-dynamic';

// Whitelist of allowed redirect paths
const ALLOWED_REDIRECTS = ['/dashboard', '/settings', '/profile', '/'];

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  let next = requestUrl.searchParams.get('next') ?? '/dashboard';
  
  // Validate redirect URL to prevent open redirect
  if (!ALLOWED_REDIRECTS.includes(next) && !next.startsWith('/')) {
    next = '/dashboard';
  }
  
  if (code) {
    const cookieStore = cookies();
    
    // Validate CSRF token if state parameter is present
    if (state) {
      const storedState = cookieStore.get('auth_state')?.value;
      
      if (!validateCSRFToken(state, storedState)) {
        console.error('CSRF token validation failed');
        return NextResponse.redirect(new URL('/auth?error=Invalid state parameter', request.url));
      }
      
      // Clear the CSRF token cookie after validation
      cookieStore.delete('auth_state');
    }
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Handle error in setting cookies
            }
          },
        },
      }
    );
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Return to auth page with error
  return NextResponse.redirect(new URL('/auth?error=Could not authenticate user', request.url));
}