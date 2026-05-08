import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { comparisons } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  if (cookieStore.get('admin-auth')?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { reason?: string };
  const reason = body.reason?.trim() ?? '';

  const result = await db
    .update(comparisons)
    .set({
      status: 'rejected',
      rejectReason: reason || null,
      reviewedBy: 'admin',
      reviewedAt: new Date(),
    })
    .where(eq(comparisons.id, id));

  if (!result.rowCount) {
    return NextResponse.json({ ok: false, error: '对比页不存在' }, { status: 404 });
  }

  revalidatePath('/admin/comparisons');

  return NextResponse.json({ ok: true });
}
