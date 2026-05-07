import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const [{ discoverToolSignals }, { fetchToolCandidates }, { processToolCandidates }] = await Promise.all([
      import('@/lib/jobs/discover-tool-signals'),
      import('@/lib/jobs/fetch-tool-candidates'),
      import('@/lib/jobs/process-tool-candidates'),
    ]);
    const [fetchResult, signalResult] = await Promise.all([
      fetchToolCandidates(),
      discoverToolSignals(),
    ]);
    const processResult = await processToolCandidates();
    return NextResponse.json({ ok: true, fetch: fetchResult, signals: signalResult, process: processResult });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
