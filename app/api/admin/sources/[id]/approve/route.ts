import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { sourceCandidates, sources } from '@/lib/db/schema';

export async function POST(
  _req: Request,
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

  const [candidate] = await db
    .select()
    .from(sourceCandidates)
    .where(eq(sourceCandidates.id, candidateId));

  if (!candidate) {
    return NextResponse.json({ ok: false, error: '候选不存在' }, { status: 404 });
  }
  if (!candidate.feedUrl) {
    return NextResponse.json({ ok: false, error: '缺少 RSS/Atom Feed，无法加入正式源' }, { status: 400 });
  }

  const now = new Date();
  await db
    .insert(sources)
    .values({
      name: candidate.name,
      url: candidate.url,
      feedUrl: candidate.feedUrl,
      type: 'news',
      lang: candidate.lang,
      active: true,
    })
    .onConflictDoUpdate({
      target: sources.feedUrl,
      set: {
        name: candidate.name,
        url: candidate.url,
        type: 'news',
        lang: candidate.lang,
        active: true,
      },
    });

  await db
    .update(sourceCandidates)
    .set({ status: 'approved', reviewedBy: 'admin', reviewedAt: now, updatedAt: now })
    .where(eq(sourceCandidates.id, candidateId));

  revalidatePath('/admin/sources');
  revalidatePath('/admin');

  return NextResponse.json({ ok: true });
}
