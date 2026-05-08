import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { comparisons } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  if (cookieStore.get('admin-auth')?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const now = new Date();

  const result = await db
    .update(comparisons)
    .set({ status: 'published', publishedAt: now, reviewedBy: 'admin', reviewedAt: now })
    .where(eq(comparisons.id, id));

  if (!result.rowCount) {
    return NextResponse.json({ ok: false, error: '对比页不存在' }, { status: 404 });
  }

  revalidatePath('/admin/comparisons');
  revalidatePath('/compare');
  revalidatePath(`/compare/${id}`);

  return NextResponse.json({ ok: true });
}
