import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Admin 路径鉴权 middleware（I8.2，sprint-1）。
 *
 * 第一阶段使用简单密码 + cookie：
 * - cookie 名：admin-auth
 * - cookie 值：与环境变量 ADMIN_PASSWORD 完全相等才放行
 * - HttpOnly + Secure（生产）+ SameSite=Lax，由 /api/admin/login 设置
 *
 * 设计权衡：cookie 直接存密码不是最佳实践（应该用签名 session token），
 * 但作为单审核者第一阶段方案足够用。多人协作时升级为 NextAuth Email Magic Link。
 *
 * 路径覆盖：所有 /admin/* 路径（matcher 配置）。例外：/admin/login 本身不需要
 * 鉴权（否则会形成无限重定向）。
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // login 页和登录 API 自身不鉴权
  if (pathname === '/admin/login' || pathname.startsWith('/api/admin/login')) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get('admin-auth')?.value;
  const expected = process.env.ADMIN_PASSWORD;

  // 如果 ADMIN_PASSWORD 未设置（开发误配置），一律拒绝；不要让未设置时变成"无认证"
  if (!expected || !cookie || cookie !== expected) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
