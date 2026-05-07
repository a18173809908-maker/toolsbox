import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { loadAutomationStatus } = await import('@/lib/db/queries');
  const status = await loadAutomationStatus();
  return NextResponse.json({
    ok: true,
    checkedAt: new Date().toISOString(),
    ...status,
  });
}
