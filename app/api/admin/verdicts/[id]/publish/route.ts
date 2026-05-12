import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { adminGuard } from '@/lib/admin/api-guard';
import { publishVerdict } from '@/lib/db/queries';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard) return guard;
  const { id } = await params;
  await publishVerdict(id);
  revalidatePath('/admin/verdicts');
  revalidatePath('/admin');
  return NextResponse.json({ ok: true });
}
