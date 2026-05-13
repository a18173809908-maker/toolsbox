import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const expected = process.env.CRON_SECRET;
  if (expected && auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const { generateRepoSpotlights } = await import('@/lib/jobs/spotlight-repos');
    const result = await generateRepoSpotlights();
    const ok = result.errors.length === 0 || result.generated > 0;
    return NextResponse.json({ ok, ...result }, { status: ok ? 200 : 500 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[repo-spotlight] uncaught error:', msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
