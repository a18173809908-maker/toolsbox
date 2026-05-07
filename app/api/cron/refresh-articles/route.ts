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
    const [{ fetchAllArticles }, { processArticles }] = await Promise.all([
      import('@/lib/jobs/fetch-articles'),
      import('@/lib/jobs/process-articles'),
    ]);
    const fetchResults = await fetchAllArticles();
    const processResult = await processArticles();
    return NextResponse.json({ ok: true, fetch: fetchResults, process: processResult });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
