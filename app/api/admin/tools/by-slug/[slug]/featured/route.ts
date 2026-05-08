import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { tools } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const cookieStore = await cookies();
  if (cookieStore.get('admin-auth')?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;
  const body = (await req.json().catch(() => ({}))) as { featured?: boolean };

  if (typeof body.featured !== 'boolean') {
    return NextResponse.json({ ok: false, error: 'featured 必须是 boolean' }, { status: 400 });
  }

  const result = await db
    .update(tools)
    .set({ featured: body.featured })
    .where(eq(tools.id, slug));

  if ((result.rowCount ?? 0) === 0) {
    return NextResponse.json({ ok: false, error: '工具不存在' }, { status: 404 });
  }

  revalidatePath('/');
  revalidatePath('/admin/featured');
  revalidatePath(`/tools/${slug}`);

  return NextResponse.json({ ok: true, featured: body.featured });
}
