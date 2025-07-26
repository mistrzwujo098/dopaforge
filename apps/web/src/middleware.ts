// path: apps/web/src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Check if Supabase environment variables are configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are not configured');
    // Allow access to auth page when Supabase is not configured
    if (req.nextUrl.pathname !== '/auth') {
      return NextResponse.redirect(new URL('/auth', req.url));
    }
    return res;
  }
  
  try {
    const supabase = createMiddlewareClient({ req, res });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If user is signed in and the current path is /auth redirect the user to /dashboard
    if (user && req.nextUrl.pathname === '/auth') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // If user is not signed in and the current path is not /auth redirect the user to /auth
    if (!user && req.nextUrl.pathname !== '/auth') {
      return NextResponse.redirect(new URL('/auth', req.url));
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, redirect to auth page
    if (req.nextUrl.pathname !== '/auth') {
      return NextResponse.redirect(new URL('/auth', req.url));
    }
    return res;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json|icon-.*\.png|screenshot-.*\.png|sounds).*)'],
};