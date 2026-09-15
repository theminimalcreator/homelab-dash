import { NextRequest, NextResponse } from 'next/server';
import { computeSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

const PUBLIC_PATHS = ['/login', '/api/login'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const expected = process.env.ADMIN_PASSWORD;
  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (expected && cookie && cookie === (await computeSessionToken(expected))) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.redirect(new URL('/login', req.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
