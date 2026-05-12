import { NextRequest, NextResponse } from 'next/server';
import { publishSpotlight } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';

export const runtime = 'nodejs';

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const idNum = Number(id);
  if (!idNum) return NextResponse.json({ ok: false, error: 'invalid id' }, { status: 400 });

  await publishSpotlight(idNum);
  revalidatePath('/spotlight', 'layout');
  revalidatePath(`/spotlight/${idNum}`);

  return NextResponse.json({ ok: true });
}
