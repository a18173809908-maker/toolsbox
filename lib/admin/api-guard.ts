import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function adminGuard(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  if (cookieStore.get('admin-auth')?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
