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
    const [{ refreshAllTrending }, { translateMissingTrending }] = await Promise.all([
      import('@/lib/jobs/refresh-trending'),
      import('@/lib/jobs/translate-trending'),
    ]);

    const refresh = await refreshAllTrending();
    const refreshOk = refresh.every((r) => !r.error);

    if (!refreshOk) {
      console.error('[refresh-trending] scrape errors:', JSON.stringify(refresh));
      return NextResponse.json({ ok: false, refresh, translate: null }, { status: 500 });
    }

    const translate = await translateMissingTrending();
    return NextResponse.json({ ok: true, refresh, translate });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[refresh-trending] uncaught error:', msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
