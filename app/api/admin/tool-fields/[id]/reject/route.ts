import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { adminGuard } from '@/lib/admin/api-guard';
import { rejectToolFieldDraft } from '@/lib/db/queries';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard) return guard;
  const { id } = await params;
  const body = await req.json().catch(() => ({})) as { reason?: string };
  await rejectToolFieldDraft(id, body.reason ?? '');
  revalidatePath('/admin/tool-fields');
  revalidatePath('/admin');
  return NextResponse.json({ ok: true });
}
