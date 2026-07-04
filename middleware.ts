import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyFirebaseToken } from './lib/auth-jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminSessionToken = request.cookies.get('admin_session_token')?.value;

  const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/forgot-password');

  if (isAuthPath) {
    if (adminSessionToken) {
      const payload = await verifyFirebaseToken(adminSessionToken);
      if (payload) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  // All other pages in the admin app are protected
  if (!adminSessionToken) {
    console.log('[Middleware] No admin_session_token cookie found. Redirecting to /login.');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifyFirebaseToken(adminSessionToken);
  if (!payload) {
    console.log('[Middleware] verifyFirebaseToken failed (returned null). Redirecting to /login.');
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('admin_session_token');
    return response;
  }

  console.log('[Middleware] Token valid, allowing access to:', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
