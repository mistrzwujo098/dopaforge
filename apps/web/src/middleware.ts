import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimiters, getRateLimitHeaders, getClientIdentifier } from './lib/api/rate-limiter';

export function middleware(request: NextRequest) {
  // Skip rate limiting for static assets
  if (request.nextUrl.pathname.startsWith('/_next') || 
      request.nextUrl.pathname.startsWith('/static') ||
      request.nextUrl.pathname.includes('.')) {
    return NextResponse.next();
  }

  // Determine which rate limiter to use
  let rateLimiter;
  let endpoint;
  
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    rateLimiter = rateLimiters.auth;
    endpoint = 'auth';
  } else if (request.nextUrl.pathname.startsWith('/api/tasks')) {
    rateLimiter = rateLimiters.tasks;
    endpoint = 'tasks';
  } else if (request.nextUrl.pathname.startsWith('/api')) {
    rateLimiter = rateLimiters.api;
    endpoint = 'api';
  } else {
    // No rate limiting for non-API routes
    return NextResponse.next();
  }

  // Get client identifier
  const clientId = getClientIdentifier(request);
  
  // Check rate limit
  const result = rateLimiter.check(clientId, endpoint);
  
  // Create response
  const response = result.allowed 
    ? NextResponse.next()
    : NextResponse.json(
        { 
          error: 'Too many requests', 
          message: 'Przekroczono limit żądań. Spróbuj ponownie później.',
          retryAfter: new Date(result.resetTime).toISOString(),
        },
        { status: 429 }
      );

  // Add rate limit headers
  const headers = getRateLimitHeaders(result);
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  if (!request.nextUrl.pathname.startsWith('/api')) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https: blob:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vercel.live; " +
      "media-src 'self'; " +
      "frame-src 'self' https://vercel.live;"
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};