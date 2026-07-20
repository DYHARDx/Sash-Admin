import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from './lib/auth-jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('admin_session_token')?.value;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/forgot-password');
  const isAdminPath = pathname.startsWith('/admin') || (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth'));

  // If trying to access admin pages without token, redirect to login
  if (isAdminPath) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = await verifySessionToken(sessionToken);
    if (!payload) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('admin_session_token');
      return response;
    }
  }

  // If accessing login while already authenticated, redirect to dashboard
  if (isAuthPage) {
    if (sessionToken) {
      const payload = await verifySessionToken(sessionToken);
      if (payload) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

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
