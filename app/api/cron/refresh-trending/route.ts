import { NextRequest, NextResponse } from 'next/server';
import { refreshAllTrending } from '@/lib/jobs/refresh-trending';
import { translateMissingTrending } from '@/lib/jobs/translate-trending';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const expected = process.env.CRON_SECRET;
  if (expected && auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const refresh = await refreshAllTrending();
  const refreshOk = refresh.every((r) => !r.error);

  if (!refreshOk) {
    return NextResponse.json(
      { ok: false, refresh, translate: null },
      { status: 500 },
    );
  }

  const translate = await translateMissingTrending();
  return NextResponse.json({ ok: true, refresh, translate });
}
