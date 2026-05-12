import { NextRequest, NextResponse } from 'next/server';
import { rejectSpotlight } from '@/lib/db/queries';

export const runtime = 'nodejs';

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const idNum = Number(id);
  if (!idNum) return NextResponse.json({ ok: false, error: 'invalid id' }, { status: 400 });

  const body = await req.json().catch(() => ({})) as { reason?: string };
  await rejectSpotlight(idNum, body.reason ?? '');

  return NextResponse.json({ ok: true });
}
