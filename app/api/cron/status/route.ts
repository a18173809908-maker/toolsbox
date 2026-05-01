import { NextRequest, NextResponse } from 'next/server';
import { loadAutomationStatus } from '@/lib/db/queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const status = await loadAutomationStatus();
  return NextResponse.json({
    ok: true,
    checkedAt: new Date().toISOString(),
    ...status,
  });
}
