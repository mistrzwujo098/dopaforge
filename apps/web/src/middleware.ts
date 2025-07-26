import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Skip middleware for static files, API routes, and auth pages
  const path = request.nextUrl.pathname;
  
  if (
    path.includes('.') || // static files
    path.startsWith('/api') ||
    path.startsWith('/_next') ||
    path === '/auth' ||
    path === '/setup' ||
    path.startsWith('/auth/')
  ) {
    return NextResponse.next();
  }

  // For now, just pass through - we'll handle auth in components
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};