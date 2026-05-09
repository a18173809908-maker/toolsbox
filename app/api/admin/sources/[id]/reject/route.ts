import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { sourceCandidates } from '@/lib/db/schema';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  if (cookieStore.get('admin-auth')?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const candidateId = parseInt(id, 10);
  if (Number.isNaN(candidateId)) {
    return NextResponse.json({ ok: false, error: 'Invalid id' }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as { reason?: string };
  const now = new Date();

  await db
    .update(sourceCandidates)
    .set({
      status: 'rejected',
      rejectReason: body.reason?.trim() || null,
      reviewedBy: 'admin',
      reviewedAt: now,
      updatedAt: now,
    })
    .where(eq(sourceCandidates.id, candidateId));

  revalidatePath('/admin/sources');
  revalidatePath('/admin');

  return NextResponse.json({ ok: true });
}
