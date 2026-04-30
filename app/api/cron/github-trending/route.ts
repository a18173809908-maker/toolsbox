import { NextRequest, NextResponse } from 'next/server';
import { refreshAllTrending } from '@/lib/jobs/refresh-trending';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const expected = process.env.CRON_SECRET;
  if (expected && auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const result = await refreshAllTrending();
  const ok = result.every((r) => !r.error);
  return NextResponse.json({ ok, result }, { status: ok ? 200 : 500 });
}
