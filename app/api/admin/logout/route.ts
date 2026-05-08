import { NextResponse } from 'next/server';

/**
 * POST /api/admin/logout
 * 清除 admin-auth cookie。
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin-auth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return res;
}
