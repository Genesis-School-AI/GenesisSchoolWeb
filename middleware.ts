import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userSession = request.cookies.get('user_session');
  const { pathname } = request.nextUrl;

  // If user is logged in and tries to access login page, redirect to home
  if (userSession && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is not logged in and tries to access protected routes, redirect to login
  if (!userSession && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon).*)']
};
