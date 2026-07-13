import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const auth = request.cookies.get('coach_auth');
  
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!auth || auth.value !== 'true') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*',
};
