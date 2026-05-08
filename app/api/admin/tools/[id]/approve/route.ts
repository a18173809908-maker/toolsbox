import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { toolCandidates, tools } from '@/lib/db/schema';
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

  const body = (await req.json().catch(() => ({}))) as { zh?: string };

  const [candidate] = await db
    .select()
    .from(toolCandidates)
    .where(eq(toolCandidates.id, candidateId));

  if (!candidate) {
    return NextResponse.json({ ok: false, error: '候选不存在' }, { status: 404 });
  }
  if (!candidate.slug) {
    return NextResponse.json({ ok: false, error: '缺少 slug，无法 approve' }, { status: 400 });
  }
  if (!candidate.catId) {
    return NextResponse.json({ ok: false, error: '缺少分类，无法 approve' }, { status: 400 });
  }

  const zh = body.zh?.trim() || candidate.zh || candidate.description || candidate.name;
  const en = candidate.description || candidate.name;
  const now = new Date();

  const draft = candidate.aiDraft;

  await db
    .insert(tools)
    .values({
      id: candidate.slug,
      name: candidate.name,
      mono: candidate.name.slice(0, 2).toUpperCase(),
      brand: '#111827',
      catId: candidate.catId,
      en,
      zh,
      pricing: candidate.pricing,
      url: candidate.url,
      chinaAccess: candidate.chinaAccess,
      features: candidate.features ?? undefined,
      howToUse: draft?.howToUse ?? undefined,
      faqs: draft?.faqs ?? undefined,
      registerMethod: draft?.registerMethod ?? undefined,
      needsOverseasPhone: draft?.needsOverseasPhone ?? false,
      needsRealName: draft?.needsRealName ?? false,
      overseasPaymentOnly: draft?.overseasPaymentOnly ?? false,
      priceCny: draft?.priceCny ?? undefined,
      miniProgram: draft?.miniProgram ?? undefined,
      appStoreCn: draft?.appStoreCn ?? false,
      publicAccount: draft?.publicAccount ?? undefined,
      cnAlternatives: draft?.cnAlternatives ?? undefined,
      tutorialLinks: draft?.tutorialLinks ?? undefined,
      pricingUpdatedAt: now,
      accessUpdatedAt: now,
      featuresUpdatedAt: now,
      publishedAt: now.toISOString().slice(0, 10),
    })
    .onConflictDoNothing();

  await db
    .update(toolCandidates)
    .set({ status: 'approved', reviewedBy: 'admin', reviewedAt: now, zh })
    .where(eq(toolCandidates.id, candidateId));

  revalidatePath('/admin/tools');
  revalidatePath('/tools');

  return NextResponse.json({ ok: true });
}
