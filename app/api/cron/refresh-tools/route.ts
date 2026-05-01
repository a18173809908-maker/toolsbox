import { NextRequest, NextResponse } from 'next/server';
import { fetchToolCandidates } from '@/lib/jobs/fetch-tool-candidates';
import { processToolCandidates } from '@/lib/jobs/process-tool-candidates';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const fetchResult = await fetchToolCandidates();
    const processResult = await processToolCandidates();
    return NextResponse.json({ ok: true, fetch: fetchResult, process: processResult });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
