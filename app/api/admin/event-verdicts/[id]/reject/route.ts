import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { adminGuard } from '@/lib/admin/api-guard';
import { rejectEventVerdict } from '@/lib/db/queries';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard) return guard;
  const { id } = await params;
  const body = await req.json().catch(() => ({})) as { reason?: string };
  await rejectEventVerdict(id, body.reason ?? '');
  revalidatePath('/admin/event-verdicts');
  revalidatePath('/admin');
  return NextResponse.json({ ok: true });
}
