import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { toolCandidates } from '@/lib/db/schema';
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
  const candidateId = parseInt(id, 10);
  if (isNaN(candidateId)) {
    return NextResponse.json({ ok: false, error: 'Invalid id' }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as { reason?: string };
  const reason = body.reason?.trim() ?? '';

  await db
    .update(toolCandidates)
    .set({
      status: 'rejected',
      rejectReason: reason || null,
      reviewedBy: 'admin',
      reviewedAt: new Date(),
    })
    .where(eq(toolCandidates.id, candidateId));

  revalidatePath('/admin/tools');

  return NextResponse.json({ ok: true });
}
