import { NextRequest, NextResponse } from 'next/server';
import { computeSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const password = typeof body.password === 'string' ? body.password : '';
  const expected = process.env.ADMIN_PASSWORD;

  // Generic error either way — never reveal whether ADMIN_PASSWORD is even set.
  if (!expected || password !== expected) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, await computeSessionToken(expected), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
