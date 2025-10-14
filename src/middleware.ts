import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public paths that don't require authentication
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/api/auth',
    '/api/register',
    '/_next',
    '/favicon.ico',
    '/Images'
  ];

  // Check if the current path is public
  const isPublicPath = publicPaths.some(path => 
    pathname.startsWith(path) || pathname === path
  );

  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }

  // For protected paths, check authentication
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  // If not authenticated, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - api/register (Registration API)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Images (public images)
     */
    '/((?!api/auth|api/register|_next/static|_next/image|favicon.ico|Images).*)',
  ],
};