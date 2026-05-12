import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return NextResponse.json({ error: 'YOUTUBE_API_KEY not set' });

  const publishedAfter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('q', 'Cursor AI editor');
  url.searchParams.set('type', 'video');
  url.searchParams.set('order', 'viewCount');
  url.searchParams.set('publishedAfter', publishedAfter);
  url.searchParams.set('maxResults', '3');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('key', key);

  try {
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10_000) });
    const data = await res.json();
    return NextResponse.json({ ok: res.ok, status: res.status, keyPrefix: key.slice(0, 8) + '...', data });
  } catch (e) {
    return NextResponse.json({ error: String(e) });
  }
}
