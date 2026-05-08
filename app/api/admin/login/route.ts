import { NextResponse } from 'next/server';

/**
 * POST /api/admin/login
 * Body: { password: string }
 * 成功返回 { ok: true } 并设置 admin-auth cookie；失败返回 401。
 */
export async function POST(req: Request) {
  let password: string | undefined;
  try {
    const body = (await req.json()) as { password?: string };
    password = body.password;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 });
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    // 服务端未配置密码——明确报错而不是误以为通过
    return NextResponse.json(
      { ok: false, error: 'ADMIN_PASSWORD not configured' },
      { status: 500 },
    );
  }

  if (!password || password !== expected) {
    return NextResponse.json({ ok: false, error: 'invalid password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin-auth', password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 天
    path: '/',
  });
  return res;
}
