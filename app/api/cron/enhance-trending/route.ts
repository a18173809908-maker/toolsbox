import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const expected = process.env.CRON_SECRET;
  if (expected && auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const period = req.nextUrl.searchParams.get('period') ?? undefined;

  const { enhanceTrending } = await import('@/lib/jobs/enhance-trending');
  const result = await enhanceTrending(period);
  return NextResponse.json({ ok: true, period: period ?? 'all', ...result });
}
