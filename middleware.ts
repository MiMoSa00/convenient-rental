import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req });
    const isAuth = !!token;
    const isAuthPage =
      req.nextUrl.pathname.startsWith('/login') ||
      req.nextUrl.pathname.startsWith('/register') ||
      req.nextUrl.pathname.startsWith('/api/auth');

    // Allow access to auth pages and API routes without authentication
    if (isAuthPage) {
      if (isAuth && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')) {
        // Redirect authenticated users away from auth pages
        return NextResponse.redirect(new URL('/roommate-request', req.url));
      }
      return null; // Allow access to auth pages
    }

    // For protected routes, redirect to login if not authenticated
    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Always allow access to auth pages and API routes
        if (req.nextUrl.pathname.startsWith('/login') || 
            req.nextUrl.pathname.startsWith('/register') ||
            req.nextUrl.pathname.startsWith('/api/auth') ||
            req.nextUrl.pathname.startsWith('/api/register')) {
          return true;
        }
        
        // For other routes, require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    // Protect these routes (require authentication)
    '/roommate-request/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    // Don't include auth pages in matcher to avoid protecting them
    '/((?!api/auth|api/register|login|register|_next/static|_next/image|favicon.ico|$).*)',
  ],
};