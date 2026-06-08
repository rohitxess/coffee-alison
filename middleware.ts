import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token    = request.cookies.get('auth_token')?.value;
  const isLogin  = request.nextUrl.pathname === '/';
  const isApi    = request.nextUrl.pathname.startsWith('/api');

  // Allow API routes through
  if (isApi) return NextResponse.next();

  // If not logged in and not on login page → redirect to login
  if (!token && !isLogin) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If logged in and on login page → redirect to home
  if (token && isLogin) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};